import type { BodyZoneId } from "@data/vocab/body";
import type { SpecialtyId } from "@data/vocab/specialties";
import type { SymptomId } from "@data/vocab/symptoms";
import { maxUrgency, type UrgencyLevel } from "@/lib/design/urgency";
import { CORE_QUESTIONS, GENERAL_SYMPTOMS, RED_FLAG_QUESTION, symptomQuestion, symptomQuestionId, zoneSymptoms } from "./questions";
import { detectRedFlags } from "./red-flags";
import {
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  type Compatibility,
  type Question,
  type ResultCondition,
  type TriageRequest,
  type TriageResponse,
} from "./schema";

/** Ciò che il motore conosce di ogni condizione: solo dati della base di conoscenza */
export interface TriageCondition {
  id: string;
  name: string;
  matchable: boolean;
  keySymptoms: SymptomId[];
  otherSymptoms: SymptomId[];
  typicalUrgency: UrgencyLevel;
  bodyZones: BodyZoneId[];
  specialistId: SpecialtyId;
  moreLikelyIf: string[];
  lessLikelyIf: string[];
}

export interface ScoredCondition {
  condition: TriageCondition;
  /** Punteggio grezzo e normalizzato (0-1) */
  raw: number;
  score: number;
  matching: SymptomId[];
}

/* -------------------------------------------------------------- Stato dalle risposte */

export function symptomEvidence(req: TriageRequest): { present: Set<SymptomId>; absent: Set<SymptomId> } {
  const present = new Set<SymptomId>(req.symptoms);
  const absent = new Set<SymptomId>();
  for (const a of req.answers) {
    if (a.kind !== "yesno" || a.question.kind !== "yesno" || !a.question.symptomId) continue;
    if (a.value === "si") present.add(a.question.symptomId);
    if (a.value === "no") absent.add(a.question.symptomId);
  }
  for (const s of absent) present.delete(s);
  return { present, absent };
}

export function checkedRedFlags(req: TriageRequest) {
  return req.answers.flatMap((a) => (a.kind === "redflags" ? a.value : []));
}

/**
 * Controllo deterministico dei segnali d'allarme su tutto ciò che la persona ha detto: il testo,
 * le voci spuntate e anche le domande a cui ha risposto «sì» (se una domanda, magari scritta
 * dall'AI, chiede «Fai fatica a respirare?», il «sì» fa scattare l'allarme).
 */
export function redFlagsFor(req: TriageRequest) {
  const confirmed = req.answers.flatMap((a) => (a.kind === "yesno" && a.value === "si" ? [a.question.text] : []));
  return detectRedFlags({
    text: [req.text, ...confirmed].join(". "),
    checked: checkedRedFlags(req),
    symptoms: [...symptomEvidence(req).present],
  });
}

function answerValue(req: TriageRequest, questionId: string) {
  return req.answers.find((a) => a.question.id === questionId)?.value;
}

/* ------------------------------------------------------------------- Punteggio */

/**
 * Quanto pesa un sintomo riferito che la condizione non spiega. La febbre pesa di più: separa
 * bene le infezioni da allergie, dolori e disturbi della pelle.
 */
const UNEXPLAINED_PENALTY = 0.35;
const UNEXPLAINED_FEVER_PENALTY = 2;

export function scoreConditions(conditions: readonly TriageCondition[], req: TriageRequest): ScoredCondition[] {
  const { present, absent } = symptomEvidence(req);
  const zones = new Set(req.zones);
  return conditions
    .filter((c) => c.matchable)
    .map((c) => {
      const keyHits = c.keySymptoms.filter((s) => present.has(s));
      const otherHits = c.otherSymptoms.filter((s) => present.has(s));
      const keyMiss = c.keySymptoms.filter((s) => absent.has(s)).length;
      const otherMiss = c.otherSymptoms.filter((s) => absent.has(s)).length;
      const hits = keyHits.length + otherHits.length;
      const zoneBonus = hits > 0 && c.bodyZones.some((z) => zones.has(z)) ? 0.5 : 0;
      const known = new Set<SymptomId>([...c.keySymptoms, ...c.otherSymptoms]);
      const unexplained = [...present].reduce((sum, s) => (known.has(s) ? sum : sum + (s === "febbre" ? UNEXPLAINED_FEVER_PENALTY : UNEXPLAINED_PENALTY)), 0);
      // I sintomi chiave pesano tre volte gli altri; un sintomo chiave assente pesa molto più di uno facoltativo
      const raw = 3 * keyHits.length + otherHits.length - 1.5 * keyMiss - 0.2 * otherMiss + zoneBonus - unexplained;
      const max = 3 * c.keySymptoms.length + Math.min(c.otherSymptoms.length, 2);
      return { condition: c, raw, score: Math.max(0, Math.min(1, raw / max)), matching: [...keyHits, ...otherHits] };
    })
    .filter((s) => s.matching.length > 0 && s.raw > 0)
    .sort((a, b) => b.score - a.score || b.raw - a.raw || a.condition.name.localeCompare(b.condition.name, "it"));
}

function confident(scored: ScoredCondition[]): boolean {
  const [first, second] = scored;
  return !!first && first.score >= 0.6 && (!second || first.score - second.score >= 0.2);
}

/** Quanto conta confermare (o escludere) le condizioni in testa rispetto a distinguerle tra loro */
const CONFIRM_WEIGHT = 0.35;

/**
 * Sintomi da chiedere, dal più utile. Conta quanto il sintomo pesa nelle condizioni più probabili
 * (i sintomi chiave il doppio degli altri) e quanto le divide tra loro: con una sola condizione in
 * vista si confermano prima i suoi sintomi chiave; con più condizioni vincono quelli che le separano.
 */
export function discriminatingSymptoms(scored: ScoredCondition[], req: TriageRequest): SymptomId[] {
  const { present, absent } = symptomEvidence(req);
  const asked = new Set(req.answers.map((a) => a.question.id));
  const top = scored.slice(0, 6);
  const weight = (i: number) => 1 / (i + 1);
  const total = top.reduce((sum, _, i) => sum + weight(i), 0);
  const relevance = new Map<SymptomId, number>();
  const share = new Map<SymptomId, number>();
  top.forEach((s, i) => {
    const w = weight(i);
    for (const sym of s.condition.keySymptoms) relevance.set(sym, (relevance.get(sym) ?? 0) + w);
    for (const sym of s.condition.otherSymptoms) relevance.set(sym, (relevance.get(sym) ?? 0) + w / 2);
    for (const sym of new Set([...s.condition.keySymptoms, ...s.condition.otherSymptoms])) share.set(sym, (share.get(sym) ?? 0) + w);
  });
  return [...relevance.entries()]
    .filter(([sym]) => !present.has(sym) && !absent.has(sym) && !asked.has(symptomQuestionId(sym)))
    .map(([sym, rel]) => ({ sym, value: rel * (1 - (share.get(sym) ?? 0) / total + CONFIRM_WEIGHT) }))
    .sort((a, b) => b.value - a.value)
    .map((c) => c.sym);
}

/** Le prossime domande, oppure nessuna quando è il momento dei risultati (da 5 a 12 in tutto) */
export function nextQuestions(conditions: readonly TriageCondition[], req: TriageRequest): Question[] {
  const answered = req.answers.length;
  const asked = new Set(req.answers.map((a) => a.question.id));
  if (answered >= MAX_QUESTIONS) return [];

  const scored = scoreConditions(conditions, req);
  const fixed = CORE_QUESTIONS.filter((q) => !asked.has(q.id));
  let symptoms = discriminatingSymptoms(scored, req);
  if (answered >= MIN_QUESTIONS && fixed.length === 0 && (confident(scored) || symptoms.length === 0)) return [];

  if (symptoms.length === 0) {
    // Nessuna condizione in vista: si parte dai sintomi delle zone toccate, poi da quelli generali
    const { present, absent } = symptomEvidence(req);
    symptoms = [...new Set([...zoneSymptoms(req.zones), ...GENERAL_SYMPTOMS])].filter(
      (s) => !present.has(s) && !absent.has(s) && !asked.has(symptomQuestionId(s)),
    );
  }
  const room = MAX_QUESTIONS - answered;
  const batch = [...fixed, ...symptoms.slice(0, Math.max(0, Math.min(4, room - fixed.length))).map(symptomQuestion)];
  // Il primo gruppo arriva almeno a 5 domande
  const needed = Math.max(0, MIN_QUESTIONS - answered - batch.length);
  if (needed > 0) {
    const extra = symptoms.slice(batch.length - fixed.length, batch.length - fixed.length + needed).map(symptomQuestion);
    batch.push(...extra);
  }
  return batch.slice(0, room);
}

/* ---------------------------------------------------------------- Urgenza */

const URGENCY_ORDER: readonly UrgencyLevel[] = ["home", "gp", "soon", "er"];

/** Il livello minimo di urgenza dettato dalle risposte: mai scavalcato verso il basso, nemmeno dall'AI */
export function urgencyFloor(req: TriageRequest, unidentified: boolean): UrgencyLevel {
  const levels: UrgencyLevel[] = ["home"];
  const duration = answerValue(req, "durata");
  if (duration === "piu-di-una-settimana" || duration === "piu-di-un-mese") levels.push("gp");
  const intensity = answerValue(req, "intensita");
  if (typeof intensity === "number") {
    if (intensity >= 8) levels.push("soon");
    else if (intensity >= 6) levels.push("gp");
  }
  const { present } = symptomEvidence(req);
  if (req.profile.age < 1) levels.push("soon");
  else if (req.profile.age < 3 && present.has("febbre")) levels.push("soon");
  if (req.profile.age >= 75) levels.push("gp");
  if (req.profile.pregnancy === "si") levels.push("gp");
  if (unidentified) levels.push("gp");
  return maxUrgency(levels);
}

export function compatibilityFor(score: number): Compatibility {
  if (score >= 0.55) return "alta";
  if (score >= 0.3) return "media";
  return "bassa";
}

/**
 * L'urgenza segue le condizioni più compatibili (quelle ad alta compatibilità, o la prima se
 * nessuna lo è); in più contano sempre le condizioni urgenti almeno a media compatibilità,
 * così un'ipotesi pericolosa non viene coperta da una più probabile ma lieve.
 */
export function urgencyFor(
  req: TriageRequest,
  results: readonly ResultCondition[],
  byId: ReadonlyMap<string, TriageCondition>,
  unidentified: boolean,
): UrgencyLevel {
  const urgencyOf = (r: ResultCondition) => byId.get(r.id)?.typicalUrgency;
  const high = results.filter((r) => r.compatibility === "alta");
  const primary = high.length ? high : results.slice(0, 1);
  const pressing = results.filter((r) => r.compatibility !== "bassa" && (urgencyOf(r) === "er" || urgencyOf(r) === "soon"));
  const levels = [...primary, ...pressing].flatMap((r) => {
    const u = urgencyOf(r);
    return u ? [u] : [];
  });
  const base = levels.length ? maxUrgency(levels) : "gp";
  return maxUrgency([base, urgencyFloor(req, unidentified)]);
}

export function isMoreUrgent(a: UrgencyLevel, b: UrgencyLevel): boolean {
  return URGENCY_ORDER.indexOf(a) > URGENCY_ORDER.indexOf(b);
}

/* --------------------------------------------------------------- Risultati */

export function rulesResults(conditions: readonly TriageCondition[], req: TriageRequest): Extract<TriageResponse, { kind: "results" }> {
  const byId = new Map(conditions.map((c) => [c.id, c]));
  const scored = scoreConditions(conditions, req);
  const top = scored.slice(0, 5);
  const results: ResultCondition[] = top.map((s) => ({
    id: s.condition.id,
    compatibility: compatibilityFor(s.score),
    matchingSymptoms: s.matching,
  }));
  const unidentified = results.length === 0;
  return { kind: "results", source: "regole", urgency: urgencyFor(req, results, byId, unidentified), unidentified, conditions: results };
}

/** Un passo dell'intervista con il motore a regole: emergenza, altre domande o risultati */
export function rulesStep(conditions: readonly TriageCondition[], req: TriageRequest): TriageResponse {
  const flags = redFlagsFor(req);
  if (flags.length) return { kind: "emergency", flags };
  const questions = nextQuestions(conditions, req);
  if (questions.length) return { kind: "questions", source: "regole", questions };
  return rulesResults(conditions, req);
}

export { RED_FLAG_QUESTION };
