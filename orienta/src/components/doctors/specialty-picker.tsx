"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { SPECIALTIES, getSpecialty, type SpecialtyId } from "@data/vocab/specialties";
import { cn } from "@/lib/cn";
import { SPECIALIST_ILLUSTRATIONS } from "@/lib/illustrations/specialists";

/** Medico di base sempre per primo, poi lo specialista consigliato, il pediatra e gli altri; il pronto soccorso in fondo */
function ordered(recommended: SpecialtyId | null): SpecialtyId[] {
  const first: SpecialtyId[] = ["medico-di-base", ...(recommended ? [recommended] : []), "pediatra"];
  const rest = SPECIALTIES.map((s) => s.id).filter((id) => id !== "pronto-soccorso" && !first.includes(id));
  return [...new Set<SpecialtyId>([...first, ...rest, "pronto-soccorso"])];
}

/**
 * I professionisti in una fila di riquadri illustrati da scorrere. Sono veri pulsanti di scelta:
 * con la tastiera si passa dall'uno all'altro con le frecce. Sotto, cosa fa quello scelto.
 */
export function SpecialtyPicker({
  value,
  onChange,
  recommended,
  reduced,
}: {
  value: SpecialtyId;
  onChange: (id: SpecialtyId) => void;
  recommended: SpecialtyId | null;
  reduced: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const selected = getSpecialty(value);

  // Lo specialista scelto (anche quando arriva da un link) resta visibile nella fila: si scorre solo la fila, mai la pagina
  useEffect(() => {
    const row = scroller.current;
    const tile = row?.querySelector<HTMLElement>(`[data-specialty="${value}"]`);
    if (!row || !tile) return;
    const left = tile.offsetLeft - (row.clientWidth - tile.offsetWidth) / 2;
    row.scrollTo({ left: Math.max(0, left), behavior: reduced ? "auto" : "smooth" });
  }, [value, reduced]);

  return (
    <fieldset className="min-w-0 space-y-3">
      <legend>
        <h2 className="text-heading font-bold">Chi cerchi?</h2>
      </legend>
      <div ref={scroller} className="relative -mx-4 snap-x scroll-px-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]">
        <div className="flex w-max gap-2">
          {ordered(recommended).map((id) => {
            const art = SPECIALIST_ILLUSTRATIONS[id];
            const isRecommended = id === recommended;
            return (
              <label
                key={id}
                data-specialty={id}
                className={cn(
                  "relative flex w-26 shrink-0 cursor-pointer snap-start flex-col items-center gap-1 rounded-3xl border-2 px-1.5 pb-2 pt-2.5 text-center",
                  "transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.96]",
                  "has-checked:border-primary has-checked:bg-primary-soft",
                  "has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus",
                  id === "pronto-soccorso" ? "border-red/40 bg-surface hover:border-red" : "border-line bg-surface hover:border-primary/60",
                )}
              >
                <input type="radio" name="specialista" value={id} checked={value === id} onChange={() => onChange(id)} className="sr-only" />
                {art ? (
                  <Image src={art} alt="" sizes="56px" className={cn("size-14 transition-transform duration-200 ease-out", value === id && "scale-110")} />
                ) : (
                  <span aria-hidden className="size-14 rounded-full bg-surface-2" />
                )}
                <span className="text-[0.8125rem] font-bold leading-tight">{getSpecialty(id).label}</span>
                {isRecommended && (
                  <span className="mt-auto rounded-full bg-accent px-2 py-0.5 text-[0.75rem] font-bold text-on-accent">
                    <span className="sr-only">: </span>Consigliato
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>
      <p aria-live="polite" className="rounded-2xl bg-surface-2 px-4 py-3 text-small">
        <span className="font-bold">{selected.label}.</span> {selected.description}
      </p>
    </fieldset>
  );
}
