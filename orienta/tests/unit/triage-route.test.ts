import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/triage/route";

/*
 * GDPR art. 9: i dati sanitari arrivano al server solo con il consenso esplicito e non finiscono
 * nei log. La route si prova direttamente, senza chiave dell'AI (motore a regole).
 */
const SYMPTOMS = "Mi brucia quando faccio pipì e devo andare spesso in bagno";
const request = (body: unknown, ip = "203.0.113.7") =>
  new Request("http://localhost/api/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
const triage = { profile: { age: 27, sex: "femmina", pregnancy: "no" }, text: SYMPTOMS, symptoms: ["bruciore-urinare"], zones: [], answers: [] };

let logs: string[];
beforeEach(() => {
  vi.stubEnv("ANTHROPIC_API_KEY", "");
  logs = [];
  for (const level of ["log", "info", "warn", "error", "debug"] as const) {
    vi.spyOn(console, level).mockImplementation((...args: unknown[]) => void logs.push(args.map(String).join(" ")));
  }
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("/api/triage e consenso", () => {
  it("senza consenso esplicito rifiuta la richiesta e non rimanda indietro i sintomi", async () => {
    for (const body of [triage, { ...triage, consent: false }, { ...triage, consent: "true" }]) {
      const res = await POST(request(body));
      expect(res.status).toBe(400);
      expect(res.headers.get("Cache-Control")).toBe("no-store");
      expect(await res.text()).not.toContain("brucia");
    }
  });

  it("con il consenso risponde, senza scrivere nei log", async () => {
    const res = await POST(request({ ...triage, consent: true }, "203.0.113.8"));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { kind: string; source?: string };
    expect(data.kind).toBe("questions");
    expect(data.source).toBe("regole");
    expect(logs).toEqual([]);
  });

  it("una richiesta non valida non lascia tracce nei log", async () => {
    const res = await POST(request({ ...triage, consent: true, profile: { age: 300 } }, "203.0.113.9"));
    expect(res.status).toBe(400);
    expect(logs).toEqual([]);
  });
});
