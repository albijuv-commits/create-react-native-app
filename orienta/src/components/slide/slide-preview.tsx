"use client";

import { useEffect, useRef, useState } from "react";
import { PREVIEW_STEP, type SceneSpec } from "@/lib/slides/catalog";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { SlideSvg } from "./slide-svg";

/** Quanto dura il movimento dell'anteprima dopo che è entrata nello schermo */
const PREVIEW_PLAY_MS = 4000;

/**
 * Anteprima animata per le card: la scena al passo più rappresentativo. Si muove per qualche
 * secondo quando scorri fino a lei, poi si ferma. Decorativa per gli screen reader.
 */
export function SlidePreview({ spec, className }: { spec: SceneSpec; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !("IntersectionObserver" in window)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timer);
        if (entry?.isIntersecting) {
          setPlaying(true);
          timer = setTimeout(() => setPlaying(false), PREVIEW_PLAY_MS);
        } else {
          setPlaying(false);
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [reduced]);

  return (
    <div ref={ref} className={cn("shrink-0", className)}>
      <SlideSvg spec={spec} step={PREVIEW_STEP[spec.scene]} playing={playing} reduced={reduced} />
    </div>
  );
}
