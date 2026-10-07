import { roundPoint } from "./geo";
import {
  apiErrorSchema,
  doctorSearchResponseSchema,
  placeResponseSchema,
  type DoctorSearchRequest,
  type DoctorSearchResponse,
  type Place,
} from "./schema";

/**
 * Chiamate del browser alle route /api/medici e /api/luoghi. La posizione parte già arrotondata
 * a circa 100 metri; ogni risposta passa da Zod prima di arrivare all'interfaccia.
 */
export class DoctorsRequestError extends Error {}

async function post(url: string, body: unknown, signal?: AbortSignal): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store", signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new DoctorsRequestError("Non riusciamo a raggiungere il servizio. Controlla la connessione.");
  }
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new DoctorsRequestError("La risposta del servizio non è leggibile.");
  }
  if (!res.ok) {
    const error = apiErrorSchema.safeParse(json);
    throw new DoctorsRequestError(error.success ? error.data.message : "Qualcosa è andato storto. Riprova tra poco.");
  }
  return json;
}

export async function fetchDoctors(req: DoctorSearchRequest, signal?: AbortSignal): Promise<DoctorSearchResponse> {
  const json = await post("/api/medici", { ...req, ...roundPoint(req) }, signal);
  const parsed = doctorSearchResponseSchema.safeParse(json);
  if (!parsed.success) throw new DoctorsRequestError("La risposta del servizio non è valida.");
  return parsed.data;
}

export async function fetchPlace(q: string, signal?: AbortSignal): Promise<Place | null> {
  const json = await post("/api/luoghi", { q }, signal);
  const parsed = placeResponseSchema.safeParse(json);
  if (!parsed.success) throw new DoctorsRequestError("La risposta del servizio non è valida.");
  return parsed.data.place;
}
