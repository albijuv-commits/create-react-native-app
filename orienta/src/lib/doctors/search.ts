import "server-only";
import { TtlCache } from "@/lib/server/ttl-cache";
import { roundPoint } from "./geo";
import { ExampleProvider, GooglePlacesProvider, OsmProvider, type DoctorProvider } from "./providers";
import { DOCTOR_SOURCES, MAX_DOCTORS, type Doctor, type DoctorSearchRequest, type DoctorSearchResponse, type DoctorSource } from "./schema";

const DEFAULT_OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"];

export interface SearchEnv {
  googleKey: string | null;
  /** DOCTORS_PROVIDER: forza una fonte (utile per sviluppo e test) */
  forced: DoctorSource | null;
  overpassUrls: string[];
  userAgent: string;
}

/** User-Agent che identifica l'app, come chiedono le regole d'uso di Overpass e Nominatim */
export function osmUserAgent(): string {
  const contact = process.env.OSM_CONTACT?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return contact ? `Orienta/0.1 (+${contact})` : "Orienta/0.1 (app di orientamento sanitario)";
}

export function readSearchEnv(): SearchEnv {
  const forced = process.env.DOCTORS_PROVIDER?.trim().toLowerCase();
  const urls = (process.env.OVERPASS_URL ?? "")
    .split(",")
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//.test(u));
  return {
    googleKey: process.env.GOOGLE_PLACES_API_KEY?.trim() || null,
    forced: DOCTOR_SOURCES.find((s) => s === forced) ?? null,
    overpassUrls: urls.length ? urls : DEFAULT_OVERPASS,
    userAgent: osmUserAgent(),
  };
}

/** Prima Google (se c'è la chiave), poi OpenStreetMap, infine i dati di esempio, che non falliscono mai */
export function providerChain(env: SearchEnv): DoctorProvider[] {
  const google = env.googleKey ? [new GooglePlacesProvider(env.googleKey)] : [];
  const osm = new OsmProvider(env.overpassUrls, env.userAgent);
  const example = new ExampleProvider();
  switch (env.forced) {
    case "esempio":
      return [example];
    case "osm":
      return [osm, example];
    default:
      return [...google, osm, example];
  }
}

export const NOTICES = {
  googleFailed: "Google Maps non risponde: questi risultati arrivano da OpenStreetMap.",
  realFailed: "In questo momento non riusciamo a cercare medici reali: questi sono DATI DI ESEMPIO, non studi veri. Riprova tra poco.",
  exampleOnly: "La ricerca dei medici reali non è attiva su questa installazione: questi sono DATI DI ESEMPIO, non studi veri.",
} as const;

/* I dati di OpenStreetMap si possono conservare: un'ora di cache alleggerisce Overpass. Quelli di Google no. */
const osmCache = new TtlCache<Doctor[]>(60 * 60 * 1000, 300);

/** Margine per l'arrotondamento della posizione (circa 100 metri) */
const RADIUS_MARGIN_M = 300;

export async function searchDoctors(
  req: DoctorSearchRequest,
  providers: readonly DoctorProvider[] = providerChain(readSearchEnv()),
  signal?: AbortSignal,
): Promise<DoctorSearchResponse> {
  const center = roundPoint(req);
  const radiusM = req.radiusKm * 1000;
  const query = { specialty: req.specialty, center, radiusM };
  let failed: DoctorSource | null = null;

  for (const provider of providers) {
    let doctors: Doctor[];
    try {
      const key = `${req.specialty}|${center.lat}|${center.lon}|${req.radiusKm}`;
      const cached = provider.source === "osm" ? osmCache.get(key) : undefined;
      doctors = cached ?? (await provider.search(query, signal));
      if (provider.source === "osm" && !cached) osmCache.set(key, doctors);
    } catch {
      failed ??= provider.source;
      continue;
    }
    const seen = new Set<string>();
    const nearby = doctors
      .filter((d) => d.distanceM <= radiusM + RADIUS_MARGIN_M && !seen.has(d.id) && seen.add(d.id))
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, MAX_DOCTORS);
    let notice: string | null = null;
    if (provider.source === "esempio") notice = failed ? NOTICES.realFailed : NOTICES.exampleOnly;
    else if (failed === "google") notice = NOTICES.googleFailed;
    return { source: provider.source, doctors: nearby, notice };
  }
  // Non si arriva qui finché la catena termina con i dati di esempio
  return { source: "esempio", doctors: [], notice: NOTICES.realFailed };
}
