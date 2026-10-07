/**
 * Marchi europei dei principi attivi con scheda (src/lib/medicines/ingredients.ts), dall'elenco
 * pubblico dell'EMA dei medicinali autorizzati in UE e SEE (Article 57 database).
 *
 *   npm run import:ema                    scarica il file EMA e scrive data/medicines/eu-brands.json
 *   npm run import:ema -- --file <xlsx>   usa un file già scaricato (con --updated AAAA-MM-GG si indica
 *                                         la data di pubblicazione del file EMA)
 *
 * Del file si leggono solo nome del prodotto, sostanza, via di somministrazione, Paese e titolare:
 * le colonne con email e telefoni di farmacovigilanza restano fuori.
 * Fonte: © European Medicines Agency, riproduzione autorizzata citando la fonte.
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildEuBrands, EMA_ARTICLE57_URL, euBrandsFileSchema, type EmaRow, type EuBrandsFile } from "../src/lib/medicines/eu-brands";
import { INGREDIENTS } from "../src/lib/medicines/ingredients";
import { readXlsxRows } from "../src/lib/medicines/xlsx";

const ROOT = path.resolve(__dirname, "..");
const CACHE = path.join(ROOT, "data/medicines/ema/article-57-product-data.xlsx");
const OUT = path.join(ROOT, "data/medicines/eu-brands.json");
const UA = "Mozilla/5.0 (compatible; OrientaImport/0.1; elenco EMA Article 57)";

/** Nomi generici abbreviati o radici in altre lingue, oltre a quelle ricavate dal nome */
const EXTRA_STEMS: Record<string, string[]> = {
  ibuprofene: ["ibu-"],
  acetilcisteina: ["nac", "acetylo"],
  "acido acetilsalicilico": ["acetylo", "kwas", "ass", "asa", "aas"],
  colecalciferolo: ["vitamin", "cholec", "kolek", "holek"],
  "acido clavulanico + amoxicillina": ["klavulan"],
};

async function load(): Promise<{ bytes: Uint8Array; updated: string | null }> {
  const i = process.argv.indexOf("--file");
  if (i >= 0 && process.argv[i + 1]) {
    const file = path.resolve(process.argv[i + 1]!);
    const u = process.argv.indexOf("--updated");
    const updated = u >= 0 && /^\d{4}-\d{2}-\d{2}$/.test(process.argv[u + 1] ?? "") ? process.argv[u + 1]! : statSync(file).mtime.toISOString().slice(0, 10);
    return { bytes: readFileSync(file), updated };
  }
  console.log("Scarico l'elenco EMA (Article 57)…");
  const res = await fetch(EMA_ARTICLE57_URL, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(300_000) });
  if (!res.ok) throw new Error(`Download non riuscito: HTTP ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  mkdirSync(path.dirname(CACHE), { recursive: true });
  writeFileSync(CACHE, bytes);
  const lm = res.headers.get("last-modified");
  return { bytes, updated: lm ? new Date(lm).toISOString().slice(0, 10) : null };
}

async function main() {
  const { bytes, updated } = await load();
  const rows = readXlsxRows(bytes, 5);
  const header = rows.findIndex((r) => /^product name/i.test(r[0] ?? ""));
  if (header < 0) throw new Error("Intestazione «Product name» non trovata: il formato del file EMA è cambiato?");
  const products: EmaRow[] = rows.slice(header + 1).flatMap((r) =>
    r[0] ? [{ name: r[0], substance: r[1] ?? "", route: r[2] ?? "", country: r[3] ?? "", holder: r[4] ?? "" }] : [],
  );
  console.log(`Prodotti nell'elenco EMA: ${products.length.toLocaleString("it-IT")}`);
  const out: EuBrandsFile = {
    source: "EMA, Article 57 database: medicinali autorizzati nell'UE e nel SEE",
    url: EMA_ARTICLE57_URL,
    updated,
    ingredients: {},
  };
  for (const info of INGREDIENTS) {
    const result = buildEuBrands(products, info, EXTRA_STEMS[info.key] ?? []);
    out.ingredients[info.key] = result;
    console.log(`${info.name}: ${result.products} prodotti, ${result.brands.length} marchi, ${result.countries.length} Paesi`);
  }
  writeFileSync(OUT, `${JSON.stringify(euBrandsFileSchema.parse(out))}\n`);
  console.log(`Scritto ${path.relative(ROOT, OUT)}`);
}

if (!existsSync(path.dirname(OUT))) mkdirSync(path.dirname(OUT), { recursive: true });
main().catch((error: unknown) => {
  console.error((error as Error).message);
  process.exit(1);
});
