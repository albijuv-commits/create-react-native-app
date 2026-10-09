import { z } from "zod";
import { FORM_FAMILIES } from "./forms";
import { SUPPLY_CODES } from "./regime";

/**
 * Schemi condivisi tra browser e server per il Mercato. Le risposte delle route passano da qui
 * prima di arrivare all'interfaccia.
 */
export const PRICE_BANDS = ["fino-5", "5-10", "10-20", "oltre-20"] as const;
export type PriceBand = (typeof PRICE_BANDS)[number];
export const PRICE_BAND_LABEL: Record<PriceBand, string> = {
  "fino-5": "Fino a 5 €",
  "5-10": "5–10 €",
  "10-20": "10–20 €",
  "oltre-20": "Oltre 20 €",
};
export const PRICE_BAND_RANGE: Record<PriceBand, [number, number]> = {
  "fino-5": [0, 5],
  "5-10": [5, 10],
  "10-20": [10, 20],
  "oltre-20": [20, Number.POSITIVE_INFINITY],
};

export const SORTS = ["nome", "prezzo", "prezzo-desc"] as const;
export type Sort = (typeof SORTS)[number];
export const SORT_LABEL: Record<Sort, string> = { nome: "Nome (A–Z)", prezzo: "Prezzo crescente", "prezzo-desc": "Prezzo decrescente" };

export const RECIPE_FILTERS = ["senza", "con", "ospedale"] as const;
export type RecipeFilter = (typeof RECIPE_FILTERS)[number];
export const RECIPE_FILTER_LABEL: Record<RecipeFilter, string> = { senza: "Senza ricetta", con: "Con ricetta", ospedale: "Solo in ospedale" };

export const PAGE_SIZE = 24;
export const MAX_COMPARE = 3;

const aic = z.string().regex(/^\d{9}$/);

export const catalogQuerySchema = z.object({
  q: z.string().trim().max(80).default(""),
  ricetta: z.enum(RECIPE_FILTERS).nullable().default(null),
  forma: z.enum(FORM_FAMILIES).nullable().default(null),
  atc: z.string().regex(/^[A-Z]$/).nullable().default(null),
  prezzo: z.enum(PRICE_BANDS).nullable().default(null),
  ordine: z.enum(SORTS).default("nome"),
  pagina: z.number().int().min(1).max(1000).default(1),
});
export type CatalogQuery = z.infer<typeof catalogQuerySchema>;

/** Le foto stanno in public/farmaci/foto (servite dall'app stessa) */
export const PHOTO_PATH = /^\/farmaci\/foto\/[a-z0-9-]+\.webp$/;

/**
 * Riepilogo del gruppo: quanti marchi hanno lo stesso principio attivo e, a parità di dosaggio e
 * forma, la fascia dei prezzi presenti nelle liste AIFA.
 */
export const groupStatsSchema = z.object({
  brands: z.number().int().min(0),
  comparable: z.number().int().min(0),
  priced: z.number().int().min(0),
  priceMin: z.number().positive().nullable(),
  priceMax: z.number().positive().nullable(),
});
export type GroupStats = z.infer<typeof groupStatsSchema>;

export const medicineSummarySchema = z.object({
  aic,
  name: z.string().min(1),
  description: z.string(),
  activeIngredient: z.string(),
  ingredientKey: z.string().nullable(),
  strength: z.string().nullable(),
  company: z.string(),
  form: z.string(),
  formFamily: z.enum(FORM_FAMILIES),
  supplyCode: z.enum(SUPPLY_CODES).nullable(),
  reimbursementClass: z.enum(["A", "H"]).nullable(),
  price: z.number().positive().nullable(),
  priceDate: z.string().nullable(),
  units: z.number().int().positive().nullable(),
  imageUrl: z.string().regex(PHOTO_PATH).nullable(),
  imageCredit: z.string().nullable(),
  imageSource: z.url({ protocol: /^https$/ }).nullable(),
  imageCaption: z.string().nullable(),
  imageCountry: z.string().nullable(),
  stats: groupStatsSchema.nullable().default(null),
});
export type MedicineSummary = z.infer<typeof medicineSummarySchema>;

/** Un marchio con lo stesso principio attivo: aziende titolari, confezioni, prezzi a parità di dosaggio e forma */
export const brandEntrySchema = z.object({
  name: z.string().min(1),
  aic,
  companies: z.array(z.string().min(1)).min(1),
  packages: z.number().int().min(1),
  sameDosage: z.boolean(),
  priceMin: z.number().positive().nullable(),
  priceMax: z.number().positive().nullable(),
});
export type BrandEntry = z.infer<typeof brandEntrySchema>;

export const brandsInfoSchema = z.object({
  ingredient: z.string(),
  dosage: z.string().nullable(),
  formFamily: z.enum(FORM_FAMILIES),
  /** La forma AIFA della confezione aperta, per descrivere il gruppo quando la famiglia è «altro» */
  form: z.string(),
  /** Le date dei prezzi della fascia (liste AIFA diverse possono avere date diverse) */
  priceDates: z.object({ from: z.string().nullable(), to: z.string().nullable() }),
  brands: z.array(brandEntrySchema),
  companies: z.number().int().min(0),
  packages: z.number().int().min(0),
  range: groupStatsSchema,
});
export type BrandsInfo = z.infer<typeof brandsInfoSchema>;

/** Il riassunto del principio attivo e dei marchi europei mostrato nel riquadro espandibile della card */
export const brandsResponseSchema = z.object({
  brands: brandsInfoSchema,
  summary: z.object({ name: z.string(), text: z.string() }).nullable(),
  europe: z.object({ names: z.array(z.string()), total: z.number().int().min(0), countries: z.number().int().min(0) }).nullable(),
});
export type BrandsResponse = z.infer<typeof brandsResponseSchema>;
export const brandsRequestSchema = z.object({ aic });

export const catalogInfoSchema = z.object({
  source: z.enum(["aifa", "esempio"]),
  count: z.number().int(),
  registryDate: z.string().nullable(),
  classADate: z.string().nullable(),
  transparencyDate: z.string().nullable(),
});
export type CatalogInfo = z.infer<typeof catalogInfoSchema>;

export const catalogPageSchema = z.object({
  items: z.array(medicineSummarySchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
});
export type CatalogPage = z.infer<typeof catalogPageSchema>;

export const listRequestSchema = z.object({ aics: z.array(aic).min(1).max(60) });
export const listResponseSchema = z.object({ items: z.array(medicineSummarySchema) });

/** Il prezzo dei farmaci senza ricetta può cambiare da farmacia a farmacia */
export function isIndicativePrice(m: Pick<MedicineSummary, "supplyCode" | "price">): boolean {
  return m.price !== null && (m.supplyCode === "OTC" || m.supplyCode === "SOP");
}
