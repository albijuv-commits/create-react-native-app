import { StyleSheet, View } from "react-native";
import { useTheme } from "~/theme/theme";
import { Txt } from "./text";

/** Etichetta piccola su fondo tenue (aree del corpo, tipo di caso clinico) */
export function Badge({ label, tone = "primary" }: { label: string; tone?: "primary" | "accent" }) {
  const { colors } = useTheme();
  const bg = tone === "primary" ? colors.primarySoft : colors.accentSoft;
  const fg = tone === "primary" ? colors.primary : colors.accent;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Txt variant="small" bold style={{ color: fg }}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
});
