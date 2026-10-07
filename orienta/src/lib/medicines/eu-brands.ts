import { z } from "zod";
import { emaSubstanceKey } from "./ingredient-key";
import type { FormFamily } from "./forms";
import type { IngredientInfo } from "./ingredients";

/**
 * I marchi con cui lo stesso principio attivo è autorizzato negli altri Paesi europei, dall'elenco
 * pubblico dell'EMA (Article 57 database: medicinali autorizzati in UE e SEE). Si tengono i nomi
 * commerciali, non quelli generici («Paracetamol Krka»), raggruppati per marchio, con Paesi, vie di
 * somministrazione e titolari. Le colonne con email e telefoni di farmacovigilanza non si leggono.
 */
export const EMA_ARTICLE57_URL = "https://www.ema.europa.eu/en/documents/other/article-57-product-data_en.xlsx";
export const EMA_ARTICLE57_PAGE =
  "https://www.ema.europa.eu/en/human-regulatory-overview/post-authorisation/data-medicines-iso-idmp-standards-post-authorisation/public-data-article-57-database";

export const COUNTRY_LABEL: Record<string, string> = {
  Austria: "Austria",
  Belgium: "Belgio",
  Bulgaria: "Bulgaria",
  Croatia: "Croazia",
  Cyprus: "Cipro",
  "Czech Republic": "Repubblica Ceca",
  Czechia: "Repubblica Ceca",
  Denmark: "Danimarca",
  Estonia: "Estonia",
  Finland: "Finlandia",
  France: "Francia",
  Germany: "Germania",
  Greece: "Grecia",
  Hungary: "Ungheria",
  Iceland: "Islanda",
  Ireland: "Irlanda",
  Italy: "Italia",
  Latvia: "Lettonia",
  Liechtenstein: "Liechtenstein",
  Lithuania: "Lituania",
  Luxembourg: "Lussemburgo",
  Malta: "Malta",
  Netherlands: "Paesi Bassi",
  Norway: "Norvegia",
  Poland: "Polonia",
  Portugal: "Portogallo",
  Romania: "Romania",
  Slovakia: "Slovacchia",
  Slovenia: "Slovenia",
  Spain: "Spagna",
  Sweden: "Svezia",
  "United Kingdom (Northern Ireland)": "Irlanda del Nord",
  "European Union": "Tutta l'UE",
};

export const ROUTE_LABEL: Record<string, string> = {
  "Oral Use": "per bocca",
  "Cutaneous Use": "sulla pelle",
  "Transdermal Use": "sulla pelle",
  "Ocular Use": "negli occhi",
  "Nasal Use": "nel naso",
  "Inhalation Use": "per inalazione",
  "Oromucosal Use": "in bocca",
  "Sublingual Use": "in bocca",
  "Buccal Use": "in bocca",
  "Rectal Use": "per via rettale",
  "Vaginal Use": "per via vaginale",
  "Intravenous Use": "iniezione",
  "Intramuscular Use": "iniezione",
  "Subcutaneous Use": "iniezione",
  "Auricular Use": "nell'orecchio",
};

/** Le vie di somministrazione che corrispondono a una famiglia di forma del catalogo */
export const ROUTES_FOR_FORM: Record<FormFamily, readonly string[] | null> = {
  compresse: ["per bocca"],
  capsule: ["per bocca"],
  sciroppo: ["per bocca"],
  bustine: ["per bocca"],
  "spray-nasale": ["nel naso"],
  collirio: ["negli occhi"],
  crema: ["sulla pelle"],
  altro: null,
};

export const euBrandSchema = z.object({
  name: z.string().min(1),
  countries: z.array(z.string().min(1)).min(1),
  routes: z.array(z.string().min(1)).min(1),
  holders: z.array(z.string().min(1)).max(3),
});
export type EuBrand = z.infer<typeof euBrandSchema>;

export const euBrandsFileSchema = z.object({
  source: z.string(),
  url: z.url(),
  /** Data del file EMA (Last-Modified) */
  updated: z.string().nullable(),
  ingredients: z.record(
    z.string(),
    z.object({
      substance: z.string(),
      products: z.number().int().min(0),
      countries: z.array(z.string()),
      brands: z.array(euBrandSchema),
    }),
  ),
});
export type EuBrandsFile = z.infer<typeof euBrandsFileSchema>;

export interface EmaRow {
  name: string;
  substance: string;
  route: string;
  country: string;
  holder: string;
}

const strip = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Radici del nome generico: se un nome commerciale ne contiene una, è un generico («Paracetamol Krka») */
export function genericStems(info: Pick<IngredientInfo, "name" | "ema">, extra: readonly string[] = []): string[] {
  const words = `${info.ema} ${strip(info.name)}`.split(/[^a-z]+/).filter((w) => w.length >= 5 && w !== "acido" && w !== "acid");
  return [...new Set([...words.map((w) => w.slice(0, 6)), ...extra])];
}

const LATIN = /^[\p{Script=Latin}\d\s.,'’()+\-/&]+$/u;

/** Nomi di aziende che, in prima posizione, indicano un generico («Doc Paracetamolo», «Orion …») */
const GENERIC_FIRST = new Set(["doc", "orion", "teva", "sandoz", "mylan", "ratiopharm", "accord", "zentiva", "krka", "aurobindo", "stada", "hexal", "actavis", "apotex", "aliud", "viatris", "genericon", "heumann", "vitabalans", "1a", "eg", "nasenspray", "nasentropfen"]);

export function isGenericName(name: string, stems: readonly string[]): boolean {
  const tokens = strip(name).split(/[\s/,+]+/);
  if (GENERIC_FIRST.has(tokens[0] ?? "")) return true;
  return tokens.some((t) => stems.some((s) => (s.length <= 3 ? t === s : t.includes(s))));
}

/** Raggruppa i prodotti EMA della stessa sostanza per marchio (prima parola del nome commerciale) */
export function buildEuBrands(rows: readonly EmaRow[], info: Pick<IngredientInfo, "name" | "ema">, extraStems: readonly string[] = []) {
  const stems = genericStems(info, extraStems);
  const matching = rows.filter((r) => emaSubstanceKey(r.substance) === info.ema);
  const groups = new Map<string, { names: Map<string, number>; countries: Set<string>; routes: Set<string>; holders: Map<string, number> }>();
  for (const r of matching) {
    const name = r.name.trim();
    if (!name || !LATIN.test(name) || isGenericName(name, stems)) continue;
    const token = name.split(/\s+/)[0]!.replace(/[.,;:]+$/, "");
    if (token.length < 3) continue;
    const key = strip(token);
    const g = groups.get(key) ?? { names: new Map(), countries: new Set(), routes: new Set(), holders: new Map() };
    g.names.set(token, (g.names.get(token) ?? 0) + 1);
    const country = COUNTRY_LABEL[r.country.trim()];
    if (country) g.countries.add(country);
    for (const route of r.route.split(/\s*,\s*/)) {
      const label = ROUTE_LABEL[route.trim()];
      if (label) g.routes.add(label);
    }
    if (r.holder.trim()) g.holders.set(r.holder.trim(), (g.holders.get(r.holder.trim()) ?? 0) + 1);
    groups.set(key, g);
  }
  const top = <T,>(m: Map<T, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const brands: EuBrand[] = [...groups.values()]
    .filter((g) => g.countries.size > 0 && g.routes.size > 0)
    .map((g) => ({
      name: top(g.names)[0]!,
      countries: [...g.countries].sort((a, b) => a.localeCompare(b, "it")),
      routes: [...g.routes].sort((a, b) => a.localeCompare(b, "it")),
      holders: top(g.holders).slice(0, 3),
    }))
    .sort((a, b) => b.countries.length - a.countries.length || a.name.localeCompare(b.name, "it"));
  const countries = [...new Set(matching.map((r) => COUNTRY_LABEL[r.country.trim()]).filter((c): c is string => Boolean(c)))].sort((a, b) =>
    a.localeCompare(b, "it"),
  );
  return { substance: info.ema, products: matching.length, countries, brands };
}
