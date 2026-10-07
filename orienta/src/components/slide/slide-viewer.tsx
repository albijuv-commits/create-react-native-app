"use client";

import { ChevronLeft, ChevronRight, Hand, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { SCENE_STEPS, SCENE_TITLES, type SceneSpec } from "@/lib/slides/catalog";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { SlideSvg } from "./slide-svg";

/** Lente d'ingrandimento: diametro in pixel e ingrandimento */
const LENS = 120;
const ZOOM = 2.4;
/** Tenere premuto così a lungo (senza muoversi) apre la lente */
const HOLD_MS = 280;
const SWIPE_PX = 50;

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

  // Gesti sul vetrino: scorrere di lato cambia passo, tenere premuto apre la lente
  const press = useRef<{ id: number; x: number; y: number; timer: number; touch: boolean } | null>(null);
  const [lens, setLens] = useState<{ x: number; y: number; touch: boolean; width: number } | null>(null);
  const local = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (press.current || (e.target instanceof Element && e.target.closest("button"))) return;
    const p = local(e);
    const touch = e.pointerType !== "mouse";
    const width = e.currentTarget.clientWidth;
    const timer = window.setTimeout(() => setLens({ ...p, touch, width }), HOLD_MS);
    press.current = { id: e.pointerId, x: p.x, y: p.y, timer, touch };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const start = press.current;
    if (!start || e.pointerId !== start.id) return;
    const p = local(e);
    if (lens) setLens({ ...lens, ...p });
    else if (Math.hypot(p.x - start.x, p.y - start.y) > 8) window.clearTimeout(start.timer);
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const start = press.current;
    if (!start || e.pointerId !== start.id) return;
    window.clearTimeout(start.timer);
    press.current = null;
    if (lens) {
      setLens(null);
      return;
    }
    const p = local(e);
    const dx = p.x - start.x;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(p.y - start.y) * 1.5) go(step + (dx < 0 ? 1 : -1));
  };
  const onCancel = () => {
    if (press.current) window.clearTimeout(press.current.timer);
    press.current = null;
    setLens(null);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") go(step + 1);
    else if (e.key === "ArrowLeft") go(step - 1);
    else return;
    e.preventDefault();
  };

  return (
    <figure className="space-y-3">
      <div
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={`${title}. Usa le frecce per cambiare passo.`}
        className="relative mx-auto w-full max-w-[19rem] touch-pan-y rounded-full outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-4 focus-visible:ring-focus/60"
      >
        <SlideSvg spec={spec} step={step} playing={playing} reduced={reduced} label={`${title}. Passo ${step + 1} di ${SCENE_STEPS}.`} />
        {lens && (
          <Lens x={lens.x} y={lens.y} touch={lens.touch} width={lens.width}>
            <SlideSvg spec={spec} step={step} playing={playing} reduced={reduced} />
          </Lens>
        )}
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

      <p className="flex items-center justify-center gap-1.5 text-center text-small text-ink-muted">
        <Hand aria-hidden className="size-4 shrink-0" />
        Scorri per cambiare passo · tieni premuto per la lente
      </p>

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
              <span className={cn("block rounded-full transition-colors duration-150", i === step ? "h-2.5 w-6 bg-accent" : "size-2.5 bg-line")} />
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
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl px-2 py-1 text-[0.8125rem] font-bold transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] disabled:opacity-35 disabled:active:scale-100",
        primary ? "bg-primary text-on-primary" : "bg-surface-2 text-primary",
      )}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

/**
 * La lente: un cerchio che ingrandisce il vetrino sotto il dito. Con il tocco sta un po' più in alto,
 * così il dito non la copre.
 */
function Lens({ x, y, touch, width, children }: { x: number; y: number; touch: boolean; width: number; children: ReactNode }) {
  const cx = x;
  const cy = touch ? y - LENS * 0.7 : y;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-10 overflow-hidden rounded-full border-4 border-surface bg-surface shadow-[0_12px_30px_-8px_rgb(26_27_46/0.45)] ring-2 ring-primary/40"
      style={{ width: LENS, height: LENS, left: cx - LENS / 2, top: cy - LENS / 2 }}
    >
      <div className="absolute" style={{ width: width * ZOOM, left: LENS / 2 - x * ZOOM, top: LENS / 2 - y * ZOOM }}>
        {children}
      </div>
    </div>
  );
}
