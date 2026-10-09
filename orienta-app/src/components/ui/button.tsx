import type { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "~/theme/theme";
import { Txt } from "./text";

type Variant = "primary" | "secondary" | "ghost" | "danger";

/**
 * Pulsante con area di tocco ampia (almeno 52 pt), verbo d'azione nell'etichetta e una piccola
 * pressione al tocco. Il colore non è mai l'unica informazione: c'è sempre il testo.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  icon: Icon,
  disabled = false,
  hint,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: "md" | "lg";
  icon?: LucideIcon;
  disabled?: boolean;
  /** Cosa succede toccando, per VoiceOver e TalkBack (per esempio «Apre il telefono») */
  hint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const tone = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    secondary: { bg: colors.surface, fg: colors.primary, border: colors.primary },
    ghost: { bg: "transparent", fg: colors.primary, border: "transparent" },
    danger: { bg: colors.red, fg: colors.onRed, border: colors.red },
  }[variant];
  const large = size === "lg";
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: large ? 72 : 52,
          backgroundColor: tone.bg,
          borderColor: tone.border,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
        },
        variant === "ghost" && styles.ghost,
        style,
      ]}
    >
      {Icon && <Icon color={tone.fg} size={large ? 30 : 22} strokeWidth={2.2} />}
      <Txt variant={large ? "title" : "body"} bold style={{ color: tone.fg, textAlign: "center", flexShrink: 1 }}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 2,
  },
  ghost: { paddingHorizontal: 8, justifyContent: "flex-start" },
});
