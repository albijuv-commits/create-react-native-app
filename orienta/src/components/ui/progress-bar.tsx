"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/** Barra di avanzamento: si muove solo quando cambia il valore (risponde a un'azione). */
export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const reduce = usePrefersReducedMotion();
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
    >
      <motion.div
        className="h-full rounded-full bg-accent"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 22 }}
      />
    </div>
  );
}
