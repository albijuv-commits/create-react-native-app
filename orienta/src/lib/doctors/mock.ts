import { getSpecialty, type SpecialtyId } from "@data/vocab/specialties";
import { destination, distanceM, type LatLon } from "./geo";
import type { Doctor } from "./schema";

/**
 * DATI DI ESEMPIO, usati solo quando non si possono cercare medici reali. Non esistono:
 * nomi dichiaratamente fittizi, nessun numero di telefono, email e siti solo sui domini
 * example.com riservati agli esempi (RFC 2606), quindi non raggiungono nessuno. Le posizioni
 * sono calcolate intorno al punto di ricerca, così la lista e la mappa funzionano ovunque.
 */
const SPOTS: ReadonlyArray<{ distance: number; bearing: number; email?: true; website?: true }> = [
  { distance: 450, bearing: 35, email: true, website: true },
  { distance: 1_200, bearing: 150 },
  { distance: 2_600, bearing: 260, email: true },
  { distance: 4_100, bearing: 320, website: true },
  { distance: 6_800, bearing: 95, email: true },
  { distance: 9_300, bearing: 205 },
  { distance: 14_500, bearing: 15, email: true, website: true },
  { distance: 21_000, bearing: 130 },
];

function placeName(specialty: SpecialtyId, n: number): { name: string; category: string } {
  if (specialty === "pronto-soccorso") return { name: `Ospedale di esempio ${n}`, category: "Ospedale" };
  if (specialty === "dentista") return { name: `Studio dentistico di esempio ${n}`, category: "Studio dentistico" };
  return { name: `Studio medico di esempio ${n}`, category: "Studio medico" };
}

export function exampleDoctors(specialty: SpecialtyId, center: LatLon, radiusM: number): Doctor[] {
  const label = getSpecialty(specialty).label;
  return SPOTS.filter((s) => s.distance <= radiusM).map((spot, i) => {
    const n = i + 1;
    const point = destination(center, spot.distance, spot.bearing);
    return {
      id: `esempio:${specialty}:${n}`,
      ...placeName(specialty, n),
      unnamed: false,
      specialties: [label],
      address: "Indirizzo di esempio",
      lat: point.lat,
      lon: point.lon,
      distanceM: Math.round(distanceM(center, point)),
      phone: null,
      email: spot.email ? `esempio${n}@example.com` : null,
      website: spot.website ? "https://www.example.com/" : null,
      hours: null,
      openNow: null,
      rating: null,
      wheelchair: null,
      googleMaps: null,
      attributions: [],
    };
  });
}
