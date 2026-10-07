import type { BodyAreaId } from "@data/vocab/body";
import type { SceneSpec } from "@/lib/slides/catalog";

/** Dati leggeri di una condizione, per l'elenco e la ricerca lato client */
export interface ConditionListItem {
  id: string;
  name: string;
  aliases: string[];
  areas: BodyAreaId[];
  /** Prima frase della panoramica */
  teaser: string;
  animation: SceneSpec;
  /** Testi normalizzati su cui cercare */
  index: { name: string; aliases: string; rest: string };
}

/** Minuscolo, senza accenti né punteggiatura: «Rinite allergica, febbre da fieno» → «rinite allergica febbre da fieno» */
export function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function score(item: ConditionListItem, tokens: string[], query: string): number {
  const { name, aliases, rest } = item.index;
  let total = 0;
  for (const token of tokens) {
    if (name.split(" ").some((w) => w.startsWith(token))) total += 6;
    else if (aliases.split(" ").some((w) => w.startsWith(token))) total += 4;
    else if (rest.split(" ").some((w) => w.startsWith(token))) total += 1;
    else return 0;
  }
  if (name.startsWith(query)) total += 10;
  return total;
}

/**
 * Filtra per area del corpo e cerca per nome, altri nomi e sintomi. Ogni parola cercata deve
 * trovare corrispondenza (all'inizio di una parola); i risultati sul nome vengono prima.
 */
export function searchConditions(
  items: readonly ConditionListItem[],
  query: string,
  area: BodyAreaId | null,
): ConditionListItem[] {
  const inArea = area ? items.filter((i) => i.areas.includes(area)) : [...items];
  const q = normalizeSearch(query);
  if (!q) return inArea;
  const tokens = q.split(" ");
  return inArea
    .map((item) => ({ item, s: score(item, tokens, q) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.item.name.localeCompare(b.item.name, "it"))
    .map((r) => r.item);
}
