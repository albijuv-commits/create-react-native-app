import "server-only";
import { and, asc, count, desc, eq, gte, inArray, isNotNull, lt, ne, sql, type SQL } from "drizzle-orm";
import { medicinesDb } from "./db";
import { SUPPLY_FILTER } from "./regime";
import { catalogMeta, medicines, type Medicine } from "./schema";
import { normalizeSearch } from "./text";
import {
  PAGE_SIZE,
  PRICE_BAND_RANGE,
  brandsInfoSchema,
  medicineSummarySchema,
  type BrandEntry,
  type BrandsInfo,
  type CatalogInfo,
  type CatalogPage,
  type CatalogQuery,
  type GroupStats,
  type MedicineSummary,
} from "./types";

const SUMMARY_COLUMNS = {
  aic: medicines.aic,
  name: medicines.name,
  description: medicines.description,
  activeIngredient: medicines.activeIngredient,
  ingredientKey: medicines.ingredientKey,
  strength: medicines.strength,
  company: medicines.company,
  form: medicines.form,
  formFamily: medicines.formFamily,
  supplyCode: medicines.supplyCode,
  reimbursementClass: medicines.reimbursementClass,
  price: medicines.price,
  priceDate: medicines.priceDate,
  units: medicines.units,
  imageUrl: medicines.imageUrl,
  imageCredit: medicines.imageCredit,
  imageSource: medicines.imageSource,
  imageCaption: medicines.imageCaption,
  imageCountry: medicines.imageCountry,
};

/** I valori del database passano da Zod: un dato fuori schema non arriva all'interfaccia */
function toSummaries(rows: unknown[]): MedicineSummary[] {
  const items = rows.flatMap((r) => {
    const parsed = medicineSummarySchema.safeParse(r);
    return parsed.success ? [parsed.data] : [];
  });
  return withStats(items);
}

const groupKey = (k: string, strength: string, form: string) => `${k}\u0000${strength}\u0000${form}`;

/**
 * Per ogni confezione: quanti marchi hanno lo stesso principio attivo e la fascia di prezzo a parità
 * di dosaggio e forma. Due query aggregate per pagina, sugli indici del principio attivo.
 */
function withStats(items: MedicineSummary[]): MedicineSummary[] {
  const keys = [...new Set(items.map((m) => m.ingredientKey).filter((k): k is string => Boolean(k)))];
  if (!keys.length) return items;
  const db = medicinesDb();
  const brands = new Map(
    db
      .select({ key: medicines.ingredientKey, n: sql<number>`count(DISTINCT ${medicines.name})` })
      .from(medicines)
      .where(inArray(medicines.ingredientKey, keys))
      .groupBy(medicines.ingredientKey)
      .all()
      .map((r) => [r.key ?? "", Number(r.n)]),
  );
  const groups = new Map(
    db
      .select({
        key: medicines.ingredientKey,
        strength: medicines.strength,
        form: medicines.formFamily,
        n: count(),
        priced: count(medicines.price),
        min: sql<number | null>`min(${medicines.price})`,
        max: sql<number | null>`max(${medicines.price})`,
      })
      .from(medicines)
      .where(and(inArray(medicines.ingredientKey, keys), isNotNull(medicines.strength)))
      .groupBy(medicines.ingredientKey, medicines.strength, medicines.formFamily)
      .all()
      .map((r) => [groupKey(r.key ?? "", r.strength ?? "", r.form), r]),
  );
  return items.map((m) => {
    if (!m.ingredientKey) return m;
    const g = m.strength ? groups.get(groupKey(m.ingredientKey, m.strength, m.formFamily)) : undefined;
    const stats: GroupStats = {
      brands: brands.get(m.ingredientKey) ?? 1,
      comparable: g?.n ?? 0,
      priced: g?.priced ?? 0,
      priceMin: g?.min ?? null,
      priceMax: g?.max ?? null,
    };
    return { ...m, stats };
  });
}

export function catalogInfo(): CatalogInfo {
  const rows = medicinesDb().select().from(catalogMeta).all();
  const meta = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    source: meta.source === "aifa" ? "aifa" : "esempio",
    count: Number(meta.count) || 0,
    registryDate: meta.registry_date || null,
    classADate: meta.class_a_date || null,
    transparencyDate: meta.transparency_date || null,
  };
}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

function whereFor(q: CatalogQuery): SQL | undefined {
  const conditions: SQL[] = [];
  for (const word of normalizeSearch(q.q).split(" ").filter(Boolean).slice(0, 6)) {
    conditions.push(sql`${medicines.searchText} LIKE ${`%${escapeLike(word)}%`} ESCAPE '\\'`);
  }
  if (q.ricetta) conditions.push(inArray(medicines.supplyCode, [...SUPPLY_FILTER[q.ricetta]]));
  if (q.forma) conditions.push(eq(medicines.formFamily, q.forma));
  if (q.atc) conditions.push(eq(medicines.atcGroup, q.atc));
  if (q.prezzo) {
    const [min, max] = PRICE_BAND_RANGE[q.prezzo];
    conditions.push(gte(medicines.price, min));
    if (Number.isFinite(max)) conditions.push(lt(medicines.price, max));
  }
  return conditions.length ? and(...conditions) : undefined;
}

export function searchCatalog(q: CatalogQuery): CatalogPage {
  const db = medicinesDb();
  const where = whereFor(q);
  const total = db.select({ n: count() }).from(medicines).where(where).get()?.n ?? 0;
  const order =
    q.ordine === "nome"
      ? [asc(medicines.name), asc(medicines.description)]
      : [sql`${medicines.price} IS NULL`, q.ordine === "prezzo" ? asc(medicines.price) : desc(medicines.price), asc(medicines.name)];
  const page = Math.min(q.pagina, Math.max(1, Math.ceil(total / PAGE_SIZE)));
  const rows = db
    .select(SUMMARY_COLUMNS)
    .from(medicines)
    .where(where)
    .orderBy(...order)
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)
    .all();
  return { items: toSummaries(rows), total, page, pageSize: PAGE_SIZE };
}

export function getMedicine(aic: string): Medicine | null {
  if (!/^\d{9}$/.test(aic)) return null;
  return medicinesDb().select().from(medicines).where(eq(medicines.aic, aic)).get() ?? null;
}

/**
 * Farmaci equivalenti: stesso principio attivo, dosaggio e forma, dal più economico. Con il codice
 * di gruppo dell'AIFA si usa quello (più la stessa forma: il gruppo non distingue compresse e
 * bustine); senza, si confrontano principio attivo (senza sali: ingredient-key.ts), dosaggio e
 * famiglia di forma.
 */
export function equivalentsOf(m: Medicine, limit = 30): MedicineSummary[] {
  const sameForm = eq(medicines.formFamily, m.formFamily);
  const notSelf = ne(medicines.aic, m.aic);
  let where: SQL | undefined;
  if (m.equivalenceGroup) where = and(eq(medicines.equivalenceGroup, m.equivalenceGroup), sameForm, notSelf);
  else if (m.strength && m.ingredientKey) where = and(eq(medicines.ingredientKey, m.ingredientKey), eq(medicines.strength, m.strength), sameForm, notSelf);
  if (!where) return [];
  const rows = medicinesDb()
    .select(SUMMARY_COLUMNS)
    .from(medicines)
    .where(where)
    .orderBy(sql`${medicines.price} IS NULL`, asc(medicines.price), asc(medicines.name))
    .limit(limit)
    .all();
  return toSummaries(rows);
}

export function medicinesByAic(aics: readonly string[]): MedicineSummary[] {
  const valid = [...new Set(aics.filter((a) => /^\d{9}$/.test(a)))];
  if (!valid.length) return [];
  const rows = medicinesDb().select(SUMMARY_COLUMNS).from(medicines).where(inArray(medicines.aic, valid)).all();
  const byAic = new Map(toSummaries(rows).map((r) => [r.aic, r]));
  return valid.flatMap((a) => (byAic.has(a) ? [byAic.get(a)!] : []));
}

/** I codici delle schede da generare in anticipo: tutte per il campione, le prime per un catalogo completo */
export function prerenderedAics(limit = 60): string[] {
  return medicinesDb()
    .select({ aic: medicines.aic })
    .from(medicines)
    .orderBy(asc(medicines.name))
    .limit(limit)
    .all()
    .map((r) => r.aic);
}

/**
 * Marchi e aziende con lo stesso principio attivo della confezione: per ogni marchio le aziende
 * titolari, le confezioni e, a parità di dosaggio e forma, la fascia di prezzo delle liste AIFA.
 * Prima i marchi che hanno lo stesso dosaggio e la stessa forma, poi gli altri, in ordine alfabetico.
 */
export function brandsOf(m: Medicine): BrandsInfo | null {
  if (!m.ingredientKey) return null;
  const same = m.strength
    ? sql`(${medicines.strength} = ${m.strength} AND ${medicines.formFamily} = ${m.formFamily})`
    : sql`0`;
  const rows = medicinesDb()
    .select({
      name: medicines.name,
      company: medicines.company,
      packages: count(),
      same: sql<number>`sum(CASE WHEN ${same} THEN 1 ELSE 0 END)`,
      priced: sql<number>`sum(CASE WHEN ${same} AND ${medicines.price} IS NOT NULL THEN 1 ELSE 0 END)`,
      min: sql<number | null>`min(CASE WHEN ${same} THEN ${medicines.price} END)`,
      max: sql<number | null>`max(CASE WHEN ${same} THEN ${medicines.price} END)`,
      aicSame: sql<string | null>`min(CASE WHEN ${same} THEN ${medicines.aic} END)`,
      dateFrom: sql<string | null>`min(CASE WHEN ${same} AND ${medicines.price} IS NOT NULL THEN ${medicines.priceDate} END)`,
      dateTo: sql<string | null>`max(CASE WHEN ${same} AND ${medicines.price} IS NOT NULL THEN ${medicines.priceDate} END)`,
      aicAny: sql<string>`min(${medicines.aic})`,
    })
    .from(medicines)
    .where(eq(medicines.ingredientKey, m.ingredientKey))
    .groupBy(medicines.name, medicines.company)
    .all();

  const byBrand = new Map<string, BrandEntry & { priced: number; comparable: number }>();
  for (const r of rows) {
    const sameN = Number(r.same) || 0;
    const entry = byBrand.get(r.name) ?? {
      name: r.name,
      aic: r.aicSame ?? r.aicAny,
      companies: [],
      packages: 0,
      sameDosage: false,
      priceMin: null,
      priceMax: null,
      priced: 0,
      comparable: 0,
    };
    entry.companies.push(r.company);
    entry.packages += r.packages;
    entry.comparable += sameN;
    entry.priced += Number(r.priced) || 0;
    if (sameN > 0) {
      if (!entry.sameDosage && r.aicSame) entry.aic = r.aicSame;
      entry.sameDosage = true;
    }
    if (r.min !== null) entry.priceMin = entry.priceMin === null ? r.min : Math.min(entry.priceMin, r.min);
    if (r.max !== null) entry.priceMax = entry.priceMax === null ? r.max : Math.max(entry.priceMax, r.max);
    byBrand.set(r.name, entry);
  }
  const all = [...byBrand.values()];
  const prices = all.flatMap((b) => [b.priceMin, b.priceMax]).filter((p): p is number => p !== null);
  const dates = rows.flatMap((r) => [r.dateFrom, r.dateTo]).filter((d): d is string => Boolean(d)).sort();
  const info = {
    ingredient: m.activeIngredient,
    dosage: m.strength,
    formFamily: m.formFamily,
    form: m.form,
    priceDates: { from: dates[0] ?? null, to: dates.at(-1) ?? null },
    brands: all
      .map((b) => ({ ...b, companies: [...new Set(b.companies)].sort((x, y) => x.localeCompare(y, "it")) }))
      .sort((a, b) => Number(b.sameDosage) - Number(a.sameDosage) || a.name.localeCompare(b.name, "it"))
      .map((b) => ({ name: b.name, aic: b.aic, companies: b.companies, packages: b.packages, sameDosage: b.sameDosage, priceMin: b.priceMin, priceMax: b.priceMax })),
    companies: new Set(rows.map((r) => r.company)).size,
    packages: rows.reduce((n, r) => n + r.packages, 0),
    range: {
      brands: all.length,
      comparable: all.reduce((n, b) => n + b.comparable, 0),
      priced: all.reduce((n, b) => n + b.priced, 0),
      priceMin: prices.length ? Math.min(...prices) : null,
      priceMax: prices.length ? Math.max(...prices) : null,
    },
  };
  const parsed = brandsInfoSchema.safeParse(info);
  return parsed.success ? parsed.data : null;
}
