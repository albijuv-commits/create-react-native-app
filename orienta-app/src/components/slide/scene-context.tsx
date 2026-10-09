import { createContext, useContext } from "react";

export interface Transition {
  /** Secondi, come in motion */
  duration?: number;
  ease?: readonly [number, number, number, number];
  delay?: number;
}

/** La curva delle transizioni tra i passi nella web app */
export const STANDARD_EASE = [0.4, 0, 0.2, 1] as const;

export interface SceneState {
  /** Passo corrente (0-3) */
  step: number;
  /** true con «riduci movimento»: niente transizioni né movimenti continui */
  reduced: boolean;
  /** I movimenti continui partono solo mentre la scena è in riproduzione */
  playing: boolean;
  /**
   * Scena ferma su un passo (anteprime e galleria): gli elementi di motion si disegnano già al loro
   * valore finale, senza transizioni, così molte scene insieme restano leggere
   */
  still: boolean;
  /** Transizione tra un passo e l'altro (durata 0 con movimento ridotto) */
  t: Transition;
  /** Transizione lenta, per cambi di colore e gonfiori */
  slow: Transition;
}

export function sceneState(step: number, reduced: boolean, playing: boolean, still = false): SceneState {
  return {
    step,
    reduced,
    playing: playing && !reduced,
    still,
    t: reduced ? { duration: 0 } : { duration: 0.9, ease: STANDARD_EASE },
    slow: reduced ? { duration: 0 } : { duration: 1.6, ease: STANDARD_EASE },
  };
}

export const SceneContext = createContext<SceneState>(sceneState(0, false, false));

export function useScene(): SceneState {
  return useContext(SceneContext);
}

/** Utilità: valore a seconda del passo (dal passo `from` in poi) */
export function from<T>(step: number, start: number, yes: T, no: T): T {
  return step >= start ? yes : no;
}
