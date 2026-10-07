"use client";

import { useEffect } from "react";

/** Registra il service worker solo in produzione, per non interferire con il dev server. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // L'app funziona anche senza service worker: nessun errore da mostrare.
    });
  }, []);
  return null;
}
