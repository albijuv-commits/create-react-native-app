"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SPECIALTIES, type SpecialtyId } from "@data/vocab/specialties";
import { cn } from "@/lib/cn";
import { SPECIALIST_ILLUSTRATIONS } from "@/lib/illustrations/specialists";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * I professionisti di riferimento in riquadri illustrati: si tocca un riquadro per leggere di cosa
 * si occupa. Il pronto soccorso è a parte, con il numero d'emergenza.
 */
export function SpecialistGrid() {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState<SpecialtyId | null>(null);
  const list = SPECIALTIES.filter((s) => s.id !== "pronto-soccorso");
  const shown = list.find((s) => s.id === open);

  return (
    <section aria-labelledby="specialisti-titolo" className="space-y-3">
      <div className="space-y-1">
        <h2 id="specialisti-titolo" className="text-heading font-bold">
          A chi rivolgersi
        </h2>
        <p className="text-small text-ink-muted">Tocca un professionista per sapere di cosa si occupa.</p>
      </div>
      <AnimatePresence initial={false} mode="wait">
        {shown && (
          <motion.div
            key={shown.id}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            aria-live="polite"
            className="flex items-center gap-3 rounded-3xl bg-primary-soft p-4"
          >
            {SPECIALIST_ILLUSTRATIONS[shown.id] && <Image src={SPECIALIST_ILLUSTRATIONS[shown.id]!} alt="" sizes="72px" className="size-18 shrink-0" />}
            <div className="min-w-0 space-y-1">
              <p className="font-bold text-primary">{shown.label}</p>
              <p className="text-small">{shown.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ul className="grid grid-cols-3 gap-2">
        {list.map((s) => {
          const art = SPECIALIST_ILLUSTRATIONS[s.id];
          const active = open === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => setOpen(active ? null : s.id)}
                className={cn(
                  "flex h-full w-full flex-col items-center gap-1 rounded-3xl border-2 p-2 text-center",
                  "transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.96]",
                  active ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-primary/60",
                )}
              >
                {art ? (
                  <Image src={art} alt="" sizes="64px" className={cn("size-16 transition-transform duration-200 ease-out", active && "scale-110")} />
                ) : (
                  <span aria-hidden className="size-16 rounded-full bg-surface-2" />
                )}
                <span className="text-[0.8125rem] font-bold leading-tight">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
