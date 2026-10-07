import type { BodyZoneId } from "@data/vocab/body";
import { SYMPTOMS, type SymptomId } from "@data/vocab/symptoms";
import type { Question } from "./schema";

/** Sempre la prima domanda: l'elenco dei segnali d'allarme, controllato in modo deterministico */
export const RED_FLAG_QUESTION: Question = {
  kind: "redflags",
  id: "segnali-allarme",
  text: "Prima di tutto: hai uno di questi segnali adesso?",
};

export const DURATION_OPTIONS = [
  { id: "meno-di-un-giorno", label: "Meno di un giorno" },
  { id: "1-3-giorni", label: "Da 1 a 3 giorni" },
  { id: "4-7-giorni", label: "Da 4 a 7 giorni" },
  { id: "piu-di-una-settimana", label: "Più di una settimana" },
  { id: "piu-di-un-mese", label: "Più di un mese" },
] as const;

export const DURATION_QUESTION: Question = {
  kind: "choice",
  id: "durata",
  text: "Da quanto tempo hai questi disturbi?",
  options: DURATION_OPTIONS.map((o) => ({ ...o })),
};

export const INTENSITY_QUESTION: Question = {
  kind: "scale",
  id: "intensita",
  text: "Quanto ti disturbano, da 0 a 10?",
};

/** Le domande fisse con cui comincia ogni intervista */
export const CORE_QUESTIONS: Question[] = [RED_FLAG_QUESTION, DURATION_QUESTION, INTENSITY_QUESTION];

const LABELS = new Map<string, string>(SYMPTOMS.map((s) => [s.id, s.label]));

export function symptomQuestionId(id: SymptomId): string {
  return `sintomo-${id}`;
}

/** «Hai anche questo sintomo: naso chiuso?» */
export function symptomQuestion(id: SymptomId): Question {
  const label = LABELS.get(id) ?? id;
  return {
    kind: "yesno",
    id: symptomQuestionId(id),
    text: `Hai anche questo sintomo: ${label.charAt(0).toLowerCase()}${label.slice(1)}?`,
    symptomId: id,
  };
}

/** Sintomi generali da chiedere quando mancano elementi per distinguere */
export const GENERAL_SYMPTOMS: SymptomId[] = ["febbre", "stanchezza", "nausea", "mal-di-testa", "capogiri"];

/** I sintomi del vocabolario legati alle zone toccate sulla mappa del corpo, nell'ordine del vocabolario */
export function zoneSymptoms(zones: readonly BodyZoneId[]): SymptomId[] {
  if (!zones.length) return [];
  const set = new Set<BodyZoneId>(zones);
  return SYMPTOMS.filter((s) => (s.zones as readonly BodyZoneId[]).some((z) => set.has(z))).map((s) => s.id);
}
