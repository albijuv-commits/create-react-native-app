/** Pulizia dei testi delle liste AIFA: prezzi, codici AIC, nomi, descrizioni, date. */

/** «33,77», «5,63 €», «1.234,50» → numero; «-» o vuoto → null */
export function parsePrice(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const v = raw.replace(/€/g, "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

/** Il codice AIC ha 9 cifre; nella lista di trasparenza perde lo zero iniziale */
export function padAic(raw: string | null | undefined): string | null {
  const v = (raw ?? "").trim();
  if (!/^\d{6,9}$/.test(v)) return null;
  return v.padStart(9, "0");
}

export function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9%]+/g, " ")
    .trim();
}

const LOWER_WORDS = new Set(["e", "ed", "di", "del", "della", "dei", "con", "per", "in", "a", "da", "al"]);

/** «AMOXICILLINA E ACIDO CLAVULANICO DOC GENERICI» → «Amoxicillina e acido Clavulanico DOC Generici» */
export function displayName(raw: string): string {
  const words = raw.trim().replace(/\s+/g, " ").toLowerCase().split(" ");
  return words
    .map((w, i) => {
      if (i > 0 && LOWER_WORDS.has(w)) return w;
      if (/\d/.test(w)) return w.toUpperCase();
      if (w.length <= 3 && /^[a-z]+$/.test(w)) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

/** Prima lettera maiuscola, il resto minuscolo: «PARACETAMOLO» → «Paracetamolo» */
export function sentenceCase(raw: string): string {
  const v = raw.trim().replace(/\s+/g, " ").toLowerCase();
  return v.charAt(0).toUpperCase() + v.slice(1);
}

/* Sigle dei materiali di confezionamento: restano maiuscole */
const MATERIALS = /\b(pvc|pvd|pvdc|pe|pet|al|alu|pa|pp|ps|ldpe|hdpe|opa|pctfe|coc|ui)\b/g;
const PACKAGING = /^(flacon|blister|tub|bustin|fial|contenitor|siring|penn|cartucc|astucci|scatol|barattol|confezion|sacch|bottigli|vaset|erogator)/;

/**
 * La descrizione AIFA della confezione, leggibile: «20 MG COMPRESSE RIVESTITE CON FILM- 30 COMPRESSE IN
 * BLISTER AL/AL» → «20 mg compresse rivestite con film, 30 compresse in blister AL/AL». Il trattino che
 * separa dosaggio e forma dalla confezione diventa una virgola; i decimali («0,05%») restano intatti.
 */
export function cleanDescription(raw: string): string {
  let v = raw.replace(/>/g, ",").replace(/[<?]/g, " ").replace(/\s+/g, " ").trim();
  const letters = v.replace(/[^A-Za-z]/g, "");
  const mostlyUpper = letters.length > 0 && letters.replace(/[^A-Z]/g, "").length / letters.length > 0.7;
  if (mostlyUpper) v = v.toLowerCase().replace(MATERIALS, (m) => m.toUpperCase());
  return v
    .replace(/(?<=[a-zà-ù%)])\s*-\s*(?=\d)/g, ", ")
    .replace(/(?<=[a-zà-ù])\s*-\s*([a-zà-ù]+)/g, (m, word: string) => (PACKAGING.test(word) || /\s/.test(m) ? `, ${word}` : m))
    .replace(/\s+-\s*/g, ", ")
    .replace(/\s*,\s*(?=\D)/g, ", ")
    .replace(/(?:,\s*){2,}/g, ", ")
    .replace(/(?<=\S)\/ (?=\d)/g, "/")
    .replace(/^[,;\s]+|[,;.\s]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Il numero di unità della confezione dalla descrizione del gruppo AIFA («… 30 UNITA' USO ORALE») */
export function unitsFromGroup(raw: string | null | undefined): number | null {
  const m = (raw ?? "").match(/(\d+)\s*UNITA'/i);
  const n = m ? Number(m[1]) : NaN;
  return Number.isInteger(n) && n > 0 && n < 10_000 ? n : null;
}

const STRENGTH = /(\d+(?:[.,]\d+)?)\s*(mg|g|mcg|microgrammi|ui|u\.i\.|%)(?:\s*\/\s*(\d+(?:[.,]\d+)?)?\s*(ml|g|dose)\b)?/gi;

/**
 * Il dosaggio come chiave confrontabile («875 mg + 125 mg», «1 mg/ml», «0.05 %»), preso dalla
 * descrizione della confezione: la prima espressione di dosaggio, con le parti unite da «+» o «/».
 * Le quantità della confezione che seguono («tubo da 50 g») restano fuori. null se non si
 * riconosce: meglio nessun equivalente che uno sbagliato.
 */
export function strengthKey(raw: string | null | undefined): string | null {
  const text = (raw ?? "").replace(/[<>?]/g, " ");
  const parts: string[] = [];
  let lastEnd = -1;
  for (const m of text.matchAll(STRENGTH)) {
    const start = m.index ?? 0;
    if (lastEnd >= 0 && !/^\s*[+/]\s*$/.test(text.slice(lastEnd, start))) break;
    const unit = m[2]!.toLowerCase().replace("microgrammi", "mcg").replace("u.i.", "ui");
    const per = m[4] ? `/${m[3] ? `${m[3].replace(",", ".")} ` : ""}${m[4].toLowerCase()}` : "";
    parts.push(`${m[1]!.replace(",", ".")} ${unit}${per}`);
    lastEnd = start + m[0].length;
  }
  return parts.length ? parts.join(" + ") : null;
}

const MONTHS = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

/** «…_31-05-2026.csv» → «2026-05-31» */
export function dateFromFilename(name: string): string | null {
  const m = name.match(/(\d{2})[-.](\d{2})[-.](\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/** «Prezzo Pubblico 15 settembre 2026» → «2026-09-15» */
export function dateFromText(text: string): string | null {
  const m = text.toLowerCase().match(/(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})/);
  if (!m) return null;
  return `${m[3]}-${String(MONTHS.indexOf(m[2]!) + 1).padStart(2, "0")}-${m[1]!.padStart(2, "0")}`;
}

export function formatItalianDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

const EURO = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
export function formatEuro(value: number): string {
  return EURO.format(value);
}

/** Forme societarie scritte come d'uso */
const LEGAL_FORMS: Record<string, string> = {
  "s.p.a.": "S.p.A.",
  spa: "S.p.A.",
  "s.r.l.": "S.r.l.",
  srl: "S.r.l.",
  "s.a.s.": "S.a.s.",
  "s.n.c.": "S.n.c.",
  gmbh: "GmbH",
  ltd: "Ltd",
  "ltd.": "Ltd.",
  "inc.": "Inc.",
  inc: "Inc.",
  bv: "B.V.",
  "co.": "Co.",
  kg: "KG",
  ag: "AG",
  ab: "AB",
  sa: "S.A.",
  "s.a.": "S.A.",
  "s.l.": "S.L.",
  unipersonale: "unipersonale",
};

/**
 * Il nome dell'azienda leggibile: «AZIENDE CHIMICHE RIUNITE ANGELINI FRANCESCO A.C.R.A.F. S.P.A.» →
 * «Aziende Chimiche Riunite Angelini Francesco A.C.R.A.F. S.p.A.». Sigle e forme societarie restano
 * riconoscibili; il nome ufficiale resta nel database.
 */
export function displayCompany(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word, i) => {
      const w = word.toLowerCase();
      if (LEGAL_FORMS[w]) return LEGAL_FORMS[w];
      if (i > 0 && LOWER_WORDS.has(w)) return w;
      if (/\d/.test(w) || /^([a-z]\.){2,}$/.test(w) || /^[a-z]\.$/.test(w)) return w.toUpperCase();
      if (w.length <= 3 && /^[a-z]+$/.test(w)) return w.toUpperCase();
      return w.replace(/(^|[-'’(])([a-zà-ù])/g, (_m, sep: string, c: string) => sep + c.toUpperCase());
    })
    .join(" ");
}

/** «da 7,96 € a 10,51 €», oppure un solo prezzo se coincidono */
export function formatPriceRange(min: number, max: number): string {
  return min === max ? formatEuro(min) : `da ${formatEuro(min)} a ${formatEuro(max)}`;
}

/** «dati al 15 settembre 2026», oppure «dati dal 31 maggio al 15 settembre 2026» se le liste hanno date diverse */
export function formatPriceDates(from: string | null, to: string | null): string | null {
  if (!to) return null;
  return !from || from === to ? `dati al ${formatItalianDay(to)}` : `dati dal ${formatItalianDay(from)} al ${formatItalianDay(to)}`;
}

/** Il gruppo di confronto: «875 mg + 125 mg, compresse»; per le forme «altro» il nome AIFA della forma */
export function groupScope(dosage: string | null, familyLabel: string, form: string, family: string): string {
  return [dosage, family === "altro" ? form.toLowerCase() : familyLabel.toLowerCase()].filter(Boolean).join(", ");
}
