/**
 * Le forme farmaceutiche dell'AIFA (oltre 200 diciture) raggruppate nelle famiglie che hanno
 * un'illustrazione nell'app. La descrizione della confezione serve a riconoscere le bustine.
 */
export const FORM_FAMILIES = ["compresse", "capsule", "sciroppo", "bustine", "spray-nasale", "collirio", "crema", "altro"] as const;
export type FormFamily = (typeof FORM_FAMILIES)[number];

export const FORM_FAMILY_LABEL: Record<FormFamily, string> = {
  compresse: "Compresse",
  capsule: "Capsule",
  sciroppo: "Sciroppi e gocce",
  bustine: "Bustine",
  "spray-nasale": "Spray nasali",
  collirio: "Colliri",
  crema: "Creme e gel",
  altro: "Altre forme",
};

const ORAL_POWDER = /^(granulato|polvere (per soluzione|per sospensione|orale)|polvere effervescente)/;

export function formFamily(aifaForm: string, packageDescription = ""): FormFamily {
  const form = aifaForm.trim().toLowerCase();
  const desc = packageDescription.toLowerCase();
  if (/spray nasale|gocce nasali|soluzione nasale|polvere nasale/.test(form)) return "spray-nasale";
  if (/^collirio/.test(form)) return "collirio";
  if (/^capsul/.test(form)) return "capsule";
  if (/^(compress|pastiglia|confett)/.test(form)) return "compresse";
  if (ORAL_POWDER.test(form) && (/bustin/.test(form) || /bustin/.test(desc))) return "bustine";
  if (/^granulato/.test(form)) return "bustine";
  if (/^(sciroppo|soluzione orale|sospensione orale|gocce orali|emulsione orale)/.test(form) || ORAL_POWDER.test(form)) return "sciroppo";
  if (/^(crema|gel|pomata|unguento|schiuma cutanea|emulsione cutanea|pasta cutanea|lozione|spray cutaneo|soluzione cutanea)/.test(form)) return "crema";
  return "altro";
}
