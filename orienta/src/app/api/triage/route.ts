import { connection, NextResponse } from "next/server";
import { z } from "zod";
import { triageConditions } from "@/lib/conditions/catalog";
import { AiCallError, aiAvailable, aiStep, pendingCoreQuestions } from "@/lib/triage/ai";
import { redFlagsFor, rulesStep } from "@/lib/triage/engine";
import { allowRequest, allowTotal, clientKey } from "@/lib/server/rate-limit";
import { triageRequestSchema, type TriageResponse } from "@/lib/triage/schema";

/**
 * Intervista sui sintomi. I dati sanitari arrivano qui solo con il consenso esplicito
 * (`consent: true`) e non vengono salvati né scritti nei log: si usano per la risposta e basta.
 */
const NO_STORE = { "Cache-Control": "no-store" };

const bodySchema = triageRequestSchema.extend({ consent: z.literal(true) });

function respond(data: TriageResponse) {
  return NextResponse.json(data, { headers: NO_STORE });
}

function failure(status: number, message: string, reason?: string) {
  return NextResponse.json({ kind: "error", message, reason }, { status, headers: NO_STORE });
}

/** Dice al browser se l'intervista con l'AI è disponibile (la chiave resta sul server) */
export async function GET() {
  await connection();
  return NextResponse.json({ ai: aiAvailable() }, { headers: NO_STORE });
}

export async function POST(request: Request) {
  // Ogni passo con l'AI ha un costo: un limite per indirizzo evita gli abusi (l'indirizzo non si registra)
  // e un tetto complessivo che tiene sotto controllo il costo anche se le chiavi vengono aggirate
  if (!allowRequest(`triage:${clientKey(request)}`, 60, 10 * 60 * 1000) || !allowTotal("triage", 300, 10 * 60 * 1000)) {
    return failure(429, "Hai fatto molte richieste in poco tempo: aspetta qualche minuto, oppure continua con il metodo semplificato.");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure(400, "Non riusciamo a leggere la richiesta.");
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return failure(400, "I dati dell'intervista non sono validi.");
  // `consent` è già verificato dallo schema: il resto è la richiesta dell'intervista
  const req = parsed.data;
  const conditions = triageConditions();

  // 1. Segnali d'allarme: codice deterministico, prima di qualsiasi chiamata al modello
  const flags = redFlagsFor(req);
  if (flags.length) return respond({ kind: "emergency", flags });

  // 2. Senza chiave si usa il motore a regole
  if (!aiAvailable()) return respond(rulesStep(conditions, req));

  // 3. Le domande fisse (segnali d'allarme, durata, intensità) arrivano subito, senza attendere il modello
  const core = pendingCoreQuestions(req);
  if (core.length) return respond({ kind: "questions", source: "regole", questions: core });

  // 4. Il modello propone altre domande o sceglie le condizioni tra quelle della base di conoscenza
  try {
    return respond(await aiStep(req, conditions));
  } catch (error) {
    if (error instanceof AiCallError) {
      return failure(502, "In questo momento non riusciamo a completare l'analisi con l'AI.", error.reason);
    }
    console.error("triage: errore inatteso");
    return failure(500, "Qualcosa è andato storto.");
  }
}
