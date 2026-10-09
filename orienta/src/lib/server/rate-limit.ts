import "server-only";

/**
 * Limiti di richieste (finestra fissa, in memoria). Proteggono i servizi gratuiti che usiamo per
 * conto delle persone, come Nominatim e Overpass, e le chiamate a servizi a pagamento (AI, Google).
 * - `allowRequest`, per chiave: di solito l'indirizzo IP, che serve solo come chiave temporanea e
 *   non si registra da nessuna parte. Viene da X-Forwarded-For, che chi chiama può falsificare se
 *   davanti all'app non c'è un proxy che lo riscrive: per questo ci sono anche i tetti complessivi.
 * - `allowTotal`, un tetto complessivo uguale per tutti, che regge anche se le chiavi vengono aggirate.
 */
type Window = { count: number; resetAt: number };

/** Oltre questo numero di chiavi si tolgono le più vecchie: la memoria resta limitata */
const MAX_KEYS = 10_000;
const windows = new Map<string, Window>();
const totals = new Map<string, Window>();

function hit(map: Map<string, Window>, key: string, limit: number, windowMs: number, now: number): boolean {
  const current = map.get(key);
  if (!current || current.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function allowRequest(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  if (windows.size >= MAX_KEYS && !windows.has(key)) {
    for (const [k, v] of windows) if (v.resetAt <= now) windows.delete(k);
    for (const k of windows.keys()) {
      if (windows.size < MAX_KEYS) break;
      windows.delete(k);
    }
  }
  return hit(windows, key, limit, windowMs, now);
}

export function allowTotal(name: string, limit: number, windowMs: number, now = Date.now()): boolean {
  return hit(totals, name, limit, windowMs, now);
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "locale";
}
