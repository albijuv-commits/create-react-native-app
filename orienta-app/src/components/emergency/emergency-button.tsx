import { useRouter } from "expo-router";
import { Siren } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";

/** Il pulsante Emergenza, sempre visibile in alto su ogni scheda */
export function EmergencyButton() {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <Pressable
      role="button"
      accessibilityLabel="Emergenza"
      accessibilityHint="Apre il 112 e i numeri di aiuto"
      onPress={() => router.push("/emergenza")}
      style={({ pressed }) => [styles.emergency, { backgroundColor: colors.red, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
    >
      <Siren color={colors.onRed} size={20} strokeWidth={2.2} />
      <Txt bold style={{ color: colors.onRed }}>
        Emergenza
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  emergency: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingHorizontal: 16, borderRadius: 999 },
});
