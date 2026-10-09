/**
 * Pulizia dei contatti che arrivano dai servizi esterni. Su OpenStreetMap chiunque può scrivere
 * qualsiasi cosa: un link diventa cliccabile solo se è davvero un telefono, un'email o un sito web.
 */

export interface PhoneLink {
  display: string;
  href: string;
}

/** Più valori nello stesso campo: OpenStreetMap usa «;», ma si trovano anche «,» e «/» */
function firstValue(raw: string): string {
  return raw.split(/\s*[;,/]\s*/)[0]?.trim() ?? "";
}

export function phoneLink(raw: string | null | undefined): PhoneLink | null {
  if (!raw) return null;
  const display = firstValue(raw).replace(/\s+/g, " ");
  if (!/^[+(0-9][0-9 ().-]*$/.test(display)) return null;
  let digits = display.replace(/[^0-9+]/g, "");
  if (digits.startsWith("00")) digits = `+${digits.slice(2)}`;
  const plus = digits.startsWith("+") ? "+" : "";
  const number = digits.replace(/\+/g, "");
  if (number.length < 3 || number.length > 15) return null;
  return { display, href: `tel:${plus}${number}` };
}

const EMAIL = /^[A-Za-z0-9._%+-]{1,64}@(?:[A-Za-z0-9-]{1,63}\.)+[A-Za-z]{2,24}$/;

export function emailAddress(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = firstValue(raw).replace(/^mailto:/i, "");
  return EMAIL.test(value) && value.length <= 254 ? value : null;
}

/** Solo http e https; «www.esempio.it» diventa «https://www.esempio.it/» */
export function websiteUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let value = raw.trim().split(/\s*;\s*/)[0] ?? "";
  if (!value || /\s/.test(value)) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    if (!/^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+([/?#].*)?$/.test(value)) return null;
    value = `https://${value}`;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".") || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

const DAYS: Record<string, string> = { Mo: "Lun", Tu: "Mar", We: "Mer", Th: "Gio", Fr: "Ven", Sa: "Sab", Su: "Dom", PH: "Festivi", SH: "Vacanze scolastiche" };
const MONTHS: Record<string, string> = {
  Jan: "gen",
  Feb: "feb",
  Mar: "mar",
  Apr: "apr",
  May: "mag",
  Jun: "giu",
  Jul: "lug",
  Aug: "ago",
  Sep: "set",
  Oct: "ott",
  Nov: "nov",
  Dec: "dic",
};

/**
 * Gli orari di OpenStreetMap («Mo-Fr 09:00-13:00; Sa 09:00-12:00») resi leggibili, una riga per
 * regola. Non interpreta la sintassi completa: traduce giorni e mesi e lascia il resto com'è.
 */
export function openingHoursLines(raw: string | null | undefined): string[] | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || value.length > 400) return null;
  if (/^24\/7$/.test(value)) return ["Sempre aperto"];
  const lines = value
    .split(/\s*;\s*|\s*\|\|\s*/)
    .filter(Boolean)
    .slice(0, 8)
    .map((rule) =>
      rule
        .replace(/"([^"]*)"/g, "($1)")
        .replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su|PH|SH)\b/g, (d) => DAYS[d] ?? d)
        .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, (m) => MONTHS[m] ?? m)
        .replace(/\b(off|closed)\b/gi, "chiuso")
        .replace(/\bopen\b/gi, "aperto")
        .replace(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/g, "$1–$2")
        .replace(/([A-Za-zà]{3,})\s*-\s*([A-Za-zà]{3,})/g, "$1–$2")
        .replace(/\s*,\s*/g, ", ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((line) => line.length > 0 && line.length <= 160);
  return lines.length ? lines : null;
}

export type Platform = "ios" | "altro";

export function detectPlatform(userAgent: string, maxTouchPoints = 0): Platform {
  if (/iPad|iPhone|iPod/.test(userAgent)) return "ios";
  // iPadOS si presenta come un Mac con lo schermo tattile
  if (/Macintosh/.test(userAgent) && maxTouchPoints > 1) return "ios";
  return "altro";
}

/**
 * Le indicazioni stradali nell'app di mappe del telefono. Per i risultati di Google si usa il link
 * fornito da Google stesso, come chiedono i suoi termini d'uso.
 */
export function directionsUrl(
  place: { lat: number; lon: number; name: string; googleMaps: { place: string | null; directions: string | null } | null },
  platform: Platform,
): string {
  if (place.googleMaps) {
    const link = place.googleMaps.directions ?? place.googleMaps.place;
    if (link) return link;
  }
  const point = `${place.lat.toFixed(6)},${place.lon.toFixed(6)}`;
  if (platform === "ios") return `https://maps.apple.com/?daddr=${point}&q=${encodeURIComponent(place.name)}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${point}`;
}
