import "server-only";
import { CONDITIONS } from "@data/conditions";
import sourcesReport from "@data/conditions/sources-report.json";
import { bodyAreaLabel } from "@data/vocab/body";
import { SYMPTOMS } from "@data/vocab/symptoms";
import type { SceneSpec } from "@/lib/slides/catalog";
import type { TriageCondition } from "@/lib/triage/engine";
import type { Condition } from "./schema";
import { normalizeSearch, type ConditionListItem } from "./search";

export function getCondition(id: string): Condition | undefined {
  return CONDITIONS.find((c) => c.id === id);
}

export function conditionIds(): string[] {
  return CONDITIONS.map((c) => c.id);
}

/** Data dell'ultima verifica automatica dei link delle fonti (scripts/check-sources.ts) */
export const SOURCES_CHECKED_AT: string = sourcesReport.checkedAt;

function firstSentence(text: string): string {
  return text.split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý«])/)[0] ?? text;
}

/** L'elenco delle condizioni in ordine alfabetico, con i testi su cui cercare */
export function conditionListItems(): ConditionListItem[] {
  return CONDITIONS.map((c) => {
    const symptomIds = new Set<string>([...c.triage.keySymptoms, ...c.triage.otherSymptoms]);
    const symptomWords = SYMPTOMS.filter((s) => symptomIds.has(s.id)).flatMap((s) => [s.label, ...s.synonyms]);
    return {
      id: c.id,
      name: c.name,
      aliases: c.aliases,
      areas: c.areas,
      teaser: firstSentence(c.overview),
      animation: c.animation,
      index: {
        name: normalizeSearch(c.name),
        aliases: normalizeSearch(c.aliases.join(" ")),
        rest: normalizeSearch([...symptomWords, ...c.symptoms.typical, ...c.areas.map(bodyAreaLabel)].join(" ")),
      },
    };
  }).sort((a, b) => a.name.localeCompare(b.name, "it"));
}

/** «2026-10-07» → «7 ottobre 2026» */
export function formatItalianDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1)),
  );
}

function triageFields(c: Condition): TriageCondition {
  return {
    id: c.id,
    name: c.name,
    matchable: c.triage.matchable,
    keySymptoms: c.triage.keySymptoms,
    otherSymptoms: c.triage.otherSymptoms,
    typicalUrgency: c.triage.typicalUrgency,
    bodyZones: c.bodyZones,
    specialistId: c.specialist.id,
    moreLikelyIf: c.triage.moreLikelyIf,
    lessLikelyIf: c.triage.lessLikelyIf,
  };
}

/** I dati delle condizioni che servono al motore dell'intervista (molto più leggeri delle schede complete) */
export function triageConditions(): TriageCondition[] {
  return CONDITIONS.map(triageFields);
}

/** Per l'interfaccia dell'intervista: i dati del motore più l'anteprima del vetrino e la prima frase */
export interface InterviewCondition extends TriageCondition {
  teaser: string;
  animation: SceneSpec;
}

export function interviewConditions(): InterviewCondition[] {
  return CONDITIONS.map((c) => ({ ...triageFields(c), teaser: firstSentence(c.overview), animation: c.animation }));
}

/** Per la sezione Medici: nome della condizione e specialista di riferimento, per chi arriva da una scheda o dai risultati */
export function conditionSpecialists(): Record<string, { name: string; specialist: Condition["specialist"]["id"] }> {
  return Object.fromEntries(CONDITIONS.map((c) => [c.id, { name: c.name, specialist: c.specialist.id }]));
}
