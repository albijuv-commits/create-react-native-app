/**
 * Il riepilogo dei sintomi passa dai Risultati alla sezione Medici solo dentro questa scheda del
 * browser (sessionStorage): non va nell'indirizzo, non va al server e sparisce chiudendo la scheda.
 * Serve per precompilare l'email al medico, se la persona lo vuole.
 */
const KEY = "orienta:riepilogo-per-il-medico";
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

export function saveSummaryForDoctors(text: string, now = Date.now()): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ text, savedAt: now }));
  } catch {
    // Archiviazione non disponibile (navigazione privata o disattivata): l'email resterà senza riepilogo
  }
}

export function readSummaryForDoctors(now = Date.now()): string | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (
      typeof data === "object" &&
      data !== null &&
      "text" in data &&
      "savedAt" in data &&
      typeof data.text === "string" &&
      typeof data.savedAt === "number" &&
      now - data.savedAt < MAX_AGE_MS &&
      data.text.trim()
    ) {
      return data.text;
    }
    sessionStorage.removeItem(KEY);
    return null;
  } catch {
    return null;
  }
}

export function clearSummaryForDoctors(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Niente da togliere
  }
}
