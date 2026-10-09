import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * true quando nelle impostazioni di sistema è attivo «Riduci movimento» (iOS), «Rimuovi animazioni»
 * (Android) o prefers-reduced-motion (web). Si aggiorna se la persona cambia l'impostazione.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduced(value);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduced;
}
