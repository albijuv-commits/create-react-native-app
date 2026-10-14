import { useEffect, type Ref } from "react";
import { StyleSheet, View, type Text } from "react-native";
import Animated, { cancelAnimation, Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, FeGaussianBlur, Filter, G, RadialGradient, Stop } from "react-native-svg";
import { C } from "@/components/slide/palette";
import { Txt } from "~/components/ui/text";

const CELLS = [
  { x: 72, y: 78, r: 17, n: 7 },
  { x: 118, y: 66, r: 14, n: 6 },
  { x: 128, y: 112, r: 19, n: 7.5 },
  { x: 84, y: 124, r: 15, n: 6 },
  { x: 104, y: 94, r: 11, n: 4.5 },
] as const;
const SIZE = 208;
/** Come nella web app: sfocato → a fuoco (42%) → a fuoco (72%) → sfocato, in 2,6 secondi */
const FOCUS_MS = 2600;
const SPIN_MS = 6000;

/** Il vetrino: fondo chiaro e cellule, sfocate o a fuoco */
function Slide({ id, blurred }: { id: string; blurred: boolean }) {
  return (
    <Svg viewBox="0 0 200 200" width="100%" height="100%">
      <Defs>
        <RadialGradient id={`${id}-luce`} cx="0.45" cy="0.4" r="0.7">
          <Stop offset="0" stopColor="#fffcfe" />
          <Stop offset="0.75" stopColor="#f8eef5" />
          <Stop offset="1" stopColor="#eadcea" />
        </RadialGradient>
        {blurred && (
          <Filter id={`${id}-fuoco`} x="-20%" y="-20%" width="140%" height="140%">
            <FeGaussianBlur stdDeviation={5} />
          </Filter>
        )}
      </Defs>
      {blurred && <Circle cx={100} cy={100} r={98} fill="#2a2340" />}
      <Circle cx={100} cy={100} r={86} fill={`url(#${id}-luce)`} />
      <G filter={blurred ? `url(#${id}-fuoco)` : undefined}>
        {CELLS.map((c) => (
          <G key={`${c.x}-${c.y}`}>
            <Circle cx={c.x} cy={c.y} r={c.r} fill={C.cytoplasm} stroke={C.membrane} strokeWidth={1.6} />
            <Circle cx={c.x + 2} cy={c.y - 1} r={c.n} fill={C.nucleus} />
          </G>
        ))}
      </G>
    </Svg>
  );
}

/**
 * Attesa mentre si preparano domande o risultati: il vetrino mette a fuoco le cellule e la ghiera
 * gira. Compare solo dopo un'azione della persona; con «Riduci movimento» resta un'immagine ferma e
 * nitida. La messa a fuoco passa dall'immagine sfocata a quella nitida con l'opacità, sul thread
 * dell'interfaccia, senza ridisegnare il filtro a ogni fotogramma.
 */
export function Thinking({ title, detail, reduced, headingRef }: { title: string; detail?: string; reduced: boolean; headingRef?: Ref<Text> }) {
  const phase = useSharedValue(0.5);
  const spin = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      phase.value = 0.5;
      spin.value = 0;
      return;
    }
    phase.value = 0;
    phase.value = withRepeat(withTiming(1, { duration: FOCUS_MS, easing: Easing.linear }), -1, false);
    spin.value = 0;
    spin.value = withRepeat(withTiming(360, { duration: SPIN_MS, easing: Easing.linear }), -1, false);
    return () => {
      cancelAnimation(phase);
      cancelAnimation(spin);
    };
  }, [reduced, phase, spin]);

  const sharp = useAnimatedStyle(() => ({ opacity: interpolate(phase.value, [0, 0.42, 0.72, 1], [0, 1, 1, 0]) }));
  const ring = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <View aria-hidden style={styles.art}>
        <Slide id="sfocato" blurred />
        <Animated.View style={[styles.layer, sharp]}>
          <Slide id="nitido" blurred={false} />
        </Animated.View>
        {/* La ghiera della messa a fuoco gira mentre si aspetta */}
        <Animated.View style={[styles.layer, ring]}>
          <Svg viewBox="0 0 200 200" width="100%" height="100%">
            <Circle cx={100} cy={100} r={93} fill="none" stroke="#7a6fa3" strokeWidth={3} strokeDasharray="2 7" />
          </Svg>
        </Animated.View>
      </View>
      <View style={styles.text}>
        <Txt ref={headingRef} variant="heading" tone="primary" header style={styles.center}>
          {title}
        </Txt>
        {detail ? (
          <Txt variant="small" tone="inkMuted" style={styles.center}>
            {detail}
          </Txt>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 20, paddingVertical: 56 },
  art: { width: SIZE, height: SIZE },
  layer: { position: "absolute", left: 0, top: 0, width: SIZE, height: SIZE },
  text: { gap: 4, alignItems: "center" },
  center: { textAlign: "center" },
});
