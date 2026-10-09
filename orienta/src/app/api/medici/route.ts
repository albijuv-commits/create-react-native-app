import { NextResponse } from "next/server";
import { doctorSearchRequestSchema } from "@/lib/doctors/schema";
import { searchDoctors } from "@/lib/doctors/search";
import { allowRequest, allowTotal, clientKey } from "@/lib/server/rate-limit";

/**
 * Ricerca dei medici vicini. Arriva una posizione già arrotondata a circa 100 metri e una
 * specialità: non si salvano e non si scrivono nei log. La chiave di Google resta qui.
 * POST e non GET, così posizione e specialità non finiscono negli indirizzi registrati dai proxy.
 */
const NO_STORE = { "Cache-Control": "no-store" };

function failure(status: number, message: string) {
  return NextResponse.json({ message }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  // Per indirizzo e in tutto: Overpass è gratuito e Google Places si paga
  if (!allowRequest(`medici:${clientKey(request)}`, 30, 5 * 60 * 1000) || !allowTotal("medici", 150, 5 * 60 * 1000)) {
    return failure(429, "Hai fatto molte ricerche in poco tempo: aspetta qualche minuto e riprova.");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure(400, "Non riusciamo a leggere la richiesta.");
  }
  const parsed = doctorSearchRequestSchema.safeParse(body);
  if (!parsed.success) return failure(400, "I dati della ricerca non sono validi.");
  try {
    return NextResponse.json(await searchDoctors(parsed.data, undefined, request.signal), { headers: NO_STORE });
  } catch {
    console.error("medici: errore inatteso");
    return failure(500, "Qualcosa è andato storto. Riprova tra poco.");
  }
}
