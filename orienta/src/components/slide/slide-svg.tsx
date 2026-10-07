"use client";

import { useId, type ReactNode } from "react";
import { sceneScale, type SceneSpec } from "@/lib/slides/catalog";
import { cn } from "@/lib/cn";
import { Eyepiece } from "./eyepiece";
import { SceneContext, sceneState } from "./scene-context";
import { SceneRenderer } from "./registry";

/** SVG del vetrino: oculare + scena al passo indicato. */
export function SlideSvg({
  spec,
  step,
  playing,
  reduced,
  label,
  className,
  children,
}: {
  spec: SceneSpec;
  step: number;
  playing: boolean;
  reduced: boolean;
  /** Etichetta per gli screen reader; se assente l'immagine è decorativa */
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("slide-svg block h-auto w-full select-none", className)}
      data-playing={playing && !reduced ? "true" : "false"}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <SceneContext.Provider value={sceneState(step, reduced)}>
        <Eyepiece id={id} scale={sceneScale(spec, step)}>
          <SceneRenderer spec={spec} />
        </Eyepiece>
      </SceneContext.Provider>
      {children}
    </svg>
  );
}
