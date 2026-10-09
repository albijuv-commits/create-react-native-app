import { resetPrefs } from "@/lib/prefs/use-prefs";
import { deleteHistoryDatabase, HISTORY_EVENT } from "./history";

/**
 * «Elimina tutti i miei dati»: tutto ciò che Orienta ha conservato su questo dispositivo.
 * - storico delle sessioni (IndexedDB);
 * - preferenze, città predefinita, preferiti e confronto del Mercato (localStorage);
 * - riepilogo per il medico passato alla sezione Medici (sessionStorage);
 * - pagine salvate dal service worker per l'uso senza rete (restano solo quelle di base, come
 *   la pagina Emergenza, che non contengono dati personali).
 * Sul server non c'è niente da eliminare: Orienta non conserva dati delle persone.
 */
export const STORAGE_PREFIX = "orienta:";
const LIST_EVENT = "orienta:liste-farmaci";
export const CLEAR_CACHE_MESSAGE = "orienta:svuota-cache";

export type ErasePart = "storico" | "preferenze e liste" | "dati della scheda" | "pagine offline";

function clearPrefixed(storage: Storage) {
  for (const key of Object.keys(storage)) if (key.startsWith(STORAGE_PREFIX)) storage.removeItem(key);
}

/** Chiede al service worker di tenere solo le pagine di base; senza service worker si svuotano le cache */
async function clearOfflinePages(): Promise<void> {
  const worker = "serviceWorker" in navigator ? (navigator.serviceWorker.controller ?? (await navigator.serviceWorker.getRegistration())?.active ?? null) : null;
  if (worker) {
    await new Promise<void>((resolve, reject) => {
      const channel = new MessageChannel();
      // Senza risposta non si può dire che le pagine siano state cancellate
      const timer = window.setTimeout(() => reject(new Error("Il service worker non risponde")), 4000);
      channel.port1.onmessage = () => {
        window.clearTimeout(timer);
        resolve();
      };
      worker.postMessage({ type: CLEAR_CACHE_MESSAGE }, [channel.port2]);
    });
    return;
  }
  if ("caches" in window) {
    for (const key of await caches.keys()) await caches.delete(key);
  }
}

export async function eraseAllMyData(): Promise<{ failed: ErasePart[] }> {
  const failed: ErasePart[] = [];
  try {
    await deleteHistoryDatabase();
  } catch {
    failed.push("storico");
  }
  try {
    clearPrefixed(localStorage);
  } catch {
    failed.push("preferenze e liste");
  }
  try {
    clearPrefixed(sessionStorage);
  } catch {
    failed.push("dati della scheda");
  }
  try {
    await clearOfflinePages();
  } catch {
    failed.push("pagine offline");
  }
  // Le parti dell'interfaccia aperte rileggono i dati (ormai vuoti)
  resetPrefs();
  window.dispatchEvent(new Event(LIST_EVENT));
  window.dispatchEvent(new Event(HISTORY_EVENT));
  return { failed };
}
