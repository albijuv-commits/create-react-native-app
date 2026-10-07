import { NextResponse } from "next/server";
import { brandsResponseFor } from "@/lib/medicines/brands";
import { brandsRequestSchema } from "@/lib/medicines/types";
import { allowRequest, clientKey } from "@/lib/server/rate-limit";

/** Marchi, aziende e fascia di prezzo per una confezione del catalogo (riquadro espandibile della card) */
const HEADERS = { "Cache-Control": "no-store" };

function failure(status: number, message: string) {
  return NextResponse.json({ message }, { status, headers: HEADERS });
}

export async function POST(request: Request) {
  if (!allowRequest(`farmaci-marchi:${clientKey(request)}`, 120, 60 * 1000)) {
    return failure(429, "Hai fatto molte richieste in poco tempo: aspetta un momento e riprova.");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure(400, "Non riusciamo a leggere la richiesta.");
  }
  const parsed = brandsRequestSchema.safeParse(body);
  if (!parsed.success) return failure(400, "Il codice del farmaco non è valido.");
  try {
    const result = brandsResponseFor(parsed.data.aic);
    if (!result) return failure(404, "Per questa confezione non ci sono altri marchi da mostrare.");
    return NextResponse.json(result, { headers: HEADERS });
  } catch {
    console.error("farmaci-marchi: errore inatteso");
    return failure(500, "Il catalogo non è disponibile in questo momento.");
  }
}
