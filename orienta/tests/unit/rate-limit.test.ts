import { describe, expect, it } from "vitest";
import { allowRequest, allowTotal, clientKey } from "@/lib/server/rate-limit";

describe("limiti di richieste", () => {
  it("per chiave: oltre il limite no, finché la finestra non scade", () => {
    const t = 1_000_000;
    expect(allowRequest("prova:a", 2, 1000, t)).toBe(true);
    expect(allowRequest("prova:a", 2, 1000, t + 1)).toBe(true);
    expect(allowRequest("prova:a", 2, 1000, t + 2)).toBe(false);
    expect(allowRequest("prova:b", 2, 1000, t + 2)).toBe(true);
    expect(allowRequest("prova:a", 2, 1000, t + 1000)).toBe(true);
  });

  it("il tetto complessivo regge anche con indirizzi sempre diversi", () => {
    const t = 2_000_000;
    let allowed = 0;
    for (let i = 0; i < 50; i++) if (allowRequest(`tetto:${i}`, 60, 1000, t) && allowTotal("tetto", 10, 1000, t)) allowed++;
    expect(allowed).toBe(10);
    expect(allowTotal("tetto", 10, 1000, t + 1000)).toBe(true);
  });

  it("con moltissime chiavi la memoria resta limitata: le più vecchie si tolgono", () => {
    const t = 3_000_000;
    expect(allowRequest("vecchia", 1, 60_000, t)).toBe(true);
    expect(allowRequest("vecchia", 1, 60_000, t)).toBe(false);
    for (let i = 0; i < 10_050; i++) allowRequest(`chiave-${i}`, 1, 60_000, t);
    // La chiave più vecchia è stata tolta per far posto: riparte da zero
    expect(allowRequest("vecchia", 1, 60_000, t)).toBe(true);
  });

  it("la chiave viene dal primo indirizzo di X-Forwarded-For, poi da X-Real-IP", () => {
    expect(clientKey(new Request("http://x", { headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" } }))).toBe("203.0.113.1");
    expect(clientKey(new Request("http://x", { headers: { "x-real-ip": "198.51.100.2" } }))).toBe("198.51.100.2");
    expect(clientKey(new Request("http://x"))).toBe("locale");
  });
});
