import { CatalogRequestError, fetchBrands, fetchCatalog, fetchMedicineDetail, fetchMedicines } from "@/lib/medicines/client";
import type { BrandsResponse, CatalogInfo, CatalogPage, CatalogQuery, MedicineDetailResponse, MedicineSummary } from "@/lib/medicines/types";
import { apiBaseUrl } from "./api";
import { sampleBrands, sampleByAic, sampleDetail, sampleInfo, sampleSearch } from "./catalog-sample";

/**
 * Il catalogo dei medicinali: tramite le route della web app (/api/farmaci, /elenco, /marchi,
 * /scheda), dove sta il database AIFA; senza indirizzo, il campione di esempio cercato sul telefono.
 * I termini cercati e i codici restano nel corpo delle richieste, mai negli indirizzi.
 */
export async function searchCatalog(query: CatalogQuery, signal?: AbortSignal): Promise<{ info: CatalogInfo; page: CatalogPage }> {
  const base = apiBaseUrl();
  return base ? fetchCatalog(query, signal, base) : { info: sampleInfo(), page: sampleSearch(query) };
}

export async function medicinesByAic(aics: readonly string[], signal?: AbortSignal): Promise<MedicineSummary[]> {
  if (!aics.length) return [];
  const base = apiBaseUrl();
  return base ? fetchMedicines(aics, signal, base) : sampleByAic(aics);
}

export async function brandsFor(aic: string, signal?: AbortSignal): Promise<BrandsResponse> {
  const base = apiBaseUrl();
  if (base) return fetchBrands(aic, signal, base);
  const local = sampleBrands(aic);
  if (!local) throw new CatalogRequestError("Per questa confezione non ci sono altri marchi da mostrare.");
  return local;
}

export async function medicineDetail(aic: string, signal?: AbortSignal): Promise<MedicineDetailResponse> {
  const base = apiBaseUrl();
  if (base) return fetchMedicineDetail(aic, signal, base);
  const local = sampleDetail(aic);
  if (!local) throw new CatalogRequestError("Questa confezione non è nel catalogo.");
  return local;
}
