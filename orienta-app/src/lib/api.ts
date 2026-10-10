import { TriageRequestError, fetchAiAvailability, postTriageStep } from "@/lib/triage/client";
import type { TriageRequest, TriageResponse } from "@/lib/triage/schema";

/**
 * L'indirizzo della web app pubblicata, dove stanno le route server (per esempio /api/triage):
 * l'app non contiene chiavi. Non è un segreto: si imposta con EXPO_PUBLIC_API_URL quando si crea
 * la build. Senza indirizzo l'intervista usa solo le regole fisse, sul telefono.
 */
export function apiBaseUrl(): string | null {
  const url = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  return url ? url : null;
}

/** true se il server può usare l'AI. Senza indirizzo o in caso di dubbio no: si usa il metodo semplificato */
export async function aiAvailable(signal?: AbortSignal): Promise<boolean> {
  const base = apiBaseUrl();
  return base ? fetchAiAvailability(signal, base) : false;
}

/** Un passo dell'intervista con l'AI: da chiamare solo dopo il consenso esplicito della persona */
export async function postStep(req: TriageRequest, signal?: AbortSignal): Promise<TriageResponse> {
  const base = apiBaseUrl();
  if (!base) throw new TriageRequestError("Il servizio con l'intelligenza artificiale non è configurato in questa app.");
  return postTriageStep(req, signal, base);
}
