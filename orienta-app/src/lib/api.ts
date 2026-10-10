import { DoctorsRequestError, fetchDoctors, fetchPlace } from "@/lib/doctors/client";
import { roundPoint } from "@/lib/doctors/geo";
import { exampleDoctors } from "@/lib/doctors/mock";
import type { DoctorSearchRequest, DoctorSearchResponse, Place } from "@/lib/doctors/schema";
import { TriageRequestError, fetchAiAvailability, postTriageStep } from "@/lib/triage/client";
import type { TriageRequest, TriageResponse } from "@/lib/triage/schema";

/**
 * L'indirizzo della web app pubblicata, dove stanno le route server (/api/triage, /api/medici,
 * /api/luoghi): l'app non contiene chiavi. Non è un segreto: si imposta con EXPO_PUBLIC_API_URL
 * quando si crea la build. Senza indirizzo l'intervista usa solo le regole fisse, sul telefono, e
 * la sezione Medici mostra soltanto DATI DI ESEMPIO.
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

/** Perché senza servizio si vedono studi finti: lo dice anche l'etichetta DATI DI ESEMPIO */
export const EXAMPLE_DOCTORS_NOTICE = "La ricerca dei medici reali non è attiva in questa app: questi sono DATI DI ESEMPIO, non studi veri.";

/**
 * I medici vicini, tramite /api/medici della web app (la posizione parte arrotondata a circa 100
 * metri). Senza servizio: i dati di esempio della web app, calcolati qui intorno al punto di ricerca.
 */
export async function searchDoctors(req: DoctorSearchRequest, signal?: AbortSignal): Promise<DoctorSearchResponse> {
  const base = apiBaseUrl();
  if (base) return fetchDoctors(req, signal, base);
  return { source: "esempio", doctors: exampleDoctors(req.specialty, roundPoint(req), req.radiusKm * 1000), notice: EXAMPLE_DOCTORS_NOTICE };
}

/** Città o CAP → coordinate, tramite /api/luoghi della web app: senza servizio non si può cercare un luogo */
export async function findPlace(q: string, signal?: AbortSignal): Promise<Place | null> {
  const base = apiBaseUrl();
  if (!base) throw new DoctorsRequestError("La ricerca per città o CAP passa dal servizio di Orienta, che non è configurato in questa app: usa la tua posizione.");
  return fetchPlace(q, signal, base);
}
