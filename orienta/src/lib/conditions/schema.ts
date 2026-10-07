import { z } from "zod";
import { BODY_AREA_IDS, BODY_ZONE_IDS } from "@data/vocab/body";
import { SPECIALTY_IDS } from "@data/vocab/specialties";
import { SYMPTOM_IDS } from "@data/vocab/symptoms";
import { urgencyLevelSchema } from "@/lib/design/urgency";
import { sceneSpecSchema } from "@/lib/slides/catalog";

const text = z.string().trim().min(1);
const list = (min = 1) => z.array(text).min(min);

export const SOURCE_PUBLISHERS = [
  "ISSalute",
  "Ministero della Salute",
  "NHS",
  "MedlinePlus",
  "EpiCentro",
] as const;

export const sourceSchema = z.object({
  publisher: z.enum(SOURCE_PUBLISHERS),
  title: text,
  url: z.url({ protocol: /^https$/ }),
  lang: z.enum(["it", "en"]),
});
export type Source = z.infer<typeof sourceSchema>;

export const historyEventSchema = z.object({
  /** Quando: un anno ("1956"), un secolo ("XVII secolo") o un periodo ("anni '50") */
  when: text,
  text,
});

export const clinicalCaseSchema = z.discriminatedUnion("kind", [
  /** Caso inventato a scopo illustrativo: l'interfaccia lo dichiara sempre come tale */
  z.object({ kind: z.literal("illustrativo"), title: text, story: text, lesson: text }),
  /** Caso storico o case report pubblicato, riassunto con link alla fonte */
  z.object({ kind: z.literal("pubblicato"), title: text, story: text, lesson: text, source: sourceSchema }),
]);
export type ClinicalCase = z.infer<typeof clinicalCaseSchema>;

export const conditionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    name: text,
    /** Altri nomi con cui la si cerca (es. "influenza intestinale") */
    aliases: z.array(text),
    areas: z.array(z.enum(BODY_AREA_IDS)).min(1),
    bodyZones: z.array(z.enum(BODY_ZONE_IDS)).min(1),

    /** 1. Panoramica in linguaggio semplice, 2-3 frasi */
    overview: text,
    /** 2. Com'è fatta: scena del vetrino con una didascalia per passo */
    animation: sceneSpecSchema,
    /** 3. Storia */
    history: z.object({ nameOrigin: text, events: z.array(historyEventSchema).min(3) }),
    /** 4. Casi clinici (1-2) */
    cases: z.array(clinicalCaseSchema).min(1).max(2),
    /** 5. Cause e fattori di rischio */
    causes: list(),
    riskFactors: list(),
    /** 6. Sintomi */
    symptoms: z.object({ typical: list(2), lessCommon: list() }),
    /** 7. Cure possibili: categorie e consigli, mai dosaggi */
    treatments: z.object({
      options: z.array(z.object({ title: text, text })).min(1),
      selfCare: list(),
    }),
    /** 8. Quando andare dal medico */
    whenToSeeDoctor: z.object({ routine: list(), urgent: list() }),
    /** 9. Prevenzione */
    prevention: list(),
    /** 10. Specialista di riferimento */
    specialist: z.object({ id: z.enum(SPECIALTY_IDS), why: text }),
    /** 11. Fonti */
    sources: z.array(sourceSchema).min(2),

    /** Dati per l'intervista (fase 3) */
    triage: z.object({
      /** false per condizioni che di solito non danno sintomi (es. pressione alta) */
      matchable: z.boolean(),
      keySymptoms: z.array(z.enum(SYMPTOM_IDS)),
      otherSymptoms: z.array(z.enum(SYMPTOM_IDS)),
      moreLikelyIf: list(),
      lessLikelyIf: list(),
      typicalUrgency: urgencyLevelSchema,
    }),

    reviewStatus: z.enum(["da revisionare", "revisionato"]),
    /** Data dell'ultimo aggiornamento dei contenuti (AAAA-MM-GG) */
    updatedAt: z.iso.date(),
  })
  .superRefine((c, ctx) => {
    if (c.triage.matchable && c.triage.keySymptoms.length < 2) {
      ctx.addIssue({ code: "custom", path: ["triage", "keySymptoms"], message: "Servono almeno 2 sintomi chiave" });
    }
  });

/** Tipo usato dai file della base di conoscenza */
export type ConditionInput = z.input<typeof conditionSchema>;
export type Condition = z.output<typeof conditionSchema>;
