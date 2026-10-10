import { useSyncExternalStore } from "react";

/**
 * Il riepilogo dei sintomi passa dai Risultati alla sezione Medici solo in memoria, finché l'app
 * resta aperta (come sessionStorage nella web app): non va al server e non resta sul telefono.
 * Serve per precompilare l'email al medico, se la persona lo vuole.
 */
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

let saved: { text: string; savedAt: number } | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function saveSummaryForDoctors(text: string, now = Date.now()): void {
  saved = text.trim() ? { text, savedAt: now } : null;
  notify();
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
  notify();
}

export function subscribeSummaryForDoctors(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Il riepilogo pronto per i Medici, aggiornato quando lo si prepara dai Risultati o lo si toglie */
export function useSummaryForDoctors(): string | null {
  return useSyncExternalStore(subscribeSummaryForDoctors, readSummaryForDoctors, () => null);
}
