"use client";

import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { SCENE_STEPS, SCENE_TITLES, type SceneSpec } from "@/lib/slides/catalog";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { SlideSvg } from "./slide-svg";

/** Tempo per passo: abbastanza per leggere la didascalia (minimo 5 secondi) */
function stepDuration(caption: string) {
  return Math.max(5000, caption.length * 60);
}

/**
 * Il vetrino interattivo della scheda: scena animata con didascalie passo per passo e comandi
 * Indietro, Riproduci/Pausa, Avanti. Non parte da solo: il movimento risponde a un'azione.
 * Con prefers-reduced-motion diventa una sequenza di illustrazioni statiche con le stesse didascalie.
 */
export function SlideViewer({ spec, subject }: { spec: SceneSpec; subject: string }) {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const last = SCENE_STEPS - 1;
  const caption = spec.captions[step];

  useEffect(() => {
    if (!playing || reduced) return;
    const timer = setTimeout(
      () => (step < last ? setStep(step + 1) : setPlaying(false)),
      stepDuration(caption),
    );
    return () => clearTimeout(timer);
  }, [playing, reduced, step, last, caption]);

  const play = () => {
    setStarted(true);
    if (step === last) setStep(0);
    setPlaying(true);
  };
  const go = (s: number) => {
    setStarted(true);
    setStep(Math.min(last, Math.max(0, s)));
  };

  const title = `${SCENE_TITLES[spec.scene]}: ${subject}`;

  return (
    <figure className="space-y-3">
      <div className="relative mx-auto w-full max-w-[19rem]">
        <SlideSvg spec={spec} step={step} playing={playing} reduced={reduced} label={`${title}. Passo ${step + 1} di ${SCENE_STEPS}.`} />
        {!reduced && !started && (
          <button
            type="button"
            onClick={play}
            className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-on-primary shadow-lg ring-4 ring-surface/70 hover:brightness-110"
            aria-label={`Avvia l'animazione: ${title}`}
          >
            <Play aria-hidden className="ml-1 size-8" fill="currentColor" />
          </button>
        )}
      </div>

      <figcaption className="space-y-3">
        {reduced ? (
          <ol className="space-y-2" aria-label="Passi dell'illustrazione">
            {spec.captions.map((c, i) => (
              <li
                key={i}
                aria-current={i === step ? "step" : undefined}
                className={cn("flex gap-2 rounded-xl p-2", i === step ? "bg-primary-soft text-ink" : "text-ink-muted")}
              >
                <span className="font-bold text-primary">{i + 1}.</span>
                <span>{c}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p aria-live="polite" className="min-h-[4.5rem] rounded-xl bg-surface-2 p-3">
            <span className="mr-1 font-bold text-accent">{step + 1}.</span>
            {caption}
          </p>
        )}

        <div className="flex justify-center" role="group" aria-label="Passi">
          {Array.from({ length: SCENE_STEPS }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Vai al passo ${i + 1}`}
              aria-current={i === step ? "step" : undefined}
              className="grid size-11 place-items-center rounded-full"
            >
              <span className={cn("block rounded-full transition-all", i === step ? "h-2.5 w-6 bg-accent" : "size-2.5 bg-line")} />
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <ControlButton label="Indietro" onClick={() => go(step - 1)} disabled={step === 0}>
            <ChevronLeft aria-hidden className="size-5" />
          </ControlButton>

          {!reduced &&
            (playing ? (
              <ControlButton label="Pausa" onClick={() => setPlaying(false)} primary>
                <Pause aria-hidden className="size-5" />
              </ControlButton>
            ) : step === last && started ? (
              <ControlButton label="Riguarda" onClick={play} primary>
                <RotateCcw aria-hidden className="size-5" />
              </ControlButton>
            ) : (
              <ControlButton label="Riproduci" onClick={play} primary>
                <Play aria-hidden className="size-5" />
              </ControlButton>
            ))}

          <ControlButton label="Avanti" onClick={() => go(step + 1)} disabled={step === last}>
            <ChevronRight aria-hidden className="size-5" />
          </ControlButton>
        </div>
      </figcaption>
    </figure>
  );
}

function ControlButton({
  label,
  onClick,
  disabled,
  primary,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl px-2 text-[0.75rem] font-bold disabled:opacity-35",
        primary ? "bg-primary text-on-primary" : "bg-surface-2 text-primary",
      )}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}
