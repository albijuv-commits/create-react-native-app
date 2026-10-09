"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const CHANGE_EVENT = "orienta:urlchange";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Lo stato nella parte dopo «#»; un'ancora come «#contenuto» non è uno stato */
function readState(): string {
  const hash = window.location.hash.slice(1);
  return hash.includes("=") ? hash : "";
}

/**
 * I parametri usati come stato della pagina (ricerca, filtri, specialista consigliato) stanno
 * nella parte dell'indirizzo dopo «#»: un link li conserva e un ricaricamento non li perde, ma
 * non partono mai verso il server, dove finirebbero nei log. Una ricerca o una condizione può
 * dire qualcosa sulla salute di chi usa l'app. Sul server e durante l'idratazione valgono vuoti,
 * quindi la pagina resta statica; gli aggiornamenti usano replaceState, senza navigare.
 */
export function useUrlParams(): [URLSearchParams, (updates: Record<string, string | null>) => void] {
  const state = useSyncExternalStore(subscribe, readState, () => "");
  const params = useMemo(() => new URLSearchParams(state), [state]);

  const update = useCallback((updates: Record<string, string | null>) => {
    const next = new URLSearchParams(readState());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const hash = next.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash ? `#${hash}` : ""}`);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return [params, update];
}
