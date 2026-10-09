import { beforeAll, describe, expect, it, vi } from "vitest";
import { catalogQuerySchema } from "@/lib/medicines/types";

type Brands = typeof import("@/lib/medicines/brands");
type Queries = typeof import("@/lib/medicines/queries");
let b: Brands;
let q: Queries;

beforeAll(async () => {
  // Sempre il campione di esempio, anche se in locale c'è un catalogo AIFA importato
  vi.stubEnv("MEDICINES_SOURCE", "esempio");
  q = await import("@/lib/medicines/queries");
  b = await import("@/lib/medicines/brands");
});

describe("marchi, aziende e prezzi (campione di esempio)", () => {
  it("raggruppa i marchi con lo stesso principio attivo e dà la fascia a parità di dosaggio e forma", () => {
    const r = b.brandsResponseFor("033007042")!; // Torvast 20 mg
    expect(r).not.toBeNull();
    expect(r.brands.dosage).toBe("20 mg");
    expect(r.brands.brands.map((x) => x.name).sort()).toEqual(["Atorvastatina Krka", "Atorvastatina Sandoz Gmbh", "Torvast", "Totalip"]);
    expect(r.brands.range).toMatchObject({ priceMin: 7.96, priceMax: 10.51 });
    expect(r.summary?.name).toBe("Atorvastatina");
    expect(r.europe?.names.length).toBeGreaterThan(0);
    expect(r.brands.priceDates.to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(r.brands.form).toBe("Compressa");
  });

  it("prima i marchi con lo stesso dosaggio e la stessa forma; per gli altri niente prezzo", () => {
    const r = b.brandsResponseFor("033007042")!;
    const same = r.brands.brands.filter((x) => x.sameDosage);
    expect(r.brands.brands.slice(0, same.length)).toEqual(same);
    for (const x of r.brands.brands.filter((y) => !y.sameDosage)) expect(x.priceMin).toBeNull();
  });

  it("senza ricetta, se le liste AIFA non hanno prezzi, la fascia resta vuota", () => {
    const tachipirina = q.searchCatalog(catalogQuerySchema.parse({ q: "tachipirina" })).items.find((m) => m.supplyCode === "SOP")!;
    const r = b.brandsResponseFor(tachipirina.aic)!;
    expect(r.brands.range.priceMin).toBeNull();
    expect(r.summary?.name).toBe("Paracetamolo");
  });

  it("le card del catalogo portano il riepilogo del gruppo", () => {
    const page = q.searchCatalog(catalogQuerySchema.parse({ q: "atorvastatina" }));
    const torvast = page.items.find((m) => m.name === "Torvast")!;
    expect(torvast.stats).toMatchObject({ brands: 4, priceMin: 7.96, priceMax: 10.51 });
  });

  it("gli equivalenti usano la chiave del principio attivo: «Cetirizina» e «Cetirizina dicloridrato» sono la stessa sostanza", () => {
    const zirtec = q.searchCatalog(catalogQuerySchema.parse({ q: "zirtec" })).items[0]!;
    expect(zirtec.ingredientKey).toBe("cetirizina");
    expect(b.brandsResponseFor("000000000")).toBeNull();
  });
});
