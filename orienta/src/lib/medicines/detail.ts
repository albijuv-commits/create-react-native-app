import "server-only";
import { euBrandsFor } from "./eu-brands-data";
import type { FormFamily } from "./forms";
import { brandsOf, catalogInfo, equivalentsOf, getMedicine } from "./queries";
import { medicineDetailResponseSchema, type MedicineDetailResponse } from "./types";

/**
 * Tutto ciò che serve alla scheda di una confezione in una sola risposta, per chi la mostra fuori
 * dalla web app (l'app nativa): gli stessi dati della pagina /mercato/[aic], passati da Zod.
 */
export function medicineDetailFor(aic: string): MedicineDetailResponse | null {
  const m = getMedicine(aic);
  if (!m) return null;
  const parsed = medicineDetailResponseSchema.safeParse({
    medicine: { ...m, stats: null },
    equivalents: equivalentsOf(m),
    info: catalogInfo(),
    brands: brandsOf(m),
    europe: euBrandsFor(m.ingredientKey, m.formFamily as FormFamily),
  });
  return parsed.success ? parsed.data : null;
}
