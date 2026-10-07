"use client";

import { createContext, useContext } from "react";
import type { Transition } from "motion/react";

export interface SceneState {
  /** Passo corrente (0-3) */
  step: number;
  /** true quando la persona preferisce meno movimento: niente transizioni né movimenti continui */
  reduced: boolean;
  /** Transizione tra un passo e l'altro (durata 0 con movimento ridotto) */
  t: Transition;
  /** Transizione lenta, per cambi di colore e gonfiori */
  slow: Transition;
}

export const SceneContext = createContext<SceneState>({
  step: 0,
  reduced: false,
  t: { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
  slow: { duration: 1.6, ease: [0.4, 0, 0.2, 1] },
});

export function useScene(): SceneState {
  return useContext(SceneContext);
}

export function sceneState(step: number, reduced: boolean): SceneState {
  return {
    step,
    reduced,
    t: reduced ? { duration: 0 } : { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
    slow: reduced ? { duration: 0 } : { duration: 1.6, ease: [0.4, 0, 0.2, 1] },
  };
}

/** Utilità: valore a seconda del passo (dal passo `from` in poi) */
export function from<T>(step: number, from: number, yes: T, no: T): T {
  return step >= from ? yes : no;
}
