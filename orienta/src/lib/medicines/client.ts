import { z } from "zod";
import {
  brandsResponseSchema,
  catalogInfoSchema,
  catalogPageSchema,
  listResponseSchema,
  medicineDetailResponseSchema,
  type BrandsResponse,
  type CatalogInfo,
  type CatalogPage,
  type CatalogQuery,
  type MedicineDetailResponse,
  type MedicineSummary,
} from "./types";

/**
 * Chiamate alle route del catalogo; ogni risposta passa da Zod. `base` è l'indirizzo della web app:
 * vuoto nel browser (stessa origine), quello pubblicato nell'app nativa.
 */
export class CatalogRequestError extends Error {}

const errorSchema = z.object({ message: z.string().max(300) });
const searchResponseSchema = z.object({ info: catalogInfoSchema, page: catalogPageSchema });

async function post(url: string, body: unknown, signal?: AbortSignal): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store", signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new CatalogRequestError("Non riusciamo a raggiungere il catalogo. Controlla la connessione.");
  }
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new CatalogRequestError("La risposta del catalogo non è leggibile.");
  }
  if (!res.ok) {
    const e = errorSchema.safeParse(json);
    throw new CatalogRequestError(e.success ? e.data.message : "Qualcosa è andato storto. Riprova tra poco.");
  }
  return json;
}

export async function fetchCatalog(query: CatalogQuery, signal?: AbortSignal, base = ""): Promise<{ info: CatalogInfo; page: CatalogPage }> {
  const parsed = searchResponseSchema.safeParse(await post(`${base}/api/farmaci`, query, signal));
  if (!parsed.success) throw new CatalogRequestError("La risposta del catalogo non è valida.");
  return parsed.data;
}

export async function fetchMedicines(aics: readonly string[], signal?: AbortSignal, base = ""): Promise<MedicineSummary[]> {
  if (!aics.length) return [];
  const parsed = listResponseSchema.safeParse(await post(`${base}/api/farmaci/elenco`, { aics }, signal));
  if (!parsed.success) throw new CatalogRequestError("La risposta del catalogo non è valida.");
  return parsed.data.items;
}

export async function fetchBrands(aic: string, signal?: AbortSignal, base = ""): Promise<BrandsResponse> {
  const parsed = brandsResponseSchema.safeParse(await post(`${base}/api/farmaci/marchi`, { aic }, signal));
  if (!parsed.success) throw new CatalogRequestError("La risposta del catalogo non è valida.");
  return parsed.data;
}

/** La scheda completa di una confezione (per l'app nativa: la web app la disegna sul server) */
export async function fetchMedicineDetail(aic: string, signal?: AbortSignal, base = ""): Promise<MedicineDetailResponse> {
  const parsed = medicineDetailResponseSchema.safeParse(await post(`${base}/api/farmaci/scheda`, { aic }, signal));
  if (!parsed.success) throw new CatalogRequestError("La risposta del catalogo non è valida.");
  return parsed.data;
}
