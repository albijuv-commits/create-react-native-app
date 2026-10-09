"use client";

import { useCallback, useSyncExternalStore } from "react";
import { MAX_COMPARE } from "./types";

/**
 * Preferiti e confronto restano solo su questo dispositivo (localStorage), come chiede la sezione
 * privacy: nessun account, niente sul server. Le chiavi iniziano con «orienta:» così «Elimina tutti
 * i miei dati» le trova tutte.
 */
const LISTS = {
  preferiti: { key: "orienta:farmaci-preferiti", max: 50 },
  confronto: { key: "orienta:farmaci-confronto", max: MAX_COMPARE },
} as const;
export type DeviceListKind = keyof typeof LISTS;

const EVENT = "orienta:liste-farmaci";
const EMPTY: readonly string[] = [];
const cache = new Map<string, { raw: string | null; list: readonly string[] }>();

function read(kind: DeviceListKind): readonly string[] {
  const { key, max } = LISTS[kind];
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return EMPTY;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.list;
  let list: readonly string[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) list = parsed.filter((v): v is string => typeof v === "string" && /^\d{9}$/.test(v)).slice(0, max);
  } catch {
    list = EMPTY;
  }
  cache.set(key, { raw, list });
  return list;
}

function write(kind: DeviceListKind, list: readonly string[]) {
  try {
    localStorage.setItem(LISTS[kind].key, JSON.stringify(list));
  } catch {
    // Archiviazione non disponibile: la lista vale solo finché la pagina resta aperta
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useDeviceList(kind: DeviceListKind) {
  const list = useSyncExternalStore(
    subscribe,
    () => read(kind),
    () => EMPTY,
  );
  const max = LISTS[kind].max;
  const toggle = useCallback(
    (aic: string) => {
      const current = read(kind);
      if (current.includes(aic)) write(kind, current.filter((a) => a !== aic));
      else if (current.length < max) write(kind, [...current, aic]);
    },
    [kind, max],
  );
  const remove = useCallback((aic: string) => write(kind, read(kind).filter((a) => a !== aic)), [kind]);
  const clear = useCallback(() => write(kind, []), [kind]);
  return { list, max, full: list.length >= max, has: (aic: string) => list.includes(aic), toggle, remove, clear };
}
