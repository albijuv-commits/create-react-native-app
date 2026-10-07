import "server-only";

/**
 * Limite di richieste per chiave (finestra fissa, in memoria). Protegge i servizi gratuiti che
 * usiamo per conto delle persone, come Nominatim e Overpass, da un uso eccessivo tramite la nostra route.
 * L'indirizzo IP serve solo come chiave temporanea: non si registra da nessuna parte.
 */
const windows = new Map<string, { count: number; resetAt: number }>();

export function allowRequest(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    if (windows.size > 5_000) {
      for (const [k, v] of windows) if (v.resetAt <= now) windows.delete(k);
    }
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "locale";
}
