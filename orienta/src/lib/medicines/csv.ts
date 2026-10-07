/** CSV con separatore «;» e campi tra virgolette (RFC 4180), come i file Open Data dell'AIFA. */
export function parseCsv(text: string, delimiter = ";"): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"' && field === "") quoted = true;
    else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Righe come oggetti, con le intestazioni ripulite da spazi e a capo («Codice \nAIC» → «Codice AIC») */
export function csvRecords(text: string, delimiter = ";"): Record<string, string>[] {
  const [header = [], ...rows] = parseCsv(text.replace(/^﻿/, ""), delimiter);
  const keys = header.map((h) => h.replace(/\s+/g, " ").trim());
  return rows
    .filter((r) => r.some((v) => v.trim() !== ""))
    .map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

/* Windows-1252: i byte 0x80–0x9F non coincidono con Latin-1 (0x80 è «€», 0x92 è «’»).
 * TextDecoder di Node per «windows-1252» li lascia come caratteri di controllo: si convertono qui. */
const CP1252_HIGH = [
  0x20ac, 0xfffd, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152, 0xfffd, 0x017d, 0xfffd,
  0xfffd, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0xfffd, 0x017e, 0x0178,
];

export function decodeWindows1252(bytes: Uint8Array): string {
  let out = "";
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const codes = Array.from(bytes.subarray(i, i + CHUNK), (b) => (b >= 0x80 && b <= 0x9f ? CP1252_HIGH[b - 0x80]! : b));
    out += String.fromCharCode(...codes);
  }
  return out;
}
