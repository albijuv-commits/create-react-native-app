import "server-only";
import { getSpecialty, type SpecialtyId } from "@data/vocab/specialties";
import type { LatLon } from "./geo";
import { buildPlacesRequest, parsePlaces, PLACES_FIELD_MASK, PLACES_TEXT_SEARCH_URL } from "./google";
import { exampleDoctors } from "./mock";
import { buildOverpassQuery, parseOverpass } from "./osm";
import type { Doctor, DoctorSource } from "./schema";
import { SPECIALTY_SEARCH } from "./specialty-search";

export interface DoctorQuery {
  specialty: SpecialtyId;
  /** Punto di ricerca già arrotondato a circa 100 metri */
  center: LatLon;
  radiusM: number;
}

/** Una fonte di medici. Le implementazioni lanciano `ProviderError` se il servizio non risponde. */
export interface DoctorProvider {
  readonly source: DoctorSource;
  search(query: DoctorQuery, signal?: AbortSignal): Promise<Doctor[]>;
}

export class ProviderError extends Error {}

type Fetch = typeof fetch;

const withTimeout = (signal: AbortSignal | undefined, ms: number) =>
  signal ? AbortSignal.any([signal, AbortSignal.timeout(ms)]) : AbortSignal.timeout(ms);

/** Google Places API (New), Text Search. La chiave resta sul server. */
export class GooglePlacesProvider implements DoctorProvider {
  readonly source = "google" as const;

  constructor(
    private readonly apiKey: string,
    private readonly fetchImpl: Fetch = fetch,
  ) {}

  async search({ specialty, center, radiusM }: DoctorQuery, signal?: AbortSignal): Promise<Doctor[]> {
    let res: Response;
    try {
      res = await this.fetchImpl(PLACES_TEXT_SEARCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": this.apiKey, "X-Goog-FieldMask": PLACES_FIELD_MASK },
        body: JSON.stringify(buildPlacesRequest(SPECIALTY_SEARCH[specialty].google, center, radiusM)),
        cache: "no-store",
        signal: withTimeout(signal, 10_000),
      });
    } catch {
      throw new ProviderError("Google Places non raggiungibile");
    }
    if (!res.ok) throw new ProviderError(`Google Places ha risposto ${res.status}`);
    try {
      return parsePlaces(await res.json(), center, getSpecialty(specialty).label);
    } catch {
      throw new ProviderError("Risposta di Google Places non valida");
    }
  }
}

/* Overpass: una richiesta alla volta da questo server, e pausa di 30 secondi dopo un 429 (regole d'uso) */
let overpassChain: Promise<unknown> = Promise.resolve();
const pausedUntil = new Map<string, number>();

function oneAtATime<T>(task: () => Promise<T>): Promise<T> {
  const run = overpassChain.then(task, task);
  overpassChain = run.catch(() => undefined);
  return run;
}

/** OpenStreetMap tramite Overpass: gratuito, include l'email quando è nei dati. */
export class OsmProvider implements DoctorProvider {
  readonly source = "osm" as const;

  constructor(
    private readonly endpoints: readonly string[],
    private readonly userAgent: string,
    private readonly fetchImpl: Fetch = fetch,
  ) {}

  search({ specialty, center, radiusM }: DoctorQuery, signal?: AbortSignal): Promise<Doctor[]> {
    const query = buildOverpassQuery(SPECIALTY_SEARCH[specialty].osm, center, radiusM);
    return oneAtATime(async () => {
      for (const endpoint of this.endpoints) {
        if ((pausedUntil.get(endpoint) ?? 0) > Date.now()) continue;
        let res: Response;
        try {
          res = await this.fetchImpl(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json", "User-Agent": this.userAgent },
            body: new URLSearchParams({ data: query }).toString(),
            cache: "no-store",
            signal: withTimeout(signal, 25_000),
          });
        } catch {
          if (signal?.aborted) throw new ProviderError("Ricerca annullata");
          continue;
        }
        if (res.status === 429 || res.status === 406) {
          pausedUntil.set(endpoint, Date.now() + 30_000);
          continue;
        }
        if (!res.ok) continue;
        try {
          return parseOverpass(await res.json(), center);
        } catch {
          continue;
        }
      }
      throw new ProviderError("Nessuna istanza di Overpass ha risposto");
    });
  }
}

/** DATI DI ESEMPIO: quando non si possono cercare medici reali */
export class ExampleProvider implements DoctorProvider {
  readonly source = "esempio" as const;

  async search({ specialty, center, radiusM }: DoctorQuery): Promise<Doctor[]> {
    return exampleDoctors(specialty, center, radiusM);
  }
}
