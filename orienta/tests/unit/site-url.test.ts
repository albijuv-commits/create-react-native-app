import { afterEach, describe, expect, it, vi } from "vitest";
import { osmUserAgent } from "@/lib/doctors/search";
import { siteUrl } from "@/lib/site-url";

describe("indirizzo pubblico della web app", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("vale quello scritto in NEXT_PUBLIC_SITE_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", " https://orienta.example.org ");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "orienta.vercel.app");
    expect(siteUrl()).toBe("https://orienta.example.org");
  });

  it("su Vercel, senza NEXT_PUBLIC_SITE_URL, si usa l'indirizzo di produzione del progetto", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "orienta.vercel.app");
    expect(siteUrl()).toBe("https://orienta.vercel.app");
  });

  it("altrimenti non c'è", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    expect(siteUrl()).toBeNull();
  });

  it("il contatto verso OpenStreetMap è OSM_CONTACT, oppure l'indirizzo della web app", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "orienta.vercel.app");
    vi.stubEnv("OSM_CONTACT", "");
    expect(osmUserAgent()).toBe("Orienta/0.1 (+https://orienta.vercel.app)");
    vi.stubEnv("OSM_CONTACT", "https://orienta.example.org/contatti");
    expect(osmUserAgent()).toBe("Orienta/0.1 (+https://orienta.example.org/contatti)");
  });
});
