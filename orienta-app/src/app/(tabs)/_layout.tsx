import { Tabs, useRouter } from "expo-router";
import { HeartPulse, Microscope, Pill, Siren, Stethoscope, UserRound, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, type ColorValue } from "react-native";
import { Brand } from "~/components/brand";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";
import { FONTS } from "~/theme/type";

/** Il pulsante Emergenza, sempre visibile in alto su ogni scheda */
function EmergencyButton() {
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

// I colori delle schede sono sempre stringhe (vedi tabBarActiveTintColor): lucide vuole una stringa
function tabIcon(Icon: LucideIcon) {
  return function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Icon color={typeof color === "string" ? color : undefined} size={26} strokeWidth={focused ? 2.4 : 1.9} />;
  };
}

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerTitle: () => <Brand />,
        headerTitleAlign: "left",
        headerRight: () => <EmergencyButton />,
        headerRightContainerStyle: { paddingRight: 16 },
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
        tabBarLabelStyle: { fontFamily: FONTS.bold, fontSize: 12 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Sintomi", tabBarIcon: tabIcon(HeartPulse) }} />
      <Tabs.Screen name="condizioni" options={{ title: "Condizioni", tabBarIcon: tabIcon(Microscope) }} />
      <Tabs.Screen name="medici" options={{ title: "Medici", tabBarIcon: tabIcon(Stethoscope) }} />
      <Tabs.Screen name="mercato" options={{ title: "Mercato", tabBarIcon: tabIcon(Pill) }} />
      <Tabs.Screen name="profilo" options={{ title: "Profilo", tabBarIcon: tabIcon(UserRound) }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  emergency: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingHorizontal: 16, borderRadius: 999 },
});
