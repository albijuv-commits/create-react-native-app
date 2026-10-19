import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { historyEntrySchema, MAX_SESSIONS, type HistoryEntry } from "@/lib/storage/history";

/**
 * Lo storico delle sessioni, solo su questo telefono (AsyncStorage), con lo stesso schema Zod della
 * web app. Una sessione si salva solo quando la persona tocca «Salva nello storico» nei risultati;
 * si elimina una alla volta, tutte insieme o con «Elimina tutti i miei dati». La chiave inizia con
 * «orienta:», come tutte quelle dell'app.
 */
export const HISTORY_KEY = "orienta:storico";

export type HistoryState = { status: "loading" } | { status: "unavailable" } | { status: "ready"; sessions: readonly HistoryEntry[] };

let state: HistoryState = { status: "loading" };
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function set(next: HistoryState) {
  state = next;
  listeners.forEach((l) => l());
}

const newestFirst = (a: HistoryEntry, b: HistoryEntry) => b.createdAt.localeCompare(a.createdAt);

/** Le voci salvate passano da Zod: una voce rovinata si ignora, le altre restano */
function parse(raw: string | null): HistoryEntry[] {
  try {
    const value: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(value)) return [];
    return value
      .flatMap((v) => {
        const parsed = historyEntrySchema.safeParse(v);
        return parsed.success ? [parsed.data] : [];
      })
      .sort(newestFirst)
      .slice(0, MAX_SESSIONS);
  } catch {
    return [];
  }
}

/** Lo storico si legge una volta, al primo uso; se il telefono non lo permette si riprova la volta dopo */
function load(): Promise<void> {
  loading ??= AsyncStorage.getItem(HISTORY_KEY).then(
    (raw) => set({ status: "ready", sessions: parse(raw) }),
    () => {
      loading = null;
      set({ status: "unavailable" });
    },
  );
  return loading;
}

async function ready(): Promise<readonly HistoryEntry[]> {
  await load();
  if (state.status !== "ready") throw new Error("Storico non disponibile");
  return state.sessions;
}

/** Lo stato in memoria cambia solo quando il salvataggio sul telefono è riuscito */
async function write(sessions: HistoryEntry[]) {
  if (sessions.length) await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
  else await AsyncStorage.removeItem(HISTORY_KEY);
  set({ status: "ready", sessions });
}

export async function saveSession(entry: HistoryEntry): Promise<void> {
  const valid = historyEntrySchema.parse(entry);
  const current = await ready();
  await write([valid, ...current.filter((s) => s.id !== valid.id)].sort(newestFirst).slice(0, MAX_SESSIONS));
}

export async function deleteSession(id: string): Promise<void> {
  const current = await ready();
  await write(current.filter((s) => s.id !== id));
}

export async function clearSessions(): Promise<void> {
  await ready();
  await write([]);
}

/** Per «Elimina tutti i miei dati»: la chiave sparisce con le altre, qui si svuota ciò che è in memoria */
export function forgetSessions(): void {
  loading = Promise.resolve();
  set({ status: "ready", sessions: [] });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void load();
  return () => {
    listeners.delete(listener);
  };
}

/** Le sessioni salvate su questo telefono, dalla più recente, aggiornate quando lo storico cambia */
export function useHistory(): HistoryState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}
