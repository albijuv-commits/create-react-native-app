"use client";

import { Check, RotateCw, ScanFace, X, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useState, type ComponentType } from "react";
import { BODY_ZONES, bodyZoneLabel, type BodyView, type BodyZoneId } from "@data/vocab/body";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import type { BodyMap3DProps } from "./body-map-3d";
import { BodyMap2D } from "./body-map-2d";

const FACE: BodyZoneId[] = ["occhi", "orecchie", "naso", "bocca"];
const MAP_ZONES = BODY_ZONES.filter((z) => z.views.length > 0);

/**
 * La mappa del corpo dell'intervista: 3D se il dispositivo lo permette (si carica solo qui),
 * altrimenti 2D. Per chi usa la tastiera o un lettore di schermo c'è sempre l'elenco delle zone.
 */
export function BodyMap({ selected, onToggle }: { selected: readonly BodyZoneId[]; onToggle: (zone: BodyZoneId) => void }) {
  const reduced = usePrefersReducedMotion();
  const [Map3D, setMap3D] = useState<ComponentType<BodyMap3DProps> | null>(null);
  const [mode, setMode] = useState<"3d" | "2d">("3d");
  const [view, setView] = useState<BodyView>("fronte");
  const [turn, setTurn] = useState(0);
  const [zoomHead, setZoomHead] = useState(false);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    let alive = true;
    import("./body-map-3d")
      .then((m) => alive && setMap3D(() => m.default))
      .catch(() => alive && setMode("2d"));
    return () => {
      alive = false;
    };
  }, []);

  const toggle = useCallback(
    (zone: BodyZoneId) => {
      setAnnounce(`${bodyZoneLabel(zone)}: ${selected.includes(zone) ? "tolta" : "aggiunta"}`);
      onToggle(zone);
    },
    [onToggle, selected],
  );
  const unsupported = useCallback(() => setMode("2d"), []);
  const flip = () => {
    if (mode === "3d" && Map3D) setTurn((t) => t + 1);
    else setView((v) => (v === "fronte" ? "retro" : "fronte"));
  };

  const headActive = selected.some((z) => z === "testa" || FACE.includes(z));
  const show3D = mode === "3d" && Map3D;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-small text-ink-muted">
          {show3D ? "Trascina per ruotare il corpo e tocca dove senti fastidio." : "Tocca dove senti fastidio; trascina di lato o usa «Gira» per vedere dietro."}
        </p>
        <div className="flex shrink-0 rounded-full bg-surface-2 p-1" role="group" aria-label="Tipo di mappa">
          {(["3d", "2d"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "min-h-11 min-w-11 rounded-full px-3 text-small font-bold transition-colors duration-150",
                mode === m ? "bg-primary text-on-primary" : "text-ink-muted hover:text-ink",
              )}
            >
              {m === "3d" ? "3D" : "Semplice"}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[24rem] overflow-hidden rounded-3xl bg-surface-2">
        {show3D ? (
          <Map3D selected={selected} onToggle={toggle} turn={turn} zoomHead={zoomHead} reduced={reduced} onViewChange={setView} onUnsupported={unsupported} />
        ) : (
          <div className="mx-auto h-full w-[60%] pb-16 pt-4">
            <BodyMap2D selected={selected} onToggle={toggle} view={view} onSwipe={flip} reduced={reduced} />
          </div>
        )}

        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-surface px-3 py-1 text-small font-bold text-ink shadow-sm">
          {view === "fronte" ? "Davanti" : "Dietro"}
        </span>
        <div className="absolute inset-x-3 bottom-3 flex justify-between gap-2">
          <button
            type="button"
            onClick={flip}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-4 py-2 text-small font-bold text-primary shadow-sm transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            <RotateCw aria-hidden className="size-4" />
            Gira
          </button>
          {show3D && (
            <button
              type="button"
              onClick={() => setZoomHead((z) => !z)}
              aria-pressed={zoomHead}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-4 py-2 text-small font-bold text-primary shadow-sm transition-transform duration-150 ease-out active:scale-[0.97]"
            >
              {zoomHead ? <ZoomOut aria-hidden className="size-4" /> : <ZoomIn aria-hidden className="size-4" />}
              {zoomHead ? "Corpo intero" : "Avvicina la testa"}
            </button>
          )}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>

      {headActive && (
        <div className="space-y-2 rounded-2xl border border-line p-3">
          <p className="flex items-center gap-2 text-small font-bold">
            <ScanFace aria-hidden className="size-5 text-primary" />
            Vuoi indicare una parte precisa del viso?
          </p>
          <div className="flex flex-wrap gap-2">
            {FACE.map((z) => (
              <ZoneToggle key={z} zone={z} active={selected.includes(z)} onToggle={toggle} />
            ))}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Zone scelte">
          {selected.map((z) => (
            <li key={z}>
              <button
                type="button"
                onClick={() => toggle(z)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-accent-soft py-2 pl-4 pr-3 text-small font-bold text-accent transition-transform duration-150 ease-out active:scale-[0.97]"
              >
                {bodyZoneLabel(z)}
                <X aria-hidden className="size-4" />
                <span className="sr-only">: togli</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <details className="group rounded-2xl border border-line">
        <summary className="flex min-h-11 cursor-pointer items-center px-4 py-2 font-bold text-primary">Scegli dall&apos;elenco delle zone</summary>
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {MAP_ZONES.map((z) => (
            <ZoneToggle key={z.id} zone={z.id} active={selected.includes(z.id)} onToggle={toggle} />
          ))}
        </div>
      </details>
    </div>
  );
}

function ZoneToggle({ zone, active, onToggle }: { zone: BodyZoneId; active: boolean; onToggle: (z: BodyZoneId) => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onToggle(zone)}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 px-4 py-2 text-small font-bold transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97]",
        active ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink hover:border-primary",
      )}
    >
      {active && <Check aria-hidden className="size-4" />}
      {bodyZoneLabel(zone)}
    </button>
  );
}
