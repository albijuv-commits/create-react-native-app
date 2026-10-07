import { describe, expect, it } from "vitest";
import { conditionListItems, formatItalianDate, getCondition } from "@/lib/conditions/catalog";
import { normalizeSearch, searchConditions } from "@/lib/conditions/search";

const items = conditionListItems();
const ids = (query: string, area: Parameters<typeof searchConditions>[2] = null) =>
  searchConditions(items, query, area).map((i) => i.id);

describe("normalizeSearch", () => {
  it("toglie accenti, maiuscole e punteggiatura", () => {
    expect(normalizeSearch("  Più  CAPOGIRI, è così!  ")).toBe("piu capogiri e cosi");
    expect(normalizeSearch("COVID-19")).toBe("covid 19");
  });
});

describe("elenco delle condizioni", () => {
  it("contiene tutte le 40 schede in ordine alfabetico", () => {
    expect(items).toHaveLength(40);
    const names = items.map((i) => i.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "it")));
  });

  it("usa come anteprima la prima frase della panoramica", () => {
    const raffreddore = items.find((i) => i.id === "raffreddore");
    expect(raffreddore?.teaser).toBe(
      "Il raffreddore è un'infezione leggera di naso e gola causata da virus, soprattutto dai rinovirus.",
    );
  });
});

describe("searchConditions", () => {
  it("senza ricerca né filtro restituisce tutto", () => {
    expect(ids("")).toHaveLength(40);
    expect(ids("   ")).toHaveLength(40);
  });

  it("trova per nome, anche senza accenti e con parole parziali", () => {
    expect(ids("emicr")[0]).toBe("emicrania");
    expect(ids("CISTITE")[0]).toBe("cistite");
  });

  it("trova per altri nomi", () => {
    expect(ids("febbre da fieno")).toEqual(["rinite-allergica"]);
  });

  it("trova per sintomo e mette prima le corrispondenze sul nome", () => {
    const tosse = ids("tosse");
    expect(tosse).toContain("bronchite");
    expect(tosse).toContain("asma");
    expect(ids("mal di testa").slice(0, 2).sort()).toEqual(["cefalea-tensiva", "emicrania"]);
  });

  it("richiede che ogni parola trovi corrispondenza", () => {
    expect(ids("zzz")).toEqual([]);
    expect(ids("tosse zzz")).toEqual([]);
  });

  it("filtra per area del corpo, anche insieme alla ricerca", () => {
    const pelle = ids("", "pelle");
    expect(pelle).toContain("acne");
    expect(pelle).not.toContain("asma");
    expect(ids("prurito", "pelle").every((id) => getCondition(id)?.areas.includes("pelle"))).toBe(true);
  });
});

describe("formatItalianDate", () => {
  it("scrive la data per esteso in italiano", () => {
    expect(formatItalianDate("2026-10-07")).toBe("7 ottobre 2026");
    expect(formatItalianDate("2026-01-01")).toBe("1 gennaio 2026");
  });
});
