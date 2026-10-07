import { beforeAll, describe, expect, it, vi } from "vitest";
import { catalogQuerySchema, type CatalogQuery } from "@/lib/medicines/types";

type Queries = typeof import("@/lib/medicines/queries");
let q: Queries;
const query = (partial: Partial<CatalogQuery>) => catalogQuerySchema.parse(partial);

beforeAll(async () => {
  // Sempre il campione di esempio, anche se in locale c'è un catalogo AIFA importato
  vi.stubEnv("MEDICINES_SOURCE", "esempio");
  q = await import("@/lib/medicines/queries");
});

describe("catalogo (campione di esempio)", () => {
  it("dichiara la fonte e le date dei prezzi", () => {
    const info = q.catalogInfo();
    expect(info.source).toBe("esempio");
    expect(info.count).toBeGreaterThanOrEqual(35);
    expect(info.transparencyDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("cerca per nome commerciale o principio attivo, senza badare a maiuscole e accenti", () => {
    const byName = q.searchCatalog(query({ q: "TACHIPIRÌNA" }));
    expect(byName.total).toBe(3);
    expect(byName.items.every((m) => m.name === "Tachipirina")).toBe(true);
    const byIngredient = q.searchCatalog(query({ q: "omeprazolo" }));
    expect(byIngredient.items.map((m) => m.name).sort()).toEqual(["Antra", "Losec", "Mepral", "Omeprazen"]);
    expect(q.searchCatalog(query({ q: "50%_" })).total).toBe(0);
  });

  it("filtra per ricetta, forma, categoria ATC e fascia di prezzo", () => {
    const otc = q.searchCatalog(query({ ricetta: "senza" }));
    expect(otc.total).toBeGreaterThan(5);
    expect(otc.items.every((m) => m.supplyCode === "OTC" || m.supplyCode === "SOP")).toBe(true);
    expect(q.searchCatalog(query({ forma: "capsule" })).total).toBe(4);
    const cardio = q.searchCatalog(query({ atc: "C" }));
    expect(cardio.items.length).toBeGreaterThan(0);
    const cheap = q.searchCatalog(query({ prezzo: "fino-5" }));
    expect(cheap.items.every((m) => m.price !== null && m.price < 5)).toBe(true);
    const hospital = q.searchCatalog(query({ ricetta: "ospedale" }));
    expect(hospital.items.map((m) => m.supplyCode)).toEqual(["OSP"]);
  });

  it("ordina per prezzo con i farmaci senza prezzo in fondo", () => {
    const items = q.searchCatalog(query({ ordine: "prezzo", pagina: 1 })).items;
    const prices = items.map((m) => m.price);
    const firstNull = prices.indexOf(null);
    const priced = (firstNull === -1 ? prices : prices.slice(0, firstNull)) as number[];
    expect(priced).toEqual([...priced].sort((a, b) => a - b));
    if (firstNull !== -1) expect(prices.slice(firstNull).every((p) => p === null)).toBe(true);
  });

  it("equivalenti: stesso gruppo e stessa forma, dal più economico, senza il farmaco stesso", () => {
    const torvast = q.getMedicine("033007042")!;
    const eq = q.equivalentsOf(torvast);
    expect(eq.map((m) => m.aic)).not.toContain("033007042");
    expect(eq.map((m) => m.name)).toEqual(["Atorvastatina Krka", "Atorvastatina Sandoz Gmbh", "Totalip"]);
    expect(eq[0]!.price).toBe(7.96);
  });

  it("equivalenti: le bustine non si confrontano con le compresse anche se il gruppo AIFA è lo stesso", () => {
    expect(q.equivalentsOf(q.getMedicine("022593103")!)).toEqual([]);
    expect(q.equivalentsOf(q.getMedicine("022593216")!).every((m) => m.formFamily === "compresse")).toBe(true);
  });

  it("equivalenti senza gruppo AIFA: stesso principio attivo, dosaggio e forma", () => {
    const eq = q.equivalentsOf(q.getMedicine("015598028")!);
    expect(eq.map((m) => m.aic)).toEqual(["045094012"]);
  });

  it("elenco per codici (preferiti e confronto) nell'ordine richiesto", () => {
    expect(q.medicinesByAic(["026783098", "nonvalido", "033007042", "000000000"]).map((m) => m.aic)).toEqual(["026783098", "033007042"]);
    expect(q.getMedicine("123")).toBeNull();
  });
});
