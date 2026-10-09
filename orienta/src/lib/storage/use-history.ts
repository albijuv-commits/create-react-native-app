"use client";

import { useEffect, useState } from "react";
import { HISTORY_EVENT, listSessions, type HistoryEntry } from "./history";

export type HistoryState = { status: "loading" } | { status: "unavailable" } | { status: "ready"; sessions: HistoryEntry[] };

/** Le sessioni salvate su questo dispositivo, aggiornate quando lo storico cambia */
export function useHistory(): HistoryState {
  const [state, setState] = useState<HistoryState>({ status: "loading" });
  useEffect(() => {
    let alive = true;
    const load = () =>
      listSessions().then(
        (sessions) => {
          if (alive) setState({ status: "ready", sessions });
        },
        () => {
          if (alive) setState({ status: "unavailable" });
        },
      );
    void load();
    window.addEventListener(HISTORY_EVENT, load);
    return () => {
      alive = false;
      window.removeEventListener(HISTORY_EVENT, load);
    };
  }, []);
  return state;
}
