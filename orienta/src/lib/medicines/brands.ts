import "server-only";
import { euBrandsFor } from "./eu-brands-data";
import type { FormFamily } from "./forms";
import { ingredientInfo, ingredientSummary } from "./ingredients";
import { brandsOf, getMedicine } from "./queries";
import { brandsResponseSchema, type BrandsResponse } from "./types";

/**
 * Il contenuto del riquadro «Marchi, aziende e prezzi» di una confezione: marchi e aziende con lo
 * stesso principio attivo, fascia di prezzo a parità di dosaggio e forma, una frase dalla scheda del
 * principio attivo e i marchi più diffusi negli altri Paesi europei.
 */
export function brandsResponseFor(aic: string): BrandsResponse | null {
  const m = getMedicine(aic);
  if (!m) return null;
  const brands = brandsOf(m);
  if (!brands) return null;
  const info = ingredientInfo(m.ingredientKey);
  const europe = euBrandsFor(m.ingredientKey, m.formFamily as FormFamily);
  const parsed = brandsResponseSchema.safeParse({
    brands,
    summary: info ? { name: info.name, text: ingredientSummary(info) } : null,
    europe: europe
      ? { names: europe.brands.slice(0, 6).map((b) => b.name), total: europe.brands.length, countries: europe.countries.length }
      : null,
  });
  return parsed.success ? parsed.data : null;
}
