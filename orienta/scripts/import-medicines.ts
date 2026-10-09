/**
 * Importa il catalogo dei medicinali dagli Open Data dell'AIFA (licenza CC BY 4.0) in SQLite.
 *
 *   npm run import:aifa                     scarica i file ufficiali e scrive data/medicines/orienta.db
 *   npm run import:aifa -- --dir <cartella> usa file CSV già scaricati (stessi nomi dei file AIFA)
 *   npm run import:aifa -- --seed           scrive solo il campione di esempio (data/medicines/seed.json)
 *                                           con le confezioni elencate in data/medicines/seed-aic.json
 *
 * Fonti (https://www.aifa.gov.it/liste-dei-farmaci):
 * - anagrafica delle confezioni con regime di fornitura e link al foglietto, aggiornata ogni giorno;
 * - nomi dei codici ATC;
 * - liste di Classe A e di Classe H per principio attivo (prezzi, aggiornate ogni mese);
 * - lista di trasparenza dei farmaci equivalenti (prezzo di riferimento SSN).
 * Prezzo e regime di fornitura stanno in file diversi: si uniscono tramite il codice AIC.
 */
import Database from "better-sqlite3";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildCatalog, transparencyPriceKey, type AifaDates, type AifaSources } from "../src/lib/medicines/build";
import { csvRecords, decodeWindows1252 } from "../src/lib/medicines/csv";
import { MEDICINES_DDL } from "../src/lib/medicines/ddl";
import { applyPhotos, photosFileSchema, type Photo } from "../src/lib/medicines/photos";
import type { NewMedicine } from "../src/lib/medicines/schema";
import { dateFromFilename, dateFromText } from "../src/lib/medicines/text";

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data/medicines");
const DB_PATH = process.env.MEDICINES_DB_PATH?.trim() || path.join(DATA_DIR, "orienta.db");
const SEED_AIC = path.join(DATA_DIR, "seed-aic.json");
const SEED_OUT = path.join(DATA_DIR, "seed.json");
const PHOTOS = path.join(DATA_DIR, "photos.json");
const PHOTO_DIR = path.join(ROOT, "public/farmaci/foto");

const LIST_PAGE = "https://www.aifa.gov.it/liste-dei-farmaci";
const FIXED = {
  registry: "https://drive.aifa.gov.it/farmaci/confezioni_fornitura.csv",
  atc: "https://drive.aifa.gov.it/farmaci/atc.csv",
  transparency: "https://www.aifa.gov.it/documents/20142/825643/Lista_farmaci_equivalenti.csv",
};
const UA = "Mozilla/5.0 (compatible; OrientaImport/0.1; importazione Open Data AIFA)";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

async function download(url: string): Promise<{ bytes: Buffer; lastModified: string | null }> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(180_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { bytes: Buffer.from(await res.arrayBuffer()), lastModified: res.headers.get("last-modified") };
    } catch (error) {
      if (attempt === 3) throw new Error(`Download non riuscito: ${url} (${(error as Error).message})`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  throw new Error("irraggiungibile");
}

/** I nomi dei file di Classe A e H contengono la data: si leggono dalla pagina delle liste */
async function discoverLists(): Promise<{ classA: string; classH: string; transparency: string }> {
  const html = (await download(LIST_PAGE)).bytes.toString("utf8");
  const find = (re: RegExp) => {
    const m = html.match(re);
    return m ? new URL(m[0], LIST_PAGE).toString() : null;
  };
  const classA = find(/\/documents\/[^"'\s]+Classe_A_per_principio_attivo_[^"'\s]+\.csv/);
  const classH = find(/\/documents\/[^"'\s]+Classe_H_per_principio_attivo_[^"'\s]+\.csv/);
  const transparency = find(/\/documents\/[^"'\s]+Lista_farmaci_equivalenti[^"'\s]*\.csv/) ?? FIXED.transparency;
  if (!classA || !classH) throw new Error(`Non trovo i link alle liste di Classe A e H in ${LIST_PAGE}: usa --dir con i file scaricati a mano.`);
  return { classA, classH, transparency };
}

const decode = (bytes: Buffer, encoding: "utf-8" | "windows-1252") =>
  encoding === "utf-8" ? new TextDecoder("utf-8").decode(bytes) : decodeWindows1252(bytes);

interface Loaded {
  sources: AifaSources;
  dates: AifaDates;
  registryDate: string;
}

async function loadFromWeb(): Promise<Loaded> {
  const lists = await discoverLists();
  console.log("Scarico i file AIFA…");
  const [registry, atc, classA, classH, transparency] = await Promise.all([
    download(FIXED.registry),
    download(FIXED.atc),
    download(lists.classA),
    download(lists.classH),
    download(lists.transparency),
  ]);
  const cache = path.join(DATA_DIR, "aifa");
  mkdirSync(cache, { recursive: true });
  for (const [name, file] of [
    ["confezioni_fornitura.csv", registry],
    ["atc.csv", atc],
    [path.basename(new URL(lists.classA).pathname), classA],
    [path.basename(new URL(lists.classH).pathname), classH],
    ["Lista_farmaci_equivalenti.csv", transparency],
  ] as const) {
    writeFileSync(path.join(cache, name), file.bytes);
  }
  console.log(`File salvati in ${path.relative(ROOT, cache)} (si possono riusare con --dir).`);
  return parse(
    {
      registry: registry.bytes,
      atc: atc.bytes,
      classA: classA.bytes,
      classH: classH.bytes,
      transparency: transparency.bytes,
    },
    { classA: lists.classA, classH: lists.classH },
    registry.lastModified ? new Date(registry.lastModified) : new Date(),
  );
}

function loadFromDir(dir: string): Loaded {
  const files = readdirSync(dir);
  const pick = (re: RegExp, label: string) => {
    const name = files.filter((f) => re.test(f)).sort().at(-1);
    if (!name) throw new Error(`Manca il file ${label} in ${dir}`);
    return path.join(dir, name);
  };
  const paths = {
    registry: pick(/^confezioni_fornitura.*\.csv$/i, "confezioni_fornitura.csv"),
    atc: pick(/^atc.*\.csv$/i, "atc.csv"),
    classA: pick(/^Classe_A_per_principio_attivo.*\.csv$/i, "Classe_A_per_principio_attivo_<data>.csv"),
    classH: pick(/^Classe_H_per_principio_attivo.*\.csv$/i, "Classe_H_per_principio_attivo_<data>.csv"),
    transparency: pick(/^(Lista_farmaci_equivalenti|equivalenti).*\.csv$/i, "Lista_farmaci_equivalenti.csv"),
  };
  return parse(
    {
      registry: readFileSync(paths.registry),
      atc: readFileSync(paths.atc),
      classA: readFileSync(paths.classA),
      classH: readFileSync(paths.classH),
      transparency: readFileSync(paths.transparency),
    },
    { classA: paths.classA, classH: paths.classH },
    new Date(),
  );
}

function parse(
  bytes: Record<keyof AifaSources, Buffer>,
  names: { classA: string; classH: string },
  registryDay: Date,
): Loaded {
  // L'anagrafica è in UTF-8, le liste dei prezzi in Windows-1252
  const sources: AifaSources = {
    registry: csvRecords(decode(bytes.registry, "utf-8")),
    atc: csvRecords(decode(bytes.atc, "utf-8")),
    classA: csvRecords(decode(bytes.classA, "windows-1252")),
    classH: csvRecords(decode(bytes.classH, "windows-1252")),
    transparency: csvRecords(decode(bytes.transparency, "windows-1252")),
  };
  const priceKey = sources.transparency[0] ? transparencyPriceKey(sources.transparency[0]) : null;
  const dates: AifaDates = {
    classA: dateFromFilename(path.basename(names.classA)),
    classH: dateFromFilename(path.basename(names.classH)),
    transparency: priceKey ? dateFromText(priceKey) : null,
  };
  const registryDate = registryDay.toISOString().slice(0, 10);
  console.log(
    `Righe lette: anagrafica ${sources.registry.length}, ATC ${sources.atc.length}, Classe A ${sources.classA.length} (al ${dates.classA}), ` +
      `Classe H ${sources.classH.length} (al ${dates.classH}), trasparenza ${sources.transparency.length} (al ${dates.transparency}).`,
  );
  return { sources, dates, registryDate };
}

function metaEntries(source: "aifa" | "esempio", loaded: Loaded, count: number): Record<string, string> {
  return {
    source,
    count: String(count),
    registry_date: loaded.registryDate,
    class_a_date: loaded.dates.classA ?? "",
    class_h_date: loaded.dates.classH ?? "",
    transparency_date: loaded.dates.transparency ?? "",
    imported_at: new Date().toISOString(),
  };
}

function writeDatabase(rows: NewMedicine[], meta: Record<string, string>) {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const tmp = `${DB_PATH}.tmp`;
  rmSync(tmp, { force: true });
  const db = new Database(tmp);
  db.pragma("journal_mode = OFF");
  db.exec(MEDICINES_DDL);
  const columns = Object.keys(rows[0] ?? {}) as (keyof NewMedicine)[];
  const toSql = (k: string) => k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
  const insert = db.prepare(`INSERT INTO medicines (${columns.map(toSql).join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`);
  const insertMeta = db.prepare("INSERT INTO meta (key, value) VALUES (?, ?)");
  db.transaction(() => {
    for (const row of rows) insert.run(...columns.map((c) => row[c] ?? null));
    for (const [k, v] of Object.entries(meta)) insertMeta.run(k, v);
  })();
  db.exec("VACUUM");
  db.close();
  renameSync(tmp, DB_PATH);
}

/** Le foto con licenza libera (data/medicines/photos.json): ogni file deve esistere in public/farmaci/foto */
function loadPhotos(): Photo[] {
  if (!existsSync(PHOTOS)) return [];
  const photos = photosFileSchema.parse(JSON.parse(readFileSync(PHOTOS, "utf8")));
  const missing = photos.filter((p) => !existsSync(path.join(PHOTO_DIR, p.file)));
  if (missing.length) throw new Error(`Foto mancanti in public/farmaci/foto: ${missing.map((p) => p.file).join(", ")}`);
  return photos;
}

async function main() {
  const photos = loadPhotos();
  const dir = option("--dir");
  const loaded = dir ? loadFromDir(path.resolve(dir)) : await loadFromWeb();

  if (flag("--seed")) {
    const wanted: string[] = JSON.parse(readFileSync(SEED_AIC, "utf8"));
    const rows = buildCatalog(loaded.sources, loaded.dates, new Set(wanted)).sort((a, b) => a.name.localeCompare(b.name, "it"));
    const withPhoto = applyPhotos(rows, photos);
    const missing = wanted.filter((aic) => !rows.some((r) => r.aic === aic));
    if (missing.length) console.warn(`Attenzione: confezioni non trovate o non autorizzate: ${missing.join(", ")}`);
    const seed = { meta: metaEntries("esempio", loaded, rows.length), medicines: rows };
    writeFileSync(SEED_OUT, `${JSON.stringify(seed, null, 1)}\n`);
    console.log(`Campione di esempio: ${rows.length} confezioni (${withPhoto} con foto) in ${path.relative(ROOT, SEED_OUT)}`);
    return;
  }

  const rows = buildCatalog(loaded.sources, loaded.dates);
  const withPhoto = applyPhotos(rows, photos);
  writeDatabase(rows, metaEntries("aifa", loaded, rows.length));
  const priced = rows.filter((r) => r.price !== null).length;
  console.log(`Catalogo: ${rows.length} confezioni (${priced} con prezzo, ${withPhoto} con foto) in ${path.relative(ROOT, DB_PATH)}`);
}

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
main().catch((error: unknown) => {
  console.error((error as Error).message);
  process.exit(1);
});
