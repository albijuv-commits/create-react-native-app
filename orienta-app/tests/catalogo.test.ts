import seed from "@data/medicines/seed.json";
import { CatalogRequestError } from "@/lib/medicines/client";
import { SUPPLY_FILTER } from "@/lib/medicines/regime";
import { catalogQuerySchema, PAGE_SIZE, type CatalogQuery } from "@/lib/medicines/types";
import { brandsFor, medicineDetail, medicinesByAic, searchCatalog } from "~/lib/catalog";
import { sampleAics, sampleBrands, sampleByAic, sampleDetail, sampleInfo, sampleSearch } from "~/lib/catalog-sample";

// Il servizio della web app: di serie non c'è e il campione si cerca sul telefono
jest.mock("~/lib/api", () => ({ apiBaseUrl: jest.fn(() => null) }));
const api = jest.requireMock<{ apiBaseUrl: jest.Mock }>("~/lib/api");

const query = (q: Partial<CatalogQuery> = {}) => catalogQuerySchema.parse(q);
const names = (items: { name: string }[]) => items.map((m) => m.name);
const TORVAST = "033007042";

afterEach(() => {
  api.apiBaseUrl.mockReturnValue(null);
  jest.restoreAllMocks();
});

describe("campione di esempio sul telefono", () => {
  it("è etichettato come esempio, con le date delle liste AIFA", () => {
    expect(sampleInfo()).toEqual({ source: "esempio", count: 44, registryDate: "2026-10-07", classADate: "2026-05-31", transparencyDate: "2026-09-15" });
    expect(sampleAics()).toHaveLength(seed.medicines.length);
  });

  it("pagina i risultati come la web app, in ordine alfabetico", () => {
    const first = sampleSearch(query());
    expect(first.total).toBe(44);
    expect(first.items).toHaveLength(PAGE_SIZE);
    expect(first.items[0]?.name).toBe("Amlodipina EG");
    const second = sampleSearch(query({ pagina: 2 }));
    expect(second.items).toHaveLength(44 - PAGE_SIZE);
    // Una pagina oltre la fine riporta all'ultima, come nella web app
    expect(sampleSearch(query({ pagina: 9 })).page).toBe(2);
  });

  it("cerca per nome e principio attivo, senza badare a maiuscole e accenti", () => {
    expect(names(sampleSearch(query({ q: "atorvastatina" })).items)).toEqual(["Atorvastatina Krka", "Atorvastatina Sandoz Gmbh", "Torvast", "Totalip"]);
    expect(sampleSearch(query({ q: "TACHIPIRINA" })).total).toBe(3);
    expect(sampleSearch(query({ q: "nessun farmaco così" })).total).toBe(0);
  });

  it("filtra per ricetta, forma, categoria ATC e fascia di prezzo", () => {
    const otc = sampleSearch(query({ ricetta: "senza" }));
    expect(otc.total).toBe(12);
    expect(otc.items.every((m) => (SUPPLY_FILTER.senza as readonly string[]).includes(m.supplyCode ?? ""))).toBe(true);
    expect(names(sampleSearch(query({ forma: "sciroppo" })).items)).toEqual(["Bisolvon", "Tachipirina", "Zirtec"]);
    expect(sampleSearch(query({ atc: "C" })).total).toBe(7);
    const cheap = sampleSearch(query({ prezzo: "fino-5" }));
    expect(cheap.total).toBe(10);
    expect(cheap.items.every((m) => m.price !== null && m.price < 5)).toBe(true);
    expect(sampleSearch(query({ ricetta: "senza", atc: "C" })).total).toBe(0);
  });

  it("ordina per prezzo con i farmaci senza prezzo in fondo", () => {
    const up = sampleSearch(query({ ordine: "prezzo", pagina: 1 }));
    expect(up.items[0]?.name).toBe("Eutirox");
    const all = [...up.items, ...sampleSearch(query({ ordine: "prezzo", pagina: 2 })).items];
    const priced = all.filter((m) => m.price !== null).map((m) => m.price!);
    expect(priced).toEqual([...priced].sort((a, b) => a - b));
    expect(all.slice(priced.length).every((m) => m.price === null)).toBe(true);
    expect(sampleSearch(query({ ordine: "prezzo-desc" })).items[0]?.name).toBe("Ondansetron Kabi");
  });

  it("calcola marchi e fascia di prezzo a parità di dosaggio e forma", () => {
    const torvast = sampleSearch(query({ q: "atorvastatina" })).items.find((m) => m.name === "Torvast")!;
    expect(torvast.stats).toEqual({ brands: 4, comparable: 4, priced: 4, priceMin: 7.96, priceMax: 10.51 });
  });

  it("dà gli equivalenti dal più economico, come la route /scheda della web app", () => {
    const detail = sampleDetail(TORVAST)!;
    expect(detail.medicine.name).toBe("Torvast");
    expect(names(detail.equivalents)).toEqual(["Atorvastatina Krka", "Atorvastatina Sandoz Gmbh", "Totalip"]);
    expect(detail.brands?.brands.map((b) => b.name)).toEqual(["Atorvastatina Krka", "Atorvastatina Sandoz Gmbh", "Torvast", "Totalip"]);
    // I marchi europei stanno solo sul server
    expect(detail.europe).toBeNull();
    expect(detail.info.source).toBe("esempio");
    expect(sampleDetail("000000000")).toBeNull();
  });

  it("restituisce preferiti e confronto nell'ordine scelto, senza doppioni né codici sconosciuti", () => {
    expect(names(sampleByAic([TORVAST, "026089019", TORVAST, "000000000"]))).toEqual(["Torvast", "Augmentin"]);
  });

  it("riassume il principio attivo per il riquadro dei marchi", () => {
    const brands = sampleBrands(TORVAST)!;
    expect(brands.summary?.name).toBe("Atorvastatina");
    expect(brands.europe).toBeNull();
    expect(brands.brands.range).toMatchObject({ brands: 4, priceMin: 7.96, priceMax: 10.51 });
  });
});

describe("catalogo dell'app", () => {
  it("senza servizio usa il campione e spiega quando una scheda non c'è", async () => {
    const r = await searchCatalog(query({ q: "zirtec" }));
    expect(r.info.source).toBe("esempio");
    expect(r.page.total).toBe(2);
    expect(names(await medicinesByAic([TORVAST]))).toEqual(["Torvast"]);
    expect(await medicinesByAic([])).toEqual([]);
    await expect(medicineDetail("999999999")).rejects.toThrow(new CatalogRequestError("Questa confezione non è nel catalogo."));
    await expect(brandsFor("999999999")).rejects.toBeInstanceOf(CatalogRequestError);
  });

  it("con il servizio passa dalle route della web app, con i codici nel corpo e non nell'indirizzo", async () => {
    api.apiBaseUrl.mockReturnValue("https://orienta.example");
    const detail = sampleDetail(TORVAST);
    const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(detail), { status: 200, headers: { "Content-Type": "application/json" } }));
    const r = await medicineDetail(TORVAST);
    expect(r.medicine.name).toBe("Torvast");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://orienta.example/api/farmaci/scheda");
    expect(String(url)).not.toContain(TORVAST);
    expect(init).toMatchObject({ method: "POST", body: JSON.stringify({ aic: TORVAST }) });
  });

  it("con il servizio mostra il messaggio della route quando qualcosa va storto", async () => {
    api.apiBaseUrl.mockReturnValue("https://orienta.example");
    jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ message: "Troppe richieste. Riprova tra un minuto." }), { status: 429 }));
    await expect(searchCatalog(query({ q: "tachipirina" }))).rejects.toThrow("Troppe richieste. Riprova tra un minuto.");
  });
});
