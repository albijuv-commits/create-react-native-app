import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { MAX_COMPARE } from "@/lib/medicines/types";

/**
 * Preferiti e confronto restano solo su questo telefono (AsyncStorage), come nella web app: nessun
 * account, niente sul server. Le chiavi iniziano con «orienta:», così «Elimina tutti i miei dati» le
 * trova tutte.
 */
const LISTS = {
  preferiti: { key: "orienta:farmaci-preferiti", max: 50 },
  confronto: { key: "orienta:farmaci-confronto", max: MAX_COMPARE },
} as const;
export type MedicineListKind = keyof typeof LISTS;

const EMPTY: readonly string[] = [];
const lists: Record<MedicineListKind, readonly string[]> = { preferiti: EMPTY, confronto: EMPTY };
const listeners = new Set<() => void>();
let loading: Promise<void> | null = null;

const emit = () => listeners.forEach((l) => l());

function parse(raw: string | null, max: number): readonly string[] {
  try {
    const value: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && /^\d{9}$/.test(v)).slice(0, max) : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** Le liste salvate si leggono una volta, al primo uso; quello che la persona ha già toccato non si perde */
function load(): Promise<void> {
  loading ??= Promise.all(
    (Object.keys(LISTS) as MedicineListKind[]).map(async (kind) => {
      const { key, max } = LISTS[kind];
      const saved = parse(await AsyncStorage.getItem(key).catch(() => null), max);
      lists[kind] = [...new Set([...saved, ...lists[kind]])].slice(0, max);
    }),
  ).then(emit);
  return loading;
}

function save(kind: MedicineListKind, next: readonly string[]) {
  lists[kind] = next;
  emit();
  AsyncStorage.setItem(LISTS[kind].key, JSON.stringify(next)).catch(() => {
    // Archiviazione non disponibile: la lista vale finché l'app resta aperta
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void load();
  return () => {
    listeners.delete(listener);
  };
}

export function useMedicineList(kind: MedicineListKind) {
  const list = useSyncExternalStore(
    subscribe,
    () => lists[kind],
    () => EMPTY,
  );
  const { max } = LISTS[kind];
  return {
    list,
    max,
    full: list.length >= max,
    has: (aic: string) => list.includes(aic),
    toggle: (aic: string) => {
      const current = lists[kind];
      if (current.includes(aic)) save(kind, current.filter((a) => a !== aic));
      else if (current.length < max) save(kind, [...current, aic]);
    },
    remove: (aic: string) => save(kind, lists[kind].filter((a) => a !== aic)),
    clear: () => save(kind, EMPTY),
  };
}

/** Svuota preferiti e confronto (per «Elimina tutti i miei dati» e per i test) */
export async function clearMedicineLists(): Promise<void> {
  await load();
  for (const kind of Object.keys(LISTS) as MedicineListKind[]) save(kind, EMPTY);
  await AsyncStorage.multiRemove(Object.values(LISTS).map((l) => l.key)).catch(() => {});
}
