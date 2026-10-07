/**
 * Chiave del principio attivo, per raggruppare confezioni che contengono la stessa sostanza anche
 * quando le fonti la scrivono in modo diverso: l'AIFA usa «Cetirizina» nelle liste dei prezzi e
 * «Cetirizina dicloridrato» nell'anagrafica, l'EMA scrive in inglese («Cetirizine Dihydrochloride»).
 * Si tolgono sali, idrati e forme di sale in coda al nome; le associazioni diventano un elenco
 * ordinato («acido clavulanico + amoxicillina»). Sostanze diverse restano diverse: esomeprazolo non
 * diventa omeprazolo, levocetirizina non diventa cetirizina.
 */

const IT_SALTS = new Set([
  "cloridrato",
  "dicloridrato",
  "idrocloruro",
  "bromidrato",
  "solfato",
  "fosfato",
  "nitrato",
  "maleato",
  "fumarato",
  "besilato",
  "mesilato",
  "tartrato",
  "succinato",
  "citrato",
  "sodico",
  "sodica",
  "potassico",
  "potassica",
  "calcico",
  "calcica",
  "calcio",
  "magnesio",
  "trometamolo",
  "triidrato",
  "diidrato",
  "monoidrato",
  "emidrato",
  "sesquidrato",
  "sesquiidrato",
  "anidro",
  "anidra",
  "idrato",
  "isobutanolammonio",
]);

const IT_ALIASES: Record<string, string> = {
  "potassio clavulanato": "acido clavulanico",
  "clavulanato di potassio": "acido clavulanico",
  "clavulanato potassico": "acido clavulanico",
  naproxene: "naprossene",
  ondansetron: "ondansetrone",
  "n-acetil-l-cisteina": "acetilcisteina",
  "n-acetilcisteina": "acetilcisteina",
};

const EN_SALTS = new Set([
  "hydrochloride",
  "dihydrochloride",
  "hydrobromide",
  "sodium",
  "potassium",
  "calcium",
  "magnesium",
  "besilate",
  "besylate",
  "maleate",
  "fumarate",
  "hydrogen",
  "sulfate",
  "sulphate",
  "nitrate",
  "phosphate",
  "mesilate",
  "tartrate",
  "succinate",
  "citrate",
  "trometamol",
  "lysine",
  "arginine",
  "trihydrate",
  "dihydrate",
  "monohydrate",
  "sesquihydrate",
  "hemihydrate",
  "anhydrous",
  "hydrate",
]);

const EN_ALIASES: Record<string, string> = {
  "potassium clavulanate": "clavulanic acid",
  "clavulanate potassium": "clavulanic acid",
  "clavulanate": "clavulanic acid",
  cholecalciferol: "colecalciferol",
  tetrahydrozoline: "tetryzoline",
  albuterol: "salbutamol",
  acetaminophen: "paracetamol",
  "n-acetylcysteine": "acetylcysteine",
};

function normalizeComponent(raw: string, salts: Set<string>, aliases: Record<string, string>, saltPhrase?: RegExp): string | null {
  let v = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!v || v === "n.d." || v === "nd") return null;
  if (aliases[v]) return aliases[v];
  if (saltPhrase) v = v.replace(saltPhrase, "").trim();
  const words = v.split(" ");
  while (words.length > 1 && salts.has(words[words.length - 1]!)) words.pop();
  v = words.join(" ");
  return aliases[v] ?? v;
}

function joinKey(parts: (string | null)[]): string | null {
  const unique = [...new Set(parts.filter((p): p is string => Boolean(p)))].sort((a, b) => a.localeCompare(b, "it"));
  return unique.length ? unique.join(" + ") : null;
}

/** Dalla dicitura italiana dell'AIFA («Amoxicillina triidrato/potassio clavulanato») */
export function ingredientKey(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return joinKey(raw.split(/\s*(?:\/|\+)\s*/).map((p) => normalizeComponent(p, IT_SALTS, IT_ALIASES, /\s+sale (di|sodico di)? ?(lisina|arginina|calcio|sodio)$/)));
}

/** Dalla dicitura inglese dell'EMA («Amoxicillin Trihydrate, Potassium Clavulanate»; «|» separa le sostanze) */
export function emaSubstanceKey(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return joinKey(raw.split(/\s*(?:\||,|\/|\+)\s*/).map((p) => normalizeComponent(p, EN_SALTS, EN_ALIASES)));
}
