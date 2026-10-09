import { NextResponse } from "next/server";
import { medicinesByAic } from "@/lib/medicines/queries";
import { listRequestSchema } from "@/lib/medicines/types";
import { allowRequest, clientKey } from "@/lib/server/rate-limit";

/** Preferiti e confronto: l'elenco dei codici resta nel corpo della richiesta e non viene salvato */
const NO_STORE = { "Cache-Control": "no-store" };

function failure(status: number, message: string) {
  return NextResponse.json({ message }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  if (!allowRequest(`farmaci-elenco:${clientKey(request)}`, 120, 60 * 1000)) {
    return failure(429, "Hai fatto molte richieste in poco tempo: aspetta un momento e riprova.");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure(400, "Non riusciamo a leggere la richiesta.");
  }
  const parsed = listRequestSchema.safeParse(body);
  if (!parsed.success) return failure(400, "L'elenco dei farmaci non è valido.");
  try {
    return NextResponse.json({ items: medicinesByAic(parsed.data.aics) }, { headers: NO_STORE });
  } catch {
    console.error("farmaci: errore inatteso");
    return failure(500, "Il catalogo non è disponibile in questo momento.");
  }
}
