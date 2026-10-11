import seed from "@data/medicines/seed.json";
import { ingredientInfo, ingredientSummary } from "@/lib/medicines/ingredients";
import { SUPPLY_FILTER } from "@/lib/medicines/regime";
import { normalizeSearch } from "@/lib/medicines/text";
import {
  brandsInfoSchema,
  medicineDetailSchema,
  medicineSummarySchema,
  PAGE_SIZE,
  PRICE_BAND_RANGE,
  type BrandEntry,
  type BrandsInfo,
  type BrandsResponse,
  type CatalogInfo,
  type CatalogPage,
  type CatalogQuery,
  type MedicineDetailResponse,
  type MedicineSummary,
} from "@/lib/medicines/types";

/**
 * Il campione di esempio della web app (data/medicines/seed.json: poche confezioni vere delle liste
 * AIFA, ferme a una data), cercato qui sul telefono quando l'app non è collegata al servizio di
 * Orienta. Sempre etichettato come DATI DI ESEMPIO. Le stesse regole delle query SQL della web app
 * (lib/medicines/queries.ts): filtri, ordinamenti, equivalenti, marchi e aziende. I marchi europei
 * non ci sono: stanno solo sul server.
 */
type Row = (typeof seed.medicines)[number];

const ROWS: readonly Row[] = seed.medicines;
const BY_AIC = new Map(ROWS.map((r) => [r.aic, r]));

export function sampleInfo(): CatalogInfo {
  const meta = seed.meta;
  return {
    source: "esempio",
    count: Number(meta.count) || ROWS.length,
    registryDate: meta.registry_date || null,
    classADate: meta.class_a_date || null,
    transparencyDate: meta.transparency_date || null,
  };
}

const byName = (a: Row, b: Row) => a.name.localeCompare(b.name, "it") || a.description.localeCompare(b.description, "it");
/** Come ORDER BY price IS NULL, price: i farmaci senza prezzo in fondo */
const byPrice = (dir: 1 | -1) => (a: Row, b: Row) => {
  if (a.price === null || b.price === null) return Number(a.price === null) - Number(b.price === null) || a.name.localeCompare(b.name, "it");
  return (a.price - b.price) * dir || a.name.localeCompare(b.name, "it");
};

/** I valori del campione passano da Zod come quelli del database: un dato fuori schema non arriva all'interfaccia */
function summaries(rows: readonly Row[]): MedicineSummary[] {
  return withStats(
    rows.flatMap((r) => {
      const parsed = medicineSummarySchema.safeParse({ ...r, stats: null });
      return parsed.success ? [parsed.data] : [];
    }),
  );
}

/** Per ogni confezione: quanti marchi hanno lo stesso principio attivo e la fascia di prezzo a parità di dosaggio e forma */
function withStats(items: MedicineSummary[]): MedicineSummary[] {
  return items.map((m) => {
    if (!m.ingredientKey) return m;
    const sameKey = ROWS.filter((r) => r.ingredientKey === m.ingredientKey);
    const group = m.strength ? sameKey.filter((r) => r.strength === m.strength && r.formFamily === m.formFamily) : [];
    const prices = group.map((r) => r.price).filter((p): p is number => p !== null);
    return {
      ...m,
      stats: {
        brands: new Set(sameKey.map((r) => r.name)).size || 1,
        comparable: group.length,
        priced: prices.length,
        priceMin: prices.length ? Math.min(...prices) : null,
        priceMax: prices.length ? Math.max(...prices) : null,
      },
    };
  });
}

function matches(r: Row, q: CatalogQuery): boolean {
  const words = normalizeSearch(q.q).split(" ").filter(Boolean).slice(0, 6);
  if (!words.every((w) => r.searchText.includes(w))) return false;
  if (q.ricetta && !(SUPPLY_FILTER[q.ricetta] as readonly string[]).includes(r.supplyCode ?? "")) return false;
  if (q.forma && r.formFamily !== q.forma) return false;
  if (q.atc && r.atcGroup !== q.atc) return false;
  if (q.prezzo) {
    const [min, max] = PRICE_BAND_RANGE[q.prezzo];
    if (r.price === null || r.price < min || (Number.isFinite(max) && r.price >= max)) return false;
  }
  return true;
}

export function sampleSearch(q: CatalogQuery): CatalogPage {
  const rows = ROWS.filter((r) => matches(r, q)).sort(q.ordine === "nome" ? byName : byPrice(q.ordine === "prezzo" ? 1 : -1));
  const total = rows.length;
  const page = Math.min(q.pagina, Math.max(1, Math.ceil(total / PAGE_SIZE)));
  return { items: summaries(rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)), total, page, pageSize: PAGE_SIZE };
}

/** Preferiti e confronto: le confezioni nell'ordine richiesto, senza doppioni né codici sconosciuti */
export function sampleByAic(aics: readonly string[]): MedicineSummary[] {
  const rows = [...new Set(aics)].flatMap((a) => {
    const r = BY_AIC.get(a);
    return r ? [r] : [];
  });
  return summaries(rows);
}

/** Stesso gruppo di equivalenza AIFA (e stessa forma) oppure stesso principio attivo, dosaggio e forma, dal più economico */
function equivalentsOf(m: Row, limit = 30): Row[] {
  const candidates = ROWS.filter((r) => r.aic !== m.aic && r.formFamily === m.formFamily);
  let same: Row[] = [];
  if (m.equivalenceGroup) same = candidates.filter((r) => r.equivalenceGroup === m.equivalenceGroup);
  else if (m.strength && m.ingredientKey) same = candidates.filter((r) => r.ingredientKey === m.ingredientKey && r.strength === m.strength);
  return same.sort(byPrice(1)).slice(0, limit);
}

/** Marchi e aziende con lo stesso principio attivo: prima quelli con lo stesso dosaggio e la stessa forma, poi in ordine alfabetico */
function brandsOf(m: Row): BrandsInfo | null {
  if (!m.ingredientKey) return null;
  const rows = ROWS.filter((r) => r.ingredientKey === m.ingredientKey);
  const isSame = (r: Row) => m.strength !== null && r.strength === m.strength && r.formFamily === m.formFamily;
  const byBrand = new Map<string, BrandEntry & { priced: number; comparable: number; companySet: Set<string> }>();
  for (const r of [...rows].sort((a, b) => a.aic.localeCompare(b.aic))) {
    const same = isSame(r);
    const entry = byBrand.get(r.name) ?? {
      name: r.name,
      aic: r.aic,
      companies: [],
      companySet: new Set<string>(),
      packages: 0,
      sameDosage: false,
      priceMin: null,
      priceMax: null,
      priced: 0,
      comparable: 0,
    };
    entry.companySet.add(r.company);
    entry.packages += 1;
    if (same) {
      if (!entry.sameDosage) entry.aic = r.aic;
      entry.sameDosage = true;
      entry.comparable += 1;
      if (r.price !== null) {
        entry.priced += 1;
        entry.priceMin = entry.priceMin === null ? r.price : Math.min(entry.priceMin, r.price);
        entry.priceMax = entry.priceMax === null ? r.price : Math.max(entry.priceMax, r.price);
      }
    }
    byBrand.set(r.name, entry);
  }
  const all = [...byBrand.values()];
  const prices = all.flatMap((b) => [b.priceMin, b.priceMax]).filter((p): p is number => p !== null);
  const dates = rows
    .filter((r) => isSame(r) && r.price !== null)
    .map((r) => r.priceDate)
    .filter((d): d is string => Boolean(d))
    .sort();
  const parsed = brandsInfoSchema.safeParse({
    ingredient: m.activeIngredient,
    dosage: m.strength,
    formFamily: m.formFamily,
    form: m.form,
    priceDates: { from: dates[0] ?? null, to: dates.at(-1) ?? null },
    brands: all
      .sort((a, b) => Number(b.sameDosage) - Number(a.sameDosage) || a.name.localeCompare(b.name, "it"))
      .map((b) => ({
        name: b.name,
        aic: b.aic,
        companies: [...b.companySet].sort((x, y) => x.localeCompare(y, "it")),
        packages: b.packages,
        sameDosage: b.sameDosage,
        priceMin: b.priceMin,
        priceMax: b.priceMax,
      })),
    companies: new Set(rows.map((r) => r.company)).size,
    packages: rows.length,
    range: {
      brands: all.length,
      comparable: all.reduce((n, b) => n + b.comparable, 0),
      priced: all.reduce((n, b) => n + b.priced, 0),
      priceMin: prices.length ? Math.min(...prices) : null,
      priceMax: prices.length ? Math.max(...prices) : null,
    },
  });
  return parsed.success ? parsed.data : null;
}

/** Il riquadro «Marchi, aziende e prezzi» della card */
export function sampleBrands(aic: string): BrandsResponse | null {
  const m = BY_AIC.get(aic);
  const brands = m ? brandsOf(m) : null;
  if (!m || !brands) return null;
  const info = ingredientInfo(m.ingredientKey);
  return { brands, summary: info ? { name: info.name, text: ingredientSummary(info) } : null, europe: null };
}

/** La scheda di una confezione, con gli stessi dati che dà la route /api/farmaci/scheda */
export function sampleDetail(aic: string): MedicineDetailResponse | null {
  const m = BY_AIC.get(aic);
  if (!m) return null;
  const medicine = medicineDetailSchema.safeParse({ ...m, stats: null });
  if (!medicine.success) return null;
  return { medicine: medicine.data, equivalents: summaries(equivalentsOf(m)), info: sampleInfo(), brands: brandsOf(m), europe: null };
}

/** Tutti i codici del campione: per generare le schede della versione web dell'app */
export function sampleAics(): string[] {
  return ROWS.map((r) => r.aic);
}
