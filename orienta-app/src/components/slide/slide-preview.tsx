import { useEffect, useState } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { PREVIEW_STEP, type SceneSpec } from "@/lib/slides/catalog";
import { useReducedMotion } from "~/lib/use-reduced-motion";
import { SlideSvg } from "./slide-svg";

/** Quanto dura il movimento dell'anteprima dopo che è entrata nello schermo */
const PREVIEW_PLAY_MS = 4000;

/**
 * Anteprima animata per le righe dell'elenco: la scena al passo più rappresentativo. Si muove per
 * qualche secondo quando la riga diventa visibile, poi si ferma. Decorativa per gli screen reader.
 */
export function SlidePreview({ spec, visible, size = 72, style }: { spec: SceneSpec; visible: boolean; size?: number; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!visible || reduced) return;
    const timer = setTimeout(() => setExpired(true), PREVIEW_PLAY_MS);
    return () => {
      clearTimeout(timer);
      setExpired(false);
    };
  }, [visible, reduced]);

  return (
    <View style={[{ width: size, height: size }, style]}>
      <SlideSvg spec={spec} step={PREVIEW_STEP[spec.scene]} playing={visible && !reduced && !expired} reduced={reduced} still />
    </View>
  );
}
