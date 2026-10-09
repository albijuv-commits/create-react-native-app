import { z } from "zod";
import { phoneLink, websiteUrl } from "./contact";
import { distanceM, type LatLon } from "./geo";
import { doctorSchema, type Doctor } from "./schema";

/**
 * Google Places API (New), Text Search: https://developers.google.com/maps/documentation/places/web-service/text-search
 * Termini d'uso rispettati qui e nell'interfaccia:
 * - i risultati non si mettono in cache (fa eccezione solo il place ID, che qui non serve conservare);
 * - si mostrano con l'attribuzione «Google Maps» e quella dei fornitori di dati, se presente;
 * - non si mostrano su mappe non Google: con questi risultati la vista mappa è disattivata.
 */
export const PLACES_TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

export const PLACES_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.regularOpeningHours.weekdayDescriptions",
  "places.currentOpeningHours.openNow",
  "places.googleMapsUri",
  "places.googleMapsLinks",
  "places.attributions",
  "places.accessibilityOptions",
].join(",");

export function buildPlacesRequest(textQuery: string, center: LatLon, radiusM: number) {
  return {
    textQuery,
    languageCode: "it",
    regionCode: "IT",
    pageSize: 20,
    locationBias: { circle: { center: { latitude: center.lat, longitude: center.lon }, radius: Math.min(50_000, Math.round(radiusM)) } },
  };
}

const placeSchema = z.object({
  id: z.string().min(1),
  displayName: z.object({ text: z.string() }).optional(),
  formattedAddress: z.string().optional(),
  location: z.object({ latitude: z.number(), longitude: z.number() }).optional(),
  nationalPhoneNumber: z.string().optional(),
  internationalPhoneNumber: z.string().optional(),
  websiteUri: z.string().optional(),
  rating: z.number().optional(),
  userRatingCount: z.number().optional(),
  regularOpeningHours: z.object({ weekdayDescriptions: z.array(z.string()).optional() }).optional(),
  currentOpeningHours: z.object({ openNow: z.boolean().optional() }).optional(),
  googleMapsUri: z.string().optional(),
  googleMapsLinks: z.object({ directionsUri: z.string().optional(), placeUri: z.string().optional() }).optional(),
  attributions: z.array(z.object({ provider: z.string().optional(), providerUri: z.string().optional() })).optional(),
  accessibilityOptions: z.object({ wheelchairAccessibleEntrance: z.boolean().optional() }).optional(),
});

const responseSchema = z.object({ places: z.array(z.unknown()).optional() });

export class PlacesFormatError extends Error {}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Trasforma la risposta di Text Search in medici validati; i luoghi non validi si scartano */
export function parsePlaces(json: unknown, center: LatLon, specialtyLabel: string): Doctor[] {
  const parsed = responseSchema.safeParse(json);
  if (!parsed.success) throw new PlacesFormatError("Risposta di Google Places non valida");
  const doctors: Doctor[] = [];
  for (const raw of parsed.data.places ?? []) {
    const place = placeSchema.safeParse(raw);
    if (!place.success) continue;
    const p = place.data;
    const name = p.displayName?.text.trim();
    if (!name || !p.location) continue;
    const point = { lat: p.location.latitude, lon: p.location.longitude };
    const phone = phoneLink(p.internationalPhoneNumber ?? p.nationalPhoneNumber);
    const candidate: Doctor = {
      id: `google:${p.id}`,
      name: name.slice(0, 160),
      unnamed: false,
      category: specialtyLabel,
      specialties: [],
      address: p.formattedAddress?.trim().slice(0, 200) || null,
      lat: point.lat,
      lon: point.lon,
      distanceM: Math.round(distanceM(center, point)),
      // Si mostra il numero nel formato nazionale, il link usa quello internazionale
      phone: phone ? { display: p.nationalPhoneNumber?.trim() || phone.display, href: phone.href } : null,
      email: null,
      website: websiteUrl(p.websiteUri),
      hours: p.regularOpeningHours?.weekdayDescriptions?.length ? p.regularOpeningHours.weekdayDescriptions.slice(0, 7).map(capitalize) : null,
      openNow: p.currentOpeningHours?.openNow ?? null,
      rating: p.rating !== undefined && p.rating >= 1 ? { value: p.rating, count: Math.max(0, Math.round(p.userRatingCount ?? 0)) } : null,
      wheelchair: p.accessibilityOptions?.wheelchairAccessibleEntrance ?? null,
      googleMaps: { place: websiteUrl(p.googleMapsLinks?.placeUri ?? p.googleMapsUri), directions: websiteUrl(p.googleMapsLinks?.directionsUri) },
      attributions: (p.attributions ?? [])
        .filter((a) => a.provider?.trim())
        .slice(0, 5)
        .map((a) => ({ provider: a.provider!.trim().slice(0, 120), uri: websiteUrl(a.providerUri) })),
    };
    const checked = doctorSchema.safeParse(candidate);
    if (checked.success) doctors.push(checked.data);
  }
  return doctors;
}
