/**
 * Il riepilogo dei sintomi passa dai Risultati alla sezione Medici solo in memoria, finché l'app
 * resta aperta (come sessionStorage nella web app): non va al server e non resta sul telefono.
 * Servirà per precompilare l'email al medico, se la persona lo vuole.
 */
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

let saved: { text: string; savedAt: number } | null = null;

export function saveSummaryForDoctors(text: string, now = Date.now()): void {
  saved = text.trim() ? { text, savedAt: now } : null;
}

export function readSummaryForDoctors(now = Date.now()): string | null {
  if (!saved || now - saved.savedAt >= MAX_AGE_MS) {
    saved = null;
    return null;
  }
  return saved.text;
}

export function clearSummaryForDoctors(): void {
  saved = null;
}
