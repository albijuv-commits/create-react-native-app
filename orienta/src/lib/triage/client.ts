import { z } from "zod";
import { triageResponseSchema, type TriageRequest, type TriageResponse } from "./schema";

/**
 * Chiamate del browser alla route /api/triage. La chiave dell'AI resta sul server; anche qui
 * ogni risposta passa da Zod prima di arrivare all'interfaccia.
 */

const availabilitySchema = z.object({ ai: z.boolean() });
const errorSchema = z.object({ kind: z.literal("error"), message: z.string().max(300) });

/** true se il server può usare l'AI. In caso di dubbio no: si usa il metodo semplificato. */
export async function fetchAiAvailability(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch("/api/triage", { cache: "no-store", signal });
    if (!res.ok) return false;
    const parsed = availabilitySchema.safeParse(await res.json());
    return parsed.success && parsed.data.ai;
  } catch {
    return false;
  }
}

export class TriageRequestError extends Error {}

/** Un passo dell'intervista con l'AI: da chiamare solo dopo il consenso esplicito della persona. */
export async function postTriageStep(req: TriageRequest, signal?: AbortSignal): Promise<TriageResponse> {
  let res: Response;
  try {
    res = await fetch("/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...req, consent: true }),
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new TriageRequestError("Non riusciamo a raggiungere il servizio. Controlla la connessione.");
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new TriageRequestError("La risposta del servizio non è leggibile.");
  }
  if (!res.ok) {
    const error = errorSchema.safeParse(json);
    throw new TriageRequestError(error.success ? error.data.message : "Qualcosa è andato storto.");
  }
  const parsed = triageResponseSchema.safeParse(json);
  if (!parsed.success) throw new TriageRequestError("La risposta del servizio non è valida.");
  return parsed.data;
}
