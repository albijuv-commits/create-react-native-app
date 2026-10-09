/** Calcoli geografici minimi per la ricerca dei medici: distanze, arrotondamenti, formattazione. */

export interface LatLon {
  lat: number;
  lon: number;
}

const EARTH_RADIUS_M = 6_371_008.8;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Distanza in linea d'aria (formula dell'emisenoverso), in metri */
export function distanceM(a: LatLon, b: LatLon): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Con 3 decimali la posizione resta precisa a circa 100 metri: basta per cercare i medici vicini
 * e non rivela l'indirizzo esatto ai servizi esterni.
 */
export function roundCoord(value: number, decimals = 3): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

export function roundPoint(p: LatLon, decimals = 3): LatLon {
  return { lat: roundCoord(p.lat, decimals), lon: roundCoord(p.lon, decimals) };
}

/** Il punto che si raggiunge partendo da `from` per `distance` metri nella direzione `bearingDeg` */
export function destination(from: LatLon, distance: number, bearingDeg: number): LatLon {
  const angle = distance / EARTH_RADIUS_M;
  const bearing = toRad(bearingDeg);
  const lat1 = toRad(from.lat);
  const lon1 = toRad(from.lon);
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(angle) + Math.cos(lat1) * Math.sin(angle) * Math.cos(bearing));
  const lon2 = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(angle) * Math.cos(lat1), Math.cos(angle) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: toDeg(lat2), lon: ((toDeg(lon2) + 540) % 360) - 180 };
}

const KM_DECIMAL = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const KM_WHOLE = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });

/** «350 m», «1,2 km», «14 km» */
export function formatDistance(meters: number): string {
  if (meters < 950) return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  const km = meters / 1000;
  return km < 10 ? `${KM_DECIMAL.format(km)} km` : `${KM_WHOLE.format(km)} km`;
}
