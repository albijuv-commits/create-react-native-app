/**
 * Regime di fornitura: dal testo per esteso dell'anagrafica AIFA alla sigla, e dalla sigla al
 * badge mostrato nell'app.
 *
 * | Sigla              | Badge                         |
 * | OTC, SOP           | Senza ricetta (verde)         |
 * | RR, RNR, RRL, RNRL, RMR | Con ricetta              |
 * | OSP                | Solo uso ospedaliero          |
 * | USPL               | Solo uso dello specialista    |
 * RNRL e USPL non sono nella tabella della specifica ma compaiono nei dati: RNRL si compra in
 * farmacia con una ricetta limitativa, USPL non si compra affatto (lo usa lo specialista).
 */
export const SUPPLY_CODES = ["OTC", "SOP", "RR", "RNR", "RRL", "RNRL", "RMR", "OSP", "USPL"] as const;
export type SupplyCode = (typeof SUPPLY_CODES)[number];

export type SupplyBadge = "senza-ricetta" | "con-ricetta" | "ospedaliero" | "specialista" | "non-indicato";

/** I testi esatti della colonna FORNITURA di confezioni_fornitura.csv (AIFA) */
const AIFA_TEXTS: ReadonlyArray<[RegExp, SupplyCode]> = [
  [/^medicinali non soggetti a prescrizione medica,? da banco\.?$/, "OTC"],
  [/^medicinali non soggetti a prescrizione medica,? ma non da banco\.?$/, "SOP"],
  [/^medicinali soggetti a prescrizione medica limitativa, da rinnovare volta per volta, vendibili al pubblico su prescrizione di centri ospedalieri o di specialisti\.?$/, "RNRL"],
  [/^medicinali soggetti a prescrizione medica limitativa, vendibili al pubblico su prescrizione di centri ospedalieri o di specialisti\.?$/, "RRL"],
  [/^medicinali soggetti a prescrizione medica limitativa, utilizzabili esclusivamente in ambiente ospedaliero o in una struttura ad esso assimilabile\.?$/, "OSP"],
  [/^medicinali soggetti a prescrizione medica limitativa, utilizzabili esclusivamente dallo specialista\.?$/, "USPL"],
  [/^medicinali soggetti a prescrizione medica speciale con ricetta ministeriale a ricalco\.?$/, "RMR"],
  [/^medicinali soggetti a prescrizione medica da rinnovare volta per volta\.?$/, "RNR"],
  [/^medicinali soggetti a prescrizione medica\.?$/, "RR"],
];

/** Accetta sia la sigla (OTC, RR, …) sia il testo per esteso dell'AIFA; null se non si riconosce */
export function supplyCodeFrom(value: string | null | undefined): SupplyCode | null {
  if (!value) return null;
  const v = value.trim().replace(/\s+/g, " ");
  const upper = v.toUpperCase();
  if ((SUPPLY_CODES as readonly string[]).includes(upper)) return upper as SupplyCode;
  const lower = v.toLowerCase();
  return AIFA_TEXTS.find(([re]) => re.test(lower))?.[1] ?? null;
}

export function supplyBadge(code: SupplyCode | null): SupplyBadge {
  switch (code) {
    case "OTC":
    case "SOP":
      return "senza-ricetta";
    case "RR":
    case "RNR":
    case "RRL":
    case "RNRL":
    case "RMR":
      return "con-ricetta";
    case "OSP":
      return "ospedaliero";
    case "USPL":
      return "specialista";
    default:
      return "non-indicato";
  }
}

export const SUPPLY_BADGE_LABEL: Record<SupplyBadge, string> = {
  "senza-ricetta": "Senza ricetta",
  "con-ricetta": "Con ricetta",
  ospedaliero: "Solo uso ospedaliero",
  specialista: "Solo uso dello specialista",
  "non-indicato": "Regime non indicato",
};

/** Spiegazione breve della sigla, per la scheda */
export const SUPPLY_CODE_DESCRIPTION: Record<SupplyCode, string> = {
  OTC: "Medicinale da banco: non serve la ricetta.",
  SOP: "Senza obbligo di prescrizione: non serve la ricetta, lo chiedi al farmacista.",
  RR: "Serve la ricetta del medico, che si può usare più volte entro la sua validità.",
  RNR: "Serve una nuova ricetta del medico ogni volta.",
  RRL: "Serve la ricetta di un centro ospedaliero o di uno specialista.",
  RNRL: "Serve ogni volta la ricetta di un centro ospedaliero o di uno specialista.",
  RMR: "Serve la ricetta ministeriale speciale.",
  OSP: "Si usa solo in ospedale o in strutture simili: non si compra in farmacia.",
  USPL: "Lo usa solo lo specialista: non si compra in farmacia.",
};

/** Le sigle che un filtro «senza ricetta» / «con ricetta» comprende */
export const SUPPLY_FILTER: Record<"senza" | "con" | "ospedale", readonly SupplyCode[]> = {
  senza: ["OTC", "SOP"],
  con: ["RR", "RNR", "RRL", "RNRL", "RMR"],
  ospedale: ["OSP", "USPL"],
};
