/** Primo livello della classificazione ATC, con i nomi dell'anagrafica ATC dell'AIFA (atc.csv) */
export const ATC_GROUPS = {
  A: "Apparato gastrointestinale e metabolismo",
  B: "Sangue e organi emopoietici",
  C: "Sistema cardiovascolare",
  D: "Dermatologici",
  G: "Sistema genito-urinario e ormoni sessuali",
  H: "Preparati ormonali sistemici, esclusi gli ormoni sessuali",
  J: "Antimicrobici generali per uso sistemico",
  L: "Farmaci antineoplastici e immunomodulatori",
  M: "Sistema muscolo-scheletrico",
  N: "Sistema nervoso",
  P: "Farmaci antiparassitari, insetticidi e repellenti",
  R: "Sistema respiratorio",
  S: "Organi di senso",
  V: "Vari",
} as const;

export type AtcGroup = keyof typeof ATC_GROUPS;

export function atcGroupLabel(code: string | null | undefined): string | null {
  return code && code in ATC_GROUPS ? ATC_GROUPS[code as AtcGroup] : null;
}
