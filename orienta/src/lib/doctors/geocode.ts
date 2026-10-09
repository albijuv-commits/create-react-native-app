import "server-only";
import { z } from "zod";
import { TtlCache } from "@/lib/server/ttl-cache";
import { osmUserAgent } from "./search";
import { placeSchema, type Place } from "./schema";

/**
 * Città o CAP → coordinate, con Nominatim (OpenStreetMap). Regole d'uso
 * (https://operations.osmfoundation.org/policies/nominatim/): al massimo una richiesta al secondo,
 * User-Agent che identifica l'app, risultati in cache, niente completamento automatico mentre
 * si scrive (si cerca solo all'invio). L'indirizzo del servizio si cambia con NOMINATIM_URL.
 */
const DEFAULT_NOMINATIM = "https://nominatim.openstreetmap.org";

const hitSchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number(),
  name: z.string().optional(),
  addresstype: z.string().optional(),
  address: z.record(z.string(), z.string()).optional(),
});

const found = new TtlCache<Place | null>(7 * 24 * 60 * 60 * 1000, 500);
const NOT_FOUND_TTL = 60 * 60 * 1000;

let chain: Promise<unknown> = Promise.resolve();
let lastRequest = 0;
const MIN_INTERVAL_MS = 1100;

/** Le richieste a Nominatim partono una alla volta, a più di un secondo di distanza */
function throttled<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const wait = lastRequest + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequest = Date.now();
    return task();
  });
  chain = run.catch(() => undefined);
  return run;
}

export function normalizePlaceQuery(q: string): string {
  return q.trim().replace(/\s+/g, " ").toLowerCase();
}

/** «Milano, Lombardia» per una città, «20121 Milano» per un CAP */
export function placeLabel(hit: z.infer<typeof hitSchema>, query: string): string {
  const a = hit.address ?? {};
  const locality = a.city ?? a.town ?? a.village ?? a.municipality ?? a.hamlet ?? a.suburb;
  if (hit.addresstype === "postcode") return [a.postcode ?? query.trim(), locality].filter(Boolean).join(" ");
  return [hit.name || locality || query.trim(), a.state].filter(Boolean).join(", ");
}

export class GeocodeError extends Error {}

export async function geocodePlace(q: string, fetchImpl: typeof fetch = fetch): Promise<Place | null> {
  const key = normalizePlaceQuery(q);
  const cached = found.get(key);
  if (cached !== undefined) return cached;

  const base = (process.env.NOMINATIM_URL?.trim() || DEFAULT_NOMINATIM).replace(/\/+$/, "");
  const params = new URLSearchParams({ format: "jsonv2", limit: "1", addressdetails: "1", "accept-language": "it", countrycodes: "it" });
  if (/^\d{5}$/.test(key)) params.set("postalcode", key);
  else params.set("q", q.trim());

  const json = await throttled(async () => {
    let res: Response;
    try {
      res = await fetchImpl(`${base}/search?${params.toString()}`, {
        headers: { "User-Agent": osmUserAgent(), Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      throw new GeocodeError("Nominatim non raggiungibile");
    }
    if (!res.ok) throw new GeocodeError(`Nominatim ha risposto ${res.status}`);
    return res.json() as Promise<unknown>;
  });

  const hits = z.array(z.unknown()).safeParse(json);
  if (!hits.success) throw new GeocodeError("Risposta di Nominatim non valida");
  const hit = hits.data.length ? hitSchema.safeParse(hits.data[0]) : null;
  const place = hit?.success ? placeSchema.safeParse({ label: placeLabel(hit.data, q).slice(0, 120), lat: hit.data.lat, lon: hit.data.lon }) : null;
  const result = place?.success ? place.data : null;
  found.set(key, result, result ? undefined : NOT_FOUND_TTL);
  return result;
}
