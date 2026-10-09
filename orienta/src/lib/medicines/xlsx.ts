import { strFromU8, unzipSync } from "fflate";

/**
 * Lettore minimo di file .xlsx (Office Open XML) per gli script di importazione: legge il primo
 * foglio e restituisce le righe come testo. Gestisce stringhe condivise, stringhe in linea e
 * celle vuote; non serve altro per gli elenchi pubblicati dall'EMA.
 */
const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

export function decodeXml(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) => {
    if (e[0] !== "#") return ENTITIES[e.toLowerCase()] ?? "";
    const code = e[1]!.toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : "";
  });
}

const TEXT = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g;
const joinText = (xml: string) => decodeXml([...xml.matchAll(TEXT)].map((m) => m[1]).join(""));

function sharedStrings(xml: string): string[] {
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => joinText(m[1]!));
}

function columnIndex(letters: string): number {
  let n = 0;
  for (const c of letters) n = n * 26 + (c.charCodeAt(0) - 64);
  return n - 1;
}

export function readXlsxRows(bytes: Uint8Array, maxColumns = 26): string[][] {
  const files = unzipSync(bytes, { filter: (f) => f.name === "xl/sharedStrings.xml" || /^xl\/worksheets\/sheet\d+\.xml$/.test(f.name) });
  const shared = files["xl/sharedStrings.xml"] ? sharedStrings(strFromU8(files["xl/sharedStrings.xml"])) : [];
  const sheet = Object.keys(files)
    .filter((n) => n.startsWith("xl/worksheets/"))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))[0];
  if (!sheet) throw new Error("Il file non contiene fogli di lavoro");
  const xml = strFromU8(files[sheet]!);
  const rows: string[][] = [];
  for (const row of xml.matchAll(/<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const cells: string[] = [];
    for (const c of (row[1] ?? "").matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = c[1] ?? "";
      const body = c[2] ?? "";
      const letters = attrs.match(/\br="([A-Z]+)\d+"/)?.[1];
      const index = letters ? columnIndex(letters) : cells.length;
      if (index >= maxColumns) continue;
      const type = attrs.match(/\bt="(\w+)"/)?.[1];
      const raw = body.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? "";
      const value = type === "s" ? (shared[Number(raw)] ?? "") : type === "inlineStr" ? joinText(body) : decodeXml(raw);
      while (cells.length < index) cells.push("");
      cells[index] = value;
    }
    rows.push(cells);
  }
  return rows;
}
