import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useReducedMotion } from "~/lib/use-reduced-motion";
import { useTheme } from "~/theme/theme";

/** Barra di avanzamento: si muove solo quando cambia il valore (risponde a un'azione) */
export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const fraction = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const fill = useSharedValue(fraction);

  useEffect(() => {
    fill.value = reduced ? fraction : withSpring(fraction, { stiffness: 140, damping: 22 });
  }, [fraction, reduced, fill]);

  const style = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  return (
    <View
      accessible
      role="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max, now: value }}
      style={[styles.track, { backgroundColor: colors.surface2 }]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: colors.accent }, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, width: "100%", overflow: "hidden", borderRadius: 999 },
  fill: { height: "100%", borderRadius: 999 },
});
