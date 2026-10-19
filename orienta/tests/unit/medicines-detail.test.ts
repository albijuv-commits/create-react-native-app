import { beforeAll, describe, expect, it, vi } from "vitest";

/* La scheda di una confezione per l'app nativa: gli stessi dati della pagina /mercato/[aic], in una risposta */
let detail: typeof import("@/lib/medicines/detail");
let POST: (typeof import("@/app/api/farmaci/scheda/route"))["POST"];

beforeAll(async () => {
  // Sempre il campione di esempio, anche se in locale c'è un catalogo AIFA importato
  vi.stubEnv("MEDICINES_SOURCE", "esempio");
  detail = await import("@/lib/medicines/detail");
  ({ POST } = await import("@/app/api/farmaci/scheda/route"));
});

const request = (body: unknown) =>
  new Request("http://localhost/api/farmaci/scheda", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.21" },
    body: JSON.stringify(body),
  });

describe("scheda di una confezione per l'app nativa", () => {
  it("riunisce confezione, equivalenti, catalogo e marchi, senza i campi interni", () => {
    const d = detail.medicineDetailFor("033007042")!;
    expect(d.medicine.name).toBe("Torvast");
    expect(d.medicine.leafletUrl).toMatch(/^https:\/\/api\.aifa\.gov\.it\//);
    expect(d.medicine).not.toHaveProperty("searchText");
    expect(d.medicine).not.toHaveProperty("officialName");
    expect(d.equivalents.map((m) => m.name)).toEqual(["Atorvastatina Krka", "Atorvastatina Sandoz Gmbh", "Totalip"]);
    expect(d.info.source).toBe("esempio");
    expect(d.brands?.brands.map((b) => b.name)).toContain("Torvast");
    expect(detail.medicineDetailFor("000000000")).toBeNull();
  });

  it("la route risponde senza cache e rifiuta codici non validi o assenti", async () => {
    const ok = await POST(request({ aic: "033007042" }));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("Cache-Control")).toBe("no-store");
    expect(((await ok.json()) as { medicine: { name: string } }).medicine.name).toBe("Torvast");
    expect((await POST(request({ aic: "123" }))).status).toBe(400);
    const missing = await POST(request({ aic: "000000000" }));
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ message: "Questa confezione non è nel catalogo." });
  });
});
