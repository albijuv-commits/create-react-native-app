"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_PREFS, PREFS_STORAGE_KEY, parsePrefs, resolveTheme, type Prefs } from "./prefs";

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cached: Prefs = DEFAULT_PREFS;

function read(): Prefs {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(PREFS_STORAGE_KEY);
  } catch {
    // Archiviazione non disponibile (navigazione privata): restano i default
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parsePrefs(raw);
  }
  return cached;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** Applica le preferenze all'elemento html (stesso effetto dello script di avvio). */
export function applyPrefs(prefs: Prefs) {
  const root = document.documentElement;
  root.dataset.theme = resolveTheme(prefs.theme, matchMedia("(prefers-color-scheme: dark)").matches);
  if (prefs.textSize === "normal") delete root.dataset.textSize;
  else root.dataset.textSize = prefs.textSize;
}

export function usePrefs(): [Prefs, (patch: Partial<Prefs>) => void] {
  const prefs = useSyncExternalStore(subscribe, read, () => DEFAULT_PREFS);
  const update = useCallback((patch: Partial<Prefs>) => {
    const next = { ...read(), ...patch };
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Se non si può salvare, la preferenza vale solo per questa sessione
    }
    applyPrefs(next);
    listeners.forEach((l) => l());
  }, []);
  return [prefs, update];
}
