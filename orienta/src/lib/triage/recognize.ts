import { SYMPTOMS, type SymptomId } from "@data/vocab/symptoms";
import { normalizeText } from "@/lib/text/normalize";

/** Parole che, poco prima di un sintomo, lo negano: «non ho febbre», «niente nausea» */
const NEGATIONS = new Set(["non", "niente", "senza", "nessun", "nessuna", "nessuno", "mai", "neanche", "nemmeno", "ne"]);
const NEGATION_WINDOW = 3;
/** Dopo «non» (e qualche pronome) questi verbi confermano il sintomo: «non riesco a deglutire», «non mi passa», «non solo» */
const CONFIRMING_AFTER_NON = /^(riesc\w*|riusc\w*|posso|puo|potevo|ce|passa|passano|passava|smette|smettono|va|vanno|migliora|migliorano|finisce|diminuisce|cala|solo)$/;
const CLITICS = new Set(["mi", "ti", "si", "ci", "vi", "me", "te", "se", "ne", "lo", "la", "li", "le"]);
/** «Mai avuto un mal di testa così forte»: un confronto che conferma il sintomo */
const COMPARISON = new Set(["cosi", "tanto", "simile", "genere", "uguale"]);

/** Vero se la parola in posizione `i` nega davvero ciò che segue */
function negates(words: readonly string[], i: number): boolean {
  if (!NEGATIONS.has(words[i]!)) return false;
  if (words[i] !== "non") return true;
  let j = i + 1;
  while (j < words.length && j <= i + 2 && CLITICS.has(words[j]!)) j++;
  return !(j < words.length && CONFIRMING_AFTER_NON.test(words[j]!));
}

/** Vero se l'espressione tra `start` ed `end` è negata dalle parole che la precedono */
function negatedBefore(words: readonly string[], start: number, end: number): boolean {
  const from = Math.max(0, start - NEGATION_WINDOW);
  const window = words.slice(from, start);
  if (window.includes("mai") && words.slice(end, end + 3).some((w) => COMPARISON.has(w))) return false;
  return window.some((_, k) => negates(words, from + k));
}
/** Parole che possono stare in mezzo a un'espressione: «brucia quando faccio pipì», «naso un po' chiuso» */
const MAX_GAP = 2;

/**
 * Le parole di un'espressione. Un asterisco finale vale come radice: «bruci*» riconosce
 * brucia, bruciore, bruciava. Le radici hanno almeno tre lettere.
 */
function patternWords(phrase: string): string[] {
  return phrase
    .split(/\s+/)
    .flatMap((raw) => {
      const stem = raw.endsWith("*");
      const words = normalizeText(stem ? raw.slice(0, -1) : raw).split(" ").filter(Boolean);
      if (stem && words.length && words[words.length - 1]!.length >= 3) words[words.length - 1] += "*";
      return words;
    });
}

const PATTERNS = SYMPTOMS.flatMap((s) => [s.label, ...s.synonyms].map((phrase) => ({ id: s.id as SymptomId, words: patternWords(phrase) }))).filter(
  (p) => p.words.length > 0,
);

function wordMatches(pattern: string, word: string): boolean {
  return pattern.endsWith("*") ? word.startsWith(pattern.slice(0, -1)) : word === pattern;
}

export interface Recognition {
  /** Sintomi citati nel testo, nell'ordine in cui compaiono */
  present: SymptomId[];
  /** Sintomi citati ma negati («non ho la febbre») */
  negated: SymptomId[];
}

interface Match {
  id: SymptomId;
  start: number;
  end: number;
  /** Quante parole dell'espressione: le più specifiche vincono */
  size: number;
  /** Una negazione tra le parole dell'espressione: «naso non chiuso» */
  negatedInside: boolean;
}

/** L'espressione a partire dalla parola `start`, con al massimo MAX_GAP parole in mezzo a ogni passo */
function matchAt(words: readonly string[], pattern: readonly string[], start: number): Omit<Match, "id" | "size"> | null {
  if (!wordMatches(pattern[0]!, words[start]!)) return null;
  let pos = start;
  let negatedInside = false;
  for (let k = 1; k < pattern.length; k++) {
    let found = -1;
    for (let j = pos + 1; j <= Math.min(words.length - 1, pos + 1 + MAX_GAP); j++) {
      if (wordMatches(pattern[k]!, words[j]!)) {
        found = j;
        break;
      }
    }
    if (found < 0) return null;
    for (let j = pos + 1; j < found; j++) if (negates(words, j)) negatedInside = true;
    pos = found;
  }
  return { start, end: pos + 1, negatedInside };
}

/**
 * Riconosce i sintomi del vocabolario in un testo libero. Le espressioni più specifiche vincono
 * su quelle che contengono («prurito agli occhi» non conta anche come «prurito» generico).
 * Il risultato è un suggerimento: la persona lo conferma o lo corregge.
 */
export function recognizeSymptoms(text: string): Recognition {
  const words = normalizeText(text).split(" ").filter(Boolean);
  if (!words.length) return { present: [], negated: [] };

  const matches: Match[] = [];
  for (const p of PATTERNS) {
    for (let i = 0; i < words.length; i++) {
      const m = matchAt(words, p.words, i);
      if (m) matches.push({ id: p.id, size: p.words.length, ...m });
    }
  }

  // Prima le espressioni con più parole, poi le più compatte; poi quelle che non si sovrappongono
  matches.sort((a, b) => b.size - a.size || a.end - a.start - (b.end - b.start) || a.start - b.start);
  const taken: Match[] = [];
  for (const m of matches) {
    if (!taken.some((t) => m.start < t.end && t.start < m.end)) taken.push(m);
  }
  taken.sort((a, b) => a.start - b.start);

  const present: SymptomId[] = [];
  const negated: SymptomId[] = [];
  for (const m of taken) {
    const isNegated = m.negatedInside || negatedBefore(words, m.start, m.end);
    const list = isNegated ? negated : present;
    if (!list.includes(m.id)) list.push(m.id);
  }
  return { present: present.filter((id) => !negated.includes(id)), negated };
}

/** Parole generiche che corrispondono a più sintomi: l'interfaccia chiede quale dei due */
export interface Ambiguity {
  term: string;
  question: string;
  options: SymptomId[];
}

const AMBIGUOUS: readonly { words: string[]; question: string; options: SymptomId[] }[] = [
  { words: ["tosse"], question: "Che tipo di tosse?", options: ["tosse-secca", "tosse-catarro"] },
  { words: ["tossisco"], question: "Che tipo di tosse?", options: ["tosse-secca", "tosse-catarro"] },
  { words: ["male", "stomaco"], question: "Che tipo di mal di stomaco?", options: ["mal-di-pancia", "bruciore-petto", "nausea"] },
  { words: ["mal", "di", "stomaco"], question: "Che tipo di mal di stomaco?", options: ["mal-di-pancia", "bruciore-petto", "nausea"] },
  { words: ["dolor*", "stomaco"], question: "Che tipo di mal di stomaco?", options: ["mal-di-pancia", "bruciore-petto", "nausea"] },
];

/**
 * Le parole generiche del testo che non sono già state precisate: «ho la tosse» senza dire
 * se è secca o con catarro. Se uno dei sintomi possibili è già riconosciuto, non c'è niente da chiedere.
 */
export function ambiguousTerms(text: string, known: readonly SymptomId[]): Ambiguity[] {
  const words = normalizeText(text).split(" ").filter(Boolean);
  const out: Ambiguity[] = [];
  for (const a of AMBIGUOUS) {
    if (a.options.some((o) => known.includes(o))) continue;
    if (out.some((o) => o.question === a.question)) continue;
    for (let i = 0; i < words.length; i++) {
      const m = matchAt(words, a.words, i);
      if (!m) continue;
      if (m.negatedInside || negatedBefore(words, m.start, m.end)) continue;
      out.push({ term: words.slice(m.start, m.end).join(" "), question: a.question, options: a.options });
      break;
    }
  }
  return out;
}
