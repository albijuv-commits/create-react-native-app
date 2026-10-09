import { z } from "zod";
import { SYMPTOM_IDS } from "@data/vocab/symptoms";
import { urgencyLevelSchema } from "@/lib/design/urgency";
import { compatibilitySchema, engineSourceSchema } from "@/lib/triage/schema";

/**
 * Lo storico delle sessioni, solo su questo dispositivo (IndexedDB). Una sessione si salva solo
 * quando la persona tocca «Salva nello storico» nei risultati; si può eliminare una alla volta o
 * tutte insieme. Nessuna di queste informazioni lascia il browser.
 */
export const HISTORY_DB = "orienta";
const STORE = "sessioni";
const DB_VERSION = 1;
/** Oltre questo numero si tengono le sessioni più recenti */
export const MAX_SESSIONS = 50;
/** Avvisa i componenti aperti che lo storico è cambiato */
export const HISTORY_EVENT = "orienta:storico";

export const historyEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{8,64}$/),
  createdAt: z.iso.datetime(),
  source: engineSourceSchema,
  urgency: urgencyLevelSchema,
  unidentified: z.boolean(),
  conditions: z
    .array(z.object({ id: z.string().min(1).max(80), name: z.string().min(1).max(120), compatibility: compatibilitySchema }))
    .max(5),
  symptoms: z.array(z.enum(SYMPTOM_IDS)).max(40),
  age: z.number().int().min(0).max(120),
  /** Il riepilogo per il medico, in testo semplice */
  summary: z.string().min(1).max(20_000),
});
export type HistoryEntry = z.infer<typeof historyEntrySchema>;

export class HistoryUnavailableError extends Error {}

function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(HISTORY_EVENT));
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(HISTORY_DB, DB_VERSION);
    } catch {
      reject(new HistoryUnavailableError("IndexedDB non disponibile"));
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => {
      const db = request.result;
      // Se qualcuno chiede di eliminare il database, questa connessione non deve bloccarlo
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(new HistoryUnavailableError(request.error?.message ?? "IndexedDB non disponibile"));
    request.onblocked = () => reject(new HistoryUnavailableError("IndexedDB bloccato da un'altra scheda"));
  });
}

/** Una transazione sul solo archivio delle sessioni; la connessione si chiude alla fine */
async function withStore<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T> | null): Promise<T | undefined> {
  const db = await openDb();
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = work(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request ? request.result : undefined);
      tx.onerror = () => reject(tx.error ?? new Error("Transazione non riuscita"));
      tx.onabort = () => reject(tx.error ?? new Error("Transazione annullata"));
    });
  } finally {
    db.close();
  }
}

/** Le sessioni salvate, dalla più recente; le voci non valide si ignorano */
export async function listSessions(): Promise<HistoryEntry[]> {
  const rows = (await withStore<unknown[]>("readonly", (s) => s.getAll())) ?? [];
  return rows
    .flatMap((r) => {
      const parsed = historyEntrySchema.safeParse(r);
      return parsed.success ? [parsed.data] : [];
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveSession(entry: HistoryEntry): Promise<void> {
  const valid = historyEntrySchema.parse(entry);
  await withStore("readwrite", (s) => s.put(valid));
  const all = await listSessions();
  const extra = all.slice(MAX_SESSIONS);
  if (extra.length) {
    await withStore("readwrite", (s) => {
      for (const e of extra) s.delete(e.id);
      return null;
    });
  }
  notify();
}

export async function deleteSession(id: string): Promise<void> {
  await withStore("readwrite", (s) => s.delete(id));
  notify();
}

export async function clearSessions(): Promise<void> {
  await withStore("readwrite", (s) => s.clear());
  notify();
}

/** Elimina l'intero database dello storico (usato da «Elimina tutti i miei dati») */
export function deleteHistoryDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.deleteDatabase(HISTORY_DB);
    } catch {
      resolve();
      return;
    }
    request.onsuccess = () => {
      notify();
      resolve();
    };
    request.onerror = () => reject(request.error ?? new Error("Eliminazione non riuscita"));
    // Un'altra scheda tiene aperto lo storico: l'eliminazione avverrà appena si chiude
    request.onblocked = () => resolve();
  });
}

export function newSessionId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
