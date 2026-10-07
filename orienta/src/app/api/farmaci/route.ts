import { NextResponse } from "next/server";
import { catalogInfo, searchCatalog } from "@/lib/medicines/queries";
import { catalogQuerySchema } from "@/lib/medicines/types";
import { allowRequest, clientKey } from "@/lib/server/rate-limit";

/**
 * Ricerca nel catalogo dei medicinali. POST e non GET: i termini cercati (spesso legati alla
 * salute) non finiscono negli indirizzi registrati dai proxy. Nulla viene salvato.
 */
const NO_STORE = { "Cache-Control": "no-store" };

function failure(status: number, message: string) {
  return NextResponse.json({ message }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  if (!allowRequest(`farmaci:${clientKey(request)}`, 120, 60 * 1000)) {
    return failure(429, "Hai fatto molte ricerche in poco tempo: aspetta un momento e riprova.");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure(400, "Non riusciamo a leggere la richiesta.");
  }
  const parsed = catalogQuerySchema.safeParse(body);
  if (!parsed.success) return failure(400, "I filtri della ricerca non sono validi.");
  try {
    return NextResponse.json({ info: catalogInfo(), page: searchCatalog(parsed.data) }, { headers: NO_STORE });
  } catch {
    console.error("farmaci: errore inatteso");
    return failure(500, "Il catalogo non è disponibile in questo momento.");
  }
}
