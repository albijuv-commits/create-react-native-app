import { Info } from "lucide-react-native";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "~/theme/theme";
import { Txt } from "./text";

/** Un riquadro informativo con titolo, come il Callout della web app */
export function Callout({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}>
      <Info color={colors.primary} size={22} style={styles.icon} />
      <View style={styles.text}>
        <Txt bold tone="primary">
          {title}
        </Txt>
        <Txt>{children}</Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: "row", gap: 12, borderRadius: 16, borderLeftWidth: 4, padding: 16 },
  icon: { marginTop: 2, flexShrink: 0 },
  text: { flex: 1, gap: 4 },
});
