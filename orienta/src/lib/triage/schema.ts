import { z } from "zod";
import { RED_FLAG_IDS } from "@data/emergency/red-flags";
import { BODY_ZONE_IDS } from "@data/vocab/body";
import { SYMPTOM_IDS } from "@data/vocab/symptoms";
import { urgencyLevelSchema } from "@/lib/design/urgency";

/* ------------------------------------------------------------------ Domande */

const questionId = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(48);
const questionText = z.string().trim().min(8).max(160);

export const choiceOptionSchema = z.object({
  id: questionId,
  label: z.string().trim().min(1).max(60),
});

export const questionSchema = z.discriminatedUnion("kind", [
  /** Sì / No / Non so; se riguarda un sintomo del vocabolario, `symptomId` lo collega */
  z.object({ kind: z.literal("yesno"), id: questionId, text: questionText, symptomId: z.enum(SYMPTOM_IDS).nullable() }),
  /** Una scelta tra opzioni (più «Non so», sempre aggiunto dall'interfaccia) */
  z.object({ kind: z.literal("choice"), id: questionId, text: questionText, options: z.array(choiceOptionSchema).min(2).max(6) }),
  /** Intensità da 0 a 10 */
  z.object({ kind: z.literal("scale"), id: questionId, text: questionText }),
  /** L'elenco dei segnali d'allarme: si spuntano quelli presenti */
  z.object({ kind: z.literal("redflags"), id: questionId, text: questionText }),
]);
export type Question = z.infer<typeof questionSchema>;

export const NON_SO = "non-so" as const;

export const answerSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("yesno"), question: questionSchema, value: z.enum(["si", "no", NON_SO]) }),
  z.object({ kind: z.literal("choice"), question: questionSchema, value: z.union([questionId, z.literal(NON_SO)]) }),
  z.object({ kind: z.literal("scale"), question: questionSchema, value: z.union([z.number().int().min(0).max(10), z.literal(NON_SO)]) }),
  z.object({ kind: z.literal("redflags"), question: questionSchema, value: z.array(z.enum(RED_FLAG_IDS)).max(RED_FLAG_IDS.length) }),
]);
export type Answer = z.infer<typeof answerSchema>;

/* ---------------------------------------------------------------- Persona */

export const profileSchema = z.object({
  age: z.number().int().min(0).max(120),
  sex: z.enum(["femmina", "maschio", "altro", "non-indicato"]),
  pregnancy: z.enum(["si", "no", NON_SO, "non-applicabile"]),
});
export type Profile = z.infer<typeof profileSchema>;

/* -------------------------------------------------------- Richiesta e risposta */

export const MIN_QUESTIONS = 5;
export const MAX_QUESTIONS = 12;

export const triageRequestSchema = z.object({
  profile: profileSchema,
  text: z.string().max(1000),
  symptoms: z.array(z.enum(SYMPTOM_IDS)).max(40),
  zones: z.array(z.enum(BODY_ZONE_IDS)).max(BODY_ZONE_IDS.length),
  answers: z.array(answerSchema).max(MAX_QUESTIONS),
});
export type TriageRequest = z.infer<typeof triageRequestSchema>;

export const compatibilitySchema = z.enum(["bassa", "media", "alta"]);
export type Compatibility = z.infer<typeof compatibilitySchema>;

export const resultConditionSchema = z.object({
  id: z.string(),
  compatibility: compatibilitySchema,
  /** I sintomi della persona che corrispondono alla condizione */
  matchingSymptoms: z.array(z.enum(SYMPTOM_IDS)),
});
export type ResultCondition = z.infer<typeof resultConditionSchema>;

export const engineSourceSchema = z.enum(["ai", "regole"]);

export const triageResponseSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("emergency"), flags: z.array(z.enum(RED_FLAG_IDS)).min(1) }),
  z.object({ kind: z.literal("questions"), source: engineSourceSchema, questions: z.array(questionSchema).min(1).max(MAX_QUESTIONS) }),
  z.object({
    kind: z.literal("results"),
    source: engineSourceSchema,
    urgency: urgencyLevelSchema,
    /** Nessuna condizione della base di conoscenza è compatibile */
    unidentified: z.boolean(),
    conditions: z.array(resultConditionSchema).max(5),
  }),
]);
export type TriageResponse = z.infer<typeof triageResponseSchema>;
