"use client";

import { useRef } from "react";
import type { BodyView, BodyZoneId } from "@data/vocab/body";
import { C } from "@/components/slide/palette";
import { cn } from "@/lib/cn";
import { BODY_SHAPES, BodyFigure, ZoneShape } from "./body-figure";

/**
 * Mappa del corpo in 2D: fronte e retro come le due facce di una carta che si gira.
 * Si tocca una zona per sceglierla; trascinando di lato la carta si gira.
 */
export function BodyMap2D({
  selected,
  onToggle,
  view,
  onSwipe,
  reduced,
}: {
  selected: readonly BodyZoneId[];
  onToggle: (zone: BodyZoneId) => void;
  view: BodyView;
  /** Trascinamento orizzontale abbastanza lungo: gira la carta */
  onSwipe: () => void;
  reduced: boolean;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const face = (v: BodyView) => (
    <svg viewBox="-4 -2 108 204" className="h-full w-full" aria-hidden>
      <BodyFigure view={v} />
      {BODY_SHAPES[v].map((s, i) =>
        s.zone ? (
          <ZoneShape
            key={i}
            shape={s.shape}
            onClick={() => s.zone && onToggle(s.zone)}
            className="cursor-pointer transition-[fill,fill-opacity] duration-150"
            fill={selected.includes(s.zone) ? C.tissueInflamed : C.calm}
            fillOpacity={selected.includes(s.zone) ? 0.95 : 0.001}
            stroke={selected.includes(s.zone) ? C.highlight : "transparent"}
            strokeWidth="1"
          />
        ) : null,
      )}
    </svg>
  );

  return (
    <div
      className="h-full w-full [perspective:1200px]"
      onPointerDown={(e) => (start.current = { x: e.clientX, y: e.clientY })}
      onPointerUp={(e) => {
        const s = start.current;
        start.current = null;
        if (s && Math.abs(e.clientX - s.x) > 60 && Math.abs(e.clientX - s.x) > Math.abs(e.clientY - s.y) * 1.5) onSwipe();
      }}
    >
      <div
        className={cn("relative h-full w-full [transform-style:preserve-3d]", !reduced && "transition-transform duration-500 ease-out")}
        style={{ transform: view === "retro" ? "rotateY(180deg)" : "none" }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">{face("fronte")}</div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">{face("retro")}</div>
      </div>
    </div>
  );
}
