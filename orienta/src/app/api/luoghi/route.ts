import { NextResponse } from "next/server";
import { GeocodeError, geocodePlace } from "@/lib/doctors/geocode";
import { placeRequestSchema } from "@/lib/doctors/schema";
import { allowRequest, allowTotal, clientKey } from "@/lib/server/rate-limit";

/** Città o CAP → coordinate, tramite Nominatim con cache e limite di una richiesta al secondo */
const NO_STORE = { "Cache-Control": "no-store" };

function failure(status: number, message: string) {
  return NextResponse.json({ message }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  // Per indirizzo e in tutto: Nominatim chiede al massimo una richiesta al secondo
  if (!allowRequest(`luoghi:${clientKey(request)}`, 20, 5 * 60 * 1000) || !allowTotal("luoghi", 150, 5 * 60 * 1000)) {
    return failure(429, "Hai fatto molte ricerche in poco tempo: aspetta qualche minuto e riprova.");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure(400, "Non riusciamo a leggere la richiesta.");
  }
  const parsed = placeRequestSchema.safeParse(body);
  if (!parsed.success) return failure(400, "Scrivi il nome di una città o un CAP.");
  try {
    return NextResponse.json({ place: await geocodePlace(parsed.data.q) }, { headers: NO_STORE });
  } catch (error) {
    if (error instanceof GeocodeError) return failure(502, "In questo momento non riusciamo a cercare il luogo. Riprova o usa la tua posizione.");
    console.error("luoghi: errore inatteso");
    return failure(500, "Qualcosa è andato storto. Riprova tra poco.");
  }
}
