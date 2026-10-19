import { NextResponse } from "next/server";
import { medicineDetailFor } from "@/lib/medicines/detail";
import { detailRequestSchema } from "@/lib/medicines/types";
import { allowRequest, clientKey } from "@/lib/server/rate-limit";

/**
 * La scheda di una confezione per l'app nativa (la web app la disegna sul server). Il codice AIC
 * resta nel corpo della richiesta, non nell'indirizzo, e non viene salvato.
 */
const NO_STORE = { "Cache-Control": "no-store" };

function failure(status: number, message: string) {
  return NextResponse.json({ message }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  if (!allowRequest(`farmaci-scheda:${clientKey(request)}`, 120, 60 * 1000)) {
    return failure(429, "Hai fatto molte richieste in poco tempo: aspetta un momento e riprova.");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure(400, "Non riusciamo a leggere la richiesta.");
  }
  const parsed = detailRequestSchema.safeParse(body);
  if (!parsed.success) return failure(400, "Il codice del farmaco non è valido.");
  try {
    const detail = medicineDetailFor(parsed.data.aic);
    if (!detail) return failure(404, "Questa confezione non è nel catalogo.");
    return NextResponse.json(detail, { headers: NO_STORE });
  } catch {
    console.error("farmaci-scheda: errore inatteso");
    return failure(500, "Il catalogo non è disponibile in questo momento.");
  }
}
