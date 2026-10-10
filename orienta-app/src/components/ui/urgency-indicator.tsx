import { StyleSheet, View } from "react-native";
import { URGENCY, type UrgencyLevel } from "@/lib/design/urgency";
import { LEVEL_UI } from "~/lib/urgency";
import { useTheme } from "~/theme/theme";
import { Txt } from "./text";

/** Livello di urgenza: colore, icona e testo insieme, mai solo colore */
export function UrgencyIndicator({ level, showDescription = true }: { level: UrgencyLevel; showDescription?: boolean }) {
  const { colors } = useTheme();
  const meta = URGENCY[level];
  const ui = LEVEL_UI[level];
  const Icon = ui.icon;
  return (
    <View style={[styles.box, { backgroundColor: colors[ui.soft], borderColor: colors[ui.color] }]}>
      <View style={[styles.disc, { backgroundColor: colors.surface }]}>
        <Icon color={colors[ui.color]} size={24} />
      </View>
      <View style={styles.text}>
        <Txt variant="heading" tone={ui.color}>
          {meta.label}
        </Txt>
        {showDescription && <Txt variant="small">{meta.description}</Txt>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderWidth: 2, borderRadius: 16, padding: 16 },
  disc: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, gap: 4 },
});
