"use client";

import { ArrowLeftRight, Heart } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDeviceList } from "@/lib/medicines/device-lists";

const base =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border-2 px-3 text-small font-bold transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50";

/** Preferito sì/no, salvato solo sul dispositivo */
export function FavoriteButton({ aic, name, compact = false }: { aic: string; name: string; compact?: boolean }) {
  const favorites = useDeviceList("preferiti");
  const on = favorites.has(aic);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={compact ? `${on ? "Togli dai preferiti" : "Aggiungi ai preferiti"}: ${name}` : undefined}
      onClick={() => favorites.toggle(aic)}
      disabled={!on && favorites.full}
      className={cn(base, on ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink-muted hover:border-accent/60")}
    >
      <Heart aria-hidden className={cn("size-5", on && "fill-current")} />
      {!compact && (on ? "Nei preferiti" : "Preferito")}
    </button>
  );
}

/** Nel confronto sì/no: al massimo tre farmaci */
export function CompareButton({ aic, name, compact = false }: { aic: string; name: string; compact?: boolean }) {
  const compare = useDeviceList("confronto");
  const on = compare.has(aic);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={compact ? `${on ? "Togli dal confronto" : "Aggiungi al confronto"}: ${name}` : undefined}
      onClick={() => compare.toggle(aic)}
      disabled={!on && compare.full}
      title={!on && compare.full ? "Puoi confrontare al massimo 3 farmaci" : undefined}
      className={cn(base, on ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-ink-muted hover:border-primary/60")}
    >
      <ArrowLeftRight aria-hidden className="size-5" />
      {!compact && (on ? "Nel confronto" : "Confronta")}
    </button>
  );
}
