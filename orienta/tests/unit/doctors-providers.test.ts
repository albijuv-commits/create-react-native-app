import { describe, expect, it, vi } from "vitest";
import { geocodePlace, placeLabel } from "@/lib/doctors/geocode";
import { buildPlacesRequest, parsePlaces, PLACES_FIELD_MASK } from "@/lib/doctors/google";
import { exampleDoctors } from "@/lib/doctors/mock";
import { addressOf, buildOverpassQuery, categoryOf, parseOverpass, specialityLabels } from "@/lib/doctors/osm";
import { ExampleProvider, GooglePlacesProvider, OsmProvider, ProviderError, type DoctorProvider } from "@/lib/doctors/providers";
import type { Doctor, DoctorSource } from "@/lib/doctors/schema";
import { NOTICES, providerChain, searchDoctors } from "@/lib/doctors/search";
import { SPECIALTY_SEARCH } from "@/lib/doctors/specialty-search";
import { SPECIALTY_IDS } from "@data/vocab/specialties";

const MILANO = { lat: 45.464, lon: 9.19 };

/* Risposta di Overpass nel formato documentato (out center tags): nodi con lat/lon, vie con center */
const OVERPASS_FIXTURE = {
  version: 0.6,
  elements: [
    {
      type: "node",
      id: 101,
      lat: 45.4655,
      lon: 9.1912,
      tags: {
        amenity: "doctors",
        healthcare: "doctor",
        "healthcare:speciality": "cardiology;internal",
        name: "Studio Cardiologico Esempio",
        "addr:street": "Via Dante",
        "addr:housenumber": "7",
        "addr:postcode": "20121",
        "addr:city": "Milano",
        phone: "+39 02 0000 0000",
        email: "studio@esempio.it",
        website: "www.esempio.it",
        opening_hours: "Mo-Fr 09:00-13:00",
        wheelchair: "yes",
      },
    },
    { type: "way", id: 202, center: { lat: 45.47, lon: 9.2 }, tags: { amenity: "clinic", name: "Poliambulatorio Esempio", website: "javascript:alert(1)" } },
    { type: "node", id: 303, lat: 45.46, lon: 9.18, tags: { amenity: "doctors" } },
    { type: "relation", id: 404, tags: { amenity: "hospital", emergency: "yes", name: "Ospedale senza centro" } },
    { type: "node", id: "x", lat: 1, lon: 2 },
  ],
};

describe("query Overpass", () => {
  it("raccoglie le strutture sanitarie nel raggio e poi filtra per specialità e nome", () => {
    const q = buildOverpassQuery(SPECIALTY_SEARCH.cardiologo.osm, MILANO, 5000);
    expect(q.startsWith("[out:json][timeout:25];")).toBe(true);
    expect(q).toContain('nwr["amenity"~"^(doctors|clinic|hospital|dentist)$"](around:5000,45.46400,9.19000);');
    expect(q).toContain('nwr["healthcare"](around:5000,45.46400,9.19000);');
    expect(q).toContain(")->.sanita;");
    expect(q).toContain('nwr.sanita["healthcare:speciality"~"(^|;) *(cardiology) *(;|$)"];');
    expect(q).toContain('nwr.sanita["name"~"cardiolog",i];');
    expect(q.trim().endsWith("out center tags 150;")).toBe(true);
    // Mai un filtro con espressione regolare sulle chiavi: va in timeout
    expect(q).not.toContain("[~");
  });

  it("il medico di base include gli studi senza specialità indicata", () => {
    const q = buildOverpassQuery(SPECIALTY_SEARCH["medico-di-base"].osm, MILANO, 2000);
    expect(q).toContain('nwr.sanita["amenity"="doctors"][!"healthcare:speciality"];');
    expect(q).toContain("(^|;) *(general) *(;|$)");
  });

  it("il pronto soccorso cerca solo ospedali con emergenza", () => {
    const q = buildOverpassQuery(SPECIALTY_SEARCH["pronto-soccorso"].osm, MILANO, 10000);
    expect(q).toContain('nwr.sanita["amenity"="hospital"]["emergency"="yes"];');
    expect(q).not.toContain("healthcare:speciality");
  });

  it("ogni specialità ha una ricerca per Google e almeno un criterio per OpenStreetMap", () => {
    for (const id of SPECIALTY_IDS) {
      const s = SPECIALTY_SEARCH[id];
      expect(s.google.length).toBeGreaterThan(3);
      expect(s.osm.specialities.length + s.osm.names.length + s.osm.selectors.length).toBeGreaterThan(0);
      // Nessuna virgoletta nei pezzi di query
      expect([...s.osm.specialities, ...s.osm.names].join("")).not.toMatch(/["\\]/);
    }
  });
});

describe("risposta Overpass", () => {
  const doctors = parseOverpass(OVERPASS_FIXTURE, MILANO);

  it("legge nodi e vie, scarta elementi senza coordinate o non validi", () => {
    expect(doctors.map((d) => d.id)).toEqual(["osm:node/101", "osm:way/202", "osm:node/303"]);
  });

  it("ricava contatti puliti, indirizzo, orari e specialità in italiano", () => {
    const d = doctors[0]!;
    expect(d.name).toBe("Studio Cardiologico Esempio");
    expect(d.category).toBe("Studio medico");
    expect(d.specialties).toEqual(["Cardiologia", "Medicina interna"]);
    expect(d.address).toBe("Via Dante 7, 20121 Milano");
    expect(d.phone).toEqual({ display: "+39 02 0000 0000", href: "tel:+390200000000" });
    expect(d.email).toBe("studio@esempio.it");
    expect(d.website).toBe("https://www.esempio.it/");
    expect(d.hours).toEqual(["Lun–Ven 09:00–13:00"]);
    expect(d.wheelchair).toBe(true);
    expect(d.distanceM).toBeGreaterThan(100);
    expect(d.distanceM).toBeLessThan(250);
  });

  it("non rende cliccabili link pericolosi e dà un nome agli studi senza nome", () => {
    expect(doctors[1]!.website).toBeNull();
    expect(doctors[1]!.category).toBe("Poliambulatorio");
    expect(doctors[2]!.unnamed).toBe(true);
    expect(doctors[2]!.name).toBe("Studio medico");
  });

  it("rifiuta una risposta che non è di Overpass", () => {
    expect(() => parseOverpass({ foo: 1 }, MILANO)).toThrow();
  });

  it("categorie, indirizzi e specialità", () => {
    expect(categoryOf({ healthcare: "dentist" })).toBe("Studio dentistico");
    expect(categoryOf({ amenity: "hospital" })).toBe("Ospedale");
    expect(addressOf({ "addr:city": "Bari" })).toBe("Bari");
    expect(addressOf({})).toBeNull();
    expect(specialityLabels({ "healthcare:speciality": "foo;urology", emergency: "yes" })).toEqual(["Pronto soccorso", "Urologia"]);
  });
});

describe("Google Places", () => {
  it("la richiesta usa italiano, Italia e un raggio di al massimo 50 km", () => {
    const body = buildPlacesRequest("cardiologo", MILANO, 80_000);
    expect(body).toMatchObject({ textQuery: "cardiologo", languageCode: "it", regionCode: "IT", pageSize: 20 });
    expect(body.locationBias.circle.radius).toBe(50_000);
    expect(PLACES_FIELD_MASK).toContain("places.googleMapsLinks");
    expect(PLACES_FIELD_MASK).not.toContain(" ");
  });

  it("legge i luoghi con telefono, orari, valutazione e attribuzioni", () => {
    const doctors = parsePlaces(
      {
        places: [
          {
            id: "abc",
            displayName: { text: "Studio Medico Esempio" },
            formattedAddress: "Via Roma 1, 20121 Milano MI, Italia",
            location: { latitude: 45.4655, longitude: 9.1912 },
            nationalPhoneNumber: "02 0000 0000",
            internationalPhoneNumber: "+39 02 0000 0000",
            websiteUri: "https://www.esempio.it/",
            rating: 4.6,
            userRatingCount: 120,
            regularOpeningHours: { weekdayDescriptions: ["lunedì: 09:00–13:00"] },
            currentOpeningHours: { openNow: true },
            googleMapsUri: "https://maps.google.com/?cid=1",
            googleMapsLinks: { directionsUri: "https://www.google.com/maps/dir//abc" },
            attributions: [{ provider: "Fornitore", providerUri: "https://fornitore.example.com" }],
          },
          { id: "senza-nome", location: { latitude: 45.46, longitude: 9.19 } },
        ],
      },
      MILANO,
      "Cardiologo",
    );
    expect(doctors).toHaveLength(1);
    const d = doctors[0]!;
    expect(d.id).toBe("google:abc");
    expect(d.phone).toEqual({ display: "02 0000 0000", href: "tel:+390200000000" });
    expect(d.hours).toEqual(["Lunedì: 09:00–13:00"]);
    expect(d.openNow).toBe(true);
    expect(d.rating).toEqual({ value: 4.6, count: 120 });
    expect(d.email).toBeNull();
    expect(d.googleMaps).toEqual({ place: "https://maps.google.com/?cid=1", directions: "https://www.google.com/maps/dir//abc" });
    expect(d.attributions).toEqual([{ provider: "Fornitore", uri: "https://fornitore.example.com/" }]);
  });

  it("senza luoghi restituisce un elenco vuoto", () => {
    expect(parsePlaces({}, MILANO, "Cardiologo")).toEqual([]);
  });
});

describe("dati di esempio", () => {
  it("sono fittizi, senza telefono, con email e siti solo su example.com, entro il raggio", () => {
    const doctors = exampleDoctors("urologo", MILANO, 5000);
    expect(doctors.length).toBe(4);
    for (const d of doctors) {
      expect(d.name).toContain("di esempio");
      expect(d.phone).toBeNull();
      if (d.email) expect(d.email.endsWith("@example.com")).toBe(true);
      if (d.website) expect(new URL(d.website).hostname).toBe("www.example.com");
      expect(d.distanceM).toBeLessThanOrEqual(5000);
    }
    expect(exampleDoctors("pronto-soccorso", MILANO, 2000)[0]!.category).toBe("Ospedale");
  });
});

function fakeProvider(source: DoctorSource, result: Doctor[] | Error): DoctorProvider & { calls: number } {
  return {
    source,
    calls: 0,
    async search() {
      this.calls += 1;
      if (result instanceof Error) throw result;
      return result;
    },
  };
}

describe("scelta del provider e ripieghi", () => {
  const req = (lat: number) => ({ specialty: "urologo" as const, lat, lon: 9.19, radiusKm: 5 as const });
  const doctor = (id: string, distanceM: number): Doctor => ({ ...exampleDoctors("urologo", MILANO, 25_000)[0]!, id, distanceM });

  it("senza chiave Google si parte da OpenStreetMap; DOCTORS_PROVIDER=esempio usa solo i dati di esempio", () => {
    const base = { googleKey: null, forced: null, overpassUrls: ["https://overpass.example.com/api/interpreter"], userAgent: "Orienta/0.1" };
    expect(providerChain(base).map((p) => p.source)).toEqual(["osm", "esempio"]);
    expect(providerChain({ ...base, googleKey: "chiave" }).map((p) => p.source)).toEqual(["google", "osm", "esempio"]);
    expect(providerChain({ ...base, googleKey: "chiave", forced: "osm" }).map((p) => p.source)).toEqual(["osm", "esempio"]);
    expect(providerChain({ ...base, forced: "esempio" }).map((p) => p.source)).toEqual(["esempio"]);
  });

  it("se Google non risponde usa OpenStreetMap e lo dice", async () => {
    const res = await searchDoctors(req(45.401), [fakeProvider("google", new ProviderError("giù")), fakeProvider("osm", [doctor("osm:node/1", 900)]), new ExampleProvider()]);
    expect(res.source).toBe("osm");
    expect(res.notice).toBe(NOTICES.googleFailed);
  });

  it("se nessun servizio reale risponde mostra DATI DI ESEMPIO, dichiarati", async () => {
    const res = await searchDoctors(req(45.402), [fakeProvider("osm", new ProviderError("giù")), new ExampleProvider()]);
    expect(res.source).toBe("esempio");
    expect(res.notice).toBe(NOTICES.realFailed);
    expect(res.notice).toContain("DATI DI ESEMPIO");
    expect(res.doctors.length).toBeGreaterThan(0);
  });

  it("se OpenStreetMap risponde senza risultati non inventa nulla", async () => {
    const res = await searchDoctors(req(45.403), [fakeProvider("osm", []), new ExampleProvider()]);
    expect(res).toEqual({ source: "osm", doctors: [], notice: null });
  });

  it("filtra per distanza, ordina dal più vicino e toglie i doppioni", async () => {
    const res = await searchDoctors(req(45.404), [
      fakeProvider("osm", [doctor("osm:node/3", 4900), doctor("osm:node/1", 300), doctor("osm:node/1", 300), doctor("osm:node/9", 9000)]),
    ]);
    expect(res.doctors.map((d) => d.id)).toEqual(["osm:node/1", "osm:node/3"]);
  });

  it("i risultati di OpenStreetMap restano in cache per un'ora, quelli di Google no", async () => {
    const osm = fakeProvider("osm", [doctor("osm:node/1", 300)]);
    await searchDoctors(req(45.405), [osm]);
    await searchDoctors(req(45.405), [osm]);
    expect(osm.calls).toBe(1);
    const google = fakeProvider("google", [doctor("google:a", 300)]);
    await searchDoctors(req(45.406), [google]);
    await searchDoctors(req(45.406), [google]);
    expect(google.calls).toBe(2);
  });
});

describe("chiamate ai servizi", () => {
  const query = { specialty: "dermatologo" as const, center: MILANO, radiusM: 5000 };

  it("Google: chiave e campi negli header, mai nell'indirizzo", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ places: [] }));
    await new GooglePlacesProvider("chiave-segreta", fetchImpl as unknown as typeof fetch).search(query);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://places.googleapis.com/v1/places:searchText");
    expect(url).not.toContain("chiave");
    expect((init.headers as Record<string, string>)["X-Goog-Api-Key"]).toBe("chiave-segreta");
    expect((init.headers as Record<string, string>)["X-Goog-FieldMask"]).toBe(PLACES_FIELD_MASK);
    expect(JSON.parse(init.body as string).textQuery).toBe("dermatologo");
  });

  it("Google: un errore HTTP diventa ProviderError", async () => {
    const fetchImpl = vi.fn(async () => new Response("no", { status: 403 }));
    await expect(new GooglePlacesProvider("k", fetchImpl as unknown as typeof fetch).search(query)).rejects.toBeInstanceOf(ProviderError);
  });

  it("Overpass: dopo un 429 passa all'istanza successiva, con un User-Agent che identifica l'app", async () => {
    const fetchImpl = vi.fn(async (url: string) =>
      url.includes("prima") ? new Response("troppe richieste", { status: 429 }) : Response.json(OVERPASS_FIXTURE),
    );
    const provider = new OsmProvider(["https://prima.example.com/api/interpreter", "https://seconda.example.com/api/interpreter"], "Orienta/0.1 (test)", fetchImpl as unknown as typeof fetch);
    const doctors = await provider.search(query);
    expect(doctors.length).toBe(3);
    const calls = fetchImpl.mock.calls as unknown as [string, RequestInit][];
    expect(calls.map(([u]) => u)).toEqual(["https://prima.example.com/api/interpreter", "https://seconda.example.com/api/interpreter"]);
    expect((calls[1]![1].headers as Record<string, string>)["User-Agent"]).toBe("Orienta/0.1 (test)");
    expect(decodeURIComponent(String(calls[1]![1].body))).toContain("dermatolog");
    // La prima istanza resta in pausa per 30 secondi
    await provider.search(query);
    expect(calls.filter(([u]) => u.includes("prima"))).toHaveLength(1);
  });

  it("Overpass: se nessuna istanza risponde lancia ProviderError", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    const provider = new OsmProvider(["https://giu.example.com/api/interpreter"], "Orienta/0.1 (test)", fetchImpl as unknown as typeof fetch);
    await expect(provider.search(query)).rejects.toBeInstanceOf(ProviderError);
  });
});

describe("luoghi (Nominatim)", () => {
  it("etichette brevi per città e CAP", () => {
    expect(placeLabel({ lat: 45.46, lon: 9.19, name: "Milano", addresstype: "city", address: { city: "Milano", state: "Lombardia" } }, "milano")).toBe("Milano, Lombardia");
    expect(placeLabel({ lat: 45.47, lon: 9.19, name: "20121", addresstype: "postcode", address: { postcode: "20121", city: "Milano" } }, "20121")).toBe("20121 Milano");
  });

  it("un CAP usa la ricerca strutturata, i risultati restano in cache", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json([{ lat: "45.4716159", lon: "9.1889224", name: "20121", addresstype: "postcode", address: { postcode: "20121", city: "Milano" } }]),
    );
    const first = await geocodePlace("20121", fetchImpl as unknown as typeof fetch);
    const second = await geocodePlace(" 20121 ", fetchImpl as unknown as typeof fetch);
    expect(first).toEqual({ label: "20121 Milano", lat: 45.4716159, lon: 9.1889224 });
    expect(second).toEqual(first);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("postalcode=20121");
    expect(url).toContain("countrycodes=it");
    expect((init.headers as Record<string, string>)["User-Agent"]).toMatch(/^Orienta\//);
  });

  it("un luogo che non esiste restituisce null", async () => {
    const fetchImpl = vi.fn(async () => Response.json([]));
    expect(await geocodePlace("Paese Inesistente Xyz", fetchImpl as unknown as typeof fetch)).toBeNull();
  });
});
