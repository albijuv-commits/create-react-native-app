import { z } from "zod";
import { emailAddress, openingHoursLines, phoneLink, websiteUrl } from "./contact";
import { distanceM, type LatLon } from "./geo";
import { doctorSchema, type Doctor } from "./schema";
import type { OsmSearch } from "./specialty-search";

/**
 * La query Overpass QL per una specialità intorno a un punto. Prima si raccolgono le strutture
 * sanitarie nel raggio con filtri indicizzati (chiave e valori fissi), poi si filtra quell'insieme
 * per specialità, nome e selettori: un filtro con espressione regolare sulle chiavi
 * ([~"^(amenity|healthcare)$"~…]) va in timeout sull'istanza pubblica. Le parti variabili sono
 * numeri (coordinate e raggio) e costanti di `SPECIALTY_SEARCH`.
 */
export function buildOverpassQuery(search: OsmSearch, center: LatLon, radiusM: number, limit = 150): string {
  const around = `(around:${Math.round(radiusM)},${center.lat.toFixed(5)},${center.lon.toFixed(5)})`;
  const filters: string[] = [];
  if (search.specialities.length) filters.push(`["healthcare:speciality"~"(^|;) *(${search.specialities.join("|")}) *(;|$)"]`);
  if (search.names.length) filters.push(`["name"~"${search.names.join("|")}",i]`);
  filters.push(...search.selectors);
  return [
    "[out:json][timeout:25];",
    "(",
    `  nwr["amenity"~"^(doctors|clinic|hospital|dentist)$"]${around};`,
    `  nwr["healthcare"]${around};`,
    ")->.sanita;",
    "(",
    ...filters.map((f) => `  nwr.sanita${f};`),
    ");",
    `out center tags ${limit};`,
  ].join("\n");
}

const SPECIALITY_LABELS: Record<string, string> = {
  general: "Medicina generale",
  internal: "Medicina interna",
  paediatrics: "Pediatria",
  cardiology: "Cardiologia",
  dermatology: "Dermatologia",
  dermatovenereology: "Dermatologia",
  venereology: "Venereologia",
  allergology: "Allergologia",
  otolaryngology: "Otorinolaringoiatria",
  ophthalmology: "Oculistica",
  gynaecology: "Ginecologia",
  urology: "Urologia",
  gastroenterology: "Gastroenterologia",
  neurology: "Neurologia",
  psychiatry: "Psichiatria",
  pulmonology: "Pneumologia",
  endocrinology: "Endocrinologia",
  diabetology: "Diabetologia",
  haematology: "Ematologia",
  infectious_diseases: "Malattie infettive",
  orthopaedics: "Ortopedia",
  physiatry: "Fisiatria",
  geriatrics: "Geriatria",
  nephrology: "Nefrologia",
  rheumatology: "Reumatologia",
  oncology: "Oncologia",
  radiology: "Radiologia",
  emergency: "Pronto soccorso",
};

/** Le specialità indicate su OpenStreetMap, tradotte; i valori sconosciuti si tralasciano */
export function specialityLabels(tags: Record<string, string>): string[] {
  const labels = (tags["healthcare:speciality"] ?? "")
    .split(";")
    .map((v) => SPECIALITY_LABELS[v.trim().toLowerCase()])
    .filter((v): v is string => Boolean(v));
  if (tags.emergency === "yes") labels.unshift("Pronto soccorso");
  return [...new Set(labels)].slice(0, 6);
}

export function categoryOf(tags: Record<string, string>): string {
  const { amenity, healthcare } = tags;
  if (amenity === "hospital" || healthcare === "hospital") return "Ospedale";
  if (amenity === "dentist" || healthcare === "dentist") return "Studio dentistico";
  if (healthcare === "psychotherapist") return "Psicoterapeuta";
  if (amenity === "clinic" || healthcare === "clinic") return "Poliambulatorio";
  if (healthcare === "centre") return "Centro sanitario";
  if (amenity === "doctors" || healthcare === "doctor") return "Studio medico";
  return "Struttura sanitaria";
}

export function addressOf(tags: Record<string, string>): string | null {
  const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
  const city = [tags["addr:postcode"], tags["addr:city"]].filter(Boolean).join(" ");
  const address = [street, city].filter(Boolean).join(", ") || tags["addr:full"]?.trim() || "";
  return address ? address.slice(0, 200) : null;
}

const elementSchema = z.object({
  type: z.enum(["node", "way", "relation"]),
  id: z.number().int().positive(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  center: z.object({ lat: z.number(), lon: z.number() }).optional(),
  tags: z.record(z.string(), z.string()).optional(),
});

const overpassResponseSchema = z.object({ elements: z.array(z.unknown()) });

export class OverpassFormatError extends Error {}

/** Trasforma la risposta JSON di Overpass in medici validati; gli elementi non validi si scartano */
export function parseOverpass(json: unknown, center: LatLon): Doctor[] {
  const parsed = overpassResponseSchema.safeParse(json);
  if (!parsed.success) throw new OverpassFormatError("Risposta di Overpass non valida");
  const doctors: Doctor[] = [];
  for (const raw of parsed.data.elements) {
    const element = elementSchema.safeParse(raw);
    if (!element.success) continue;
    const e = element.data;
    const point = e.center ?? (e.lat !== undefined && e.lon !== undefined ? { lat: e.lat, lon: e.lon } : null);
    if (!point) continue;
    const tags = e.tags ?? {};
    const category = categoryOf(tags);
    const name = (tags.name ?? tags["name:it"] ?? tags.official_name)?.trim().slice(0, 160);
    const candidate: Doctor = {
      id: `osm:${e.type}/${e.id}`,
      name: name || category,
      unnamed: !name,
      category,
      specialties: specialityLabels(tags),
      address: addressOf(tags),
      lat: point.lat,
      lon: point.lon,
      distanceM: Math.round(distanceM(center, point)),
      phone: phoneLink(tags.phone ?? tags["contact:phone"] ?? tags["contact:mobile"]),
      email: emailAddress(tags.email ?? tags["contact:email"]),
      website: websiteUrl(tags.website ?? tags["contact:website"] ?? tags.url),
      hours: openingHoursLines(tags.opening_hours),
      openNow: null,
      rating: null,
      wheelchair: tags.wheelchair === "yes" ? true : tags.wheelchair === "no" ? false : null,
      googleMaps: null,
      attributions: [],
    };
    const checked = doctorSchema.safeParse(candidate);
    if (checked.success) doctors.push(checked.data);
  }
  return doctors;
}
