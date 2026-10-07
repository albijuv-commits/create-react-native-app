import { z } from "zod";
import {
  brandsResponseSchema,
  catalogInfoSchema,
  catalogPageSchema,
  listResponseSchema,
  type BrandsResponse,
  type CatalogInfo,
  type CatalogPage,
  type CatalogQuery,
  type MedicineSummary,
} from "./types";

/** Chiamate del browser alle route del catalogo; ogni risposta passa da Zod. */
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

export async function fetchCatalog(query: CatalogQuery, signal?: AbortSignal): Promise<{ info: CatalogInfo; page: CatalogPage }> {
  const parsed = searchResponseSchema.safeParse(await post("/api/farmaci", query, signal));
  if (!parsed.success) throw new CatalogRequestError("La risposta del catalogo non è valida.");
  return parsed.data;
}

export async function fetchMedicines(aics: readonly string[], signal?: AbortSignal): Promise<MedicineSummary[]> {
  if (!aics.length) return [];
  const parsed = listResponseSchema.safeParse(await post("/api/farmaci/elenco", { aics }, signal));
  if (!parsed.success) throw new CatalogRequestError("La risposta del catalogo non è valida.");
  return parsed.data.items;
}

export async function fetchBrands(aic: string, signal?: AbortSignal): Promise<BrandsResponse> {
  const parsed = brandsResponseSchema.safeParse(await post("/api/farmaci/marchi", { aic }, signal));
  if (!parsed.success) throw new CatalogRequestError("La risposta del catalogo non è valida.");
  return parsed.data;
}
