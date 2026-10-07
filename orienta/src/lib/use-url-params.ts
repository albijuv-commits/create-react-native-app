"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const CHANGE_EVENT = "orienta:urlchange";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * I parametri dell'indirizzo usati come stato della pagina (ricerca, filtri): così un link
 * li conserva e un ricaricamento non li perde. Sul server e durante l'idratazione valgono
 * vuoti, quindi la pagina resta statica; gli aggiornamenti usano replaceState, senza navigare.
 */
export function useUrlParams(): [URLSearchParams, (updates: Record<string, string | null>) => void] {
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => "");
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const update = useCallback((updates: Record<string, string | null>) => {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return [params, update];
}
