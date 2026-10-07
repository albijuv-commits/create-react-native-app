import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CONDITIONS } from "@data/conditions";
import report from "@data/conditions/sources-report.json";
import { SCENE_IDS, SCENE_STEPS } from "@/lib/slides/catalog";

/** Le 40 condizioni richieste per il lancio della base di conoscenza */
const REQUIRED_IDS = [
  "raffreddore", "influenza", "covid-19", "sinusite", "rinite-allergica", "allergia-acari", "congiuntivite",
  "emicrania", "cefalea-tensiva", "gastroenterite", "reflusso", "colon-irritabile", "cistite",
  "dermatite-atopica", "dermatite-contatto", "orticaria", "acne", "psoriasi", "otite", "faringite-tonsillite",
  "bronchite", "asma", "mal-di-schiena", "distorsione", "tendinite", "insonnia", "apnee-notturne", "bruxismo",
  "ansia", "depressione", "anemia", "ipotiroidismo", "ipertensione", "diabete-tipo-2", "varicella",
  "mononucleosi", "herpes-labiale", "disidratazione", "colpo-di-calore", "intossicazione-monossido",
];

/** Dosaggi e posologie: non devono mai comparire nelle cure */
const DOSAGE_PATTERNS = [
  /\b\d+([.,]\d+)?\s?(mg|mcg|µg|ml|ui)\b/i,
  /\b\d+([.,]\d+)?\s?g\b(?!\w)/i,
  /\b(\d+|una|due|tre|quattro)\s+(compress[ae]|capsul[ae]|gocce|bustin[ae]|supposte|spruzzi|puff|inalazioni)\b/i,
  /\b(\d+|una|due|tre|quattro)\s+volte\s+al\s+giorno\b/i,
  /\bogni\s+\d+\s+ore\b/i,
];

function sentences(text: string): number {
  return text.split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý«])/).filter(Boolean).length;
}

describe("base di conoscenza delle condizioni", () => {
  it("contiene almeno le 40 condizioni richieste", () => {
    const ids = CONDITIONS.map((c) => c.id);
    expect(ids.length).toBeGreaterThanOrEqual(40);
    for (const id of REQUIRED_IDS) expect(ids, `manca ${id}`).toContain(id);
  });

  it("registra in index.ts ogni file della cartella", () => {
    const files = readdirSync(new URL("../../data/conditions/", import.meta.url))
      .filter((f) => f.endsWith(".ts") && f !== "index.ts")
      .map((f) => f.replace(/\.ts$/, ""))
      .sort();
    expect(CONDITIONS.map((c) => c.id).sort()).toEqual(files);
  });

  it("ha ID e nomi unici", () => {
    expect(new Set(CONDITIONS.map((c) => c.id)).size).toBe(CONDITIONS.length);
    expect(new Set(CONDITIONS.map((c) => c.name)).size).toBe(CONDITIONS.length);
  });

  it.each(CONDITIONS.map((c) => [c.id, c] as const))("%s: panoramica di 2-3 frasi", (_, c) => {
    const n = sentences(c.overview);
    expect(n).toBeGreaterThanOrEqual(2);
    expect(n).toBeLessThanOrEqual(3);
  });

  it.each(CONDITIONS.map((c) => [c.id, c] as const))("%s: nessun dosaggio nelle cure", (_, c) => {
    const texts = [
      ...c.treatments.options.flatMap((o) => [o.title, o.text]),
      ...c.treatments.selfCare,
    ];
    for (const t of texts) for (const p of DOSAGE_PATTERNS) expect(t, `dosaggio in: «${t}»`).not.toMatch(p);
  });

  it.each(CONDITIONS.map((c) => [c.id, c] as const))("%s: scena del vetrino valida", (_, c) => {
    expect(SCENE_IDS).toContain(c.animation.scene);
    expect(c.animation.captions).toHaveLength(SCENE_STEPS);
  });

  it.each(CONDITIONS.map((c) => [c.id, c] as const))("%s: i sintomi chiave non sono ripetuti tra gli altri", (_, c) => {
    const key = new Set<string>(c.triage.keySymptoms);
    for (const s of c.triage.otherSymptoms) expect(key.has(s), s).toBe(false);
  });

  it("ogni link delle fonti è stato verificato (npm run check:sources -- --write)", () => {
    const verified = new Map(report.results.map((r) => [r.url, r.ok]));
    for (const c of CONDITIONS) {
      for (const s of c.sources) {
        expect(verified.get(s.url), `${c.id}: link non verificato ${s.url}`).toBe(true);
      }
    }
  });

  it("i casi inventati sono dichiarati come illustrativi", () => {
    for (const c of CONDITIONS) {
      for (const k of c.cases) expect(["illustrativo", "pubblicato"]).toContain(k.kind);
    }
  });
});
