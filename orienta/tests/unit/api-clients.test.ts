import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchDoctors, fetchPlace } from "@/lib/doctors/client";
import { CatalogRequestError, fetchCatalog, fetchMedicineDetail } from "@/lib/medicines/client";
import { fetchAiAvailability, postTriageStep } from "@/lib/triage/client";

/** I client delle route server: nel browser chiamano la stessa origine, nell'app nativa l'indirizzo della web app */
function stubFetch(json: unknown, status = 200) {
  const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
    async () => new Response(JSON.stringify(json), { status, headers: { "Content-Type": "application/json" } }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const BASE = "https://web-app.test";

afterEach(() => vi.unstubAllGlobals());

describe("client di Medici e luoghi", () => {
  it("la posizione parte arrotondata, alla stessa origine o all'indirizzo indicato", async () => {
    const fetchMock = stubFetch({ source: "esempio", doctors: [], notice: null });
    const req = { specialty: "medico-di-base" as const, lat: 45.464211, lon: 9.190179, radiusKm: 10 as const };
    await fetchDoctors(req);
    await fetchDoctors(req, undefined, BASE);
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual(["/api/medici", `${BASE}/api/medici`]);
    const body = JSON.parse(String(fetchMock.mock.calls[1]![1]?.body)) as Record<string, unknown>;
    expect(body).toEqual({ specialty: "medico-di-base", lat: 45.464, lon: 9.19, radiusKm: 10 });
  });

  it("la ricerca dei luoghi usa lo stesso indirizzo", async () => {
    const fetchMock = stubFetch({ place: { label: "Bologna, Emilia-Romagna", lat: 44.4938, lon: 11.3387 } });
    await expect(fetchPlace("Bologna", undefined, BASE)).resolves.toEqual({ label: "Bologna, Emilia-Romagna", lat: 44.4938, lon: 11.3387 });
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/luoghi`);
  });
});

describe("client del catalogo", () => {
  it("ricerca e scheda vanno all'indirizzo indicato; gli errori del server arrivano con il loro messaggio", async () => {
    const fetchMock = stubFetch({ info: { source: "esempio", count: 0, registryDate: null, classADate: null, transparencyDate: null }, page: { items: [], total: 0, page: 1, pageSize: 24 } });
    await fetchCatalog({ q: "", ricetta: null, forma: null, atc: null, prezzo: null, ordine: "nome", pagina: 1 }, undefined, BASE);
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/farmaci`);
    stubFetch({ message: "Questa confezione non è nel catalogo." }, 404);
    const error = await fetchMedicineDetail("000000000", undefined, BASE).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(CatalogRequestError);
    expect((error as Error).message).toBe("Questa confezione non è nel catalogo.");
  });
});

describe("client dell'intervista", () => {
  it("il passo con l'AI dichiara il consenso e va all'indirizzo indicato", async () => {
    const fetchMock = stubFetch({ kind: "emergency", flags: ["respiro"] });
    const req = { profile: { age: 30, sex: "femmina" as const, pregnancy: "no" as const }, text: "", symptoms: [], zones: [], answers: [] };
    await expect(postTriageStep(req, undefined, BASE)).resolves.toEqual({ kind: "emergency", flags: ["respiro"] });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${BASE}/api/triage`);
    expect(JSON.parse(String(init?.body))).toMatchObject({ consent: true });
  });

  it("nel dubbio l'AI risulta spenta", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("rete assente"))));
    await expect(fetchAiAvailability(undefined, BASE)).resolves.toBe(false);
  });
});
