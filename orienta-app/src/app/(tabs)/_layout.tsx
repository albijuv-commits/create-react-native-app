import { Tabs } from "expo-router";
import { HeartPulse, Microscope, Pill, Stethoscope, UserRound, type LucideIcon } from "lucide-react-native";
import type { ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Brand } from "~/components/brand";
import { EmergencyButton } from "~/components/emergency/emergency-button";
import { useTheme } from "~/theme/theme";
import { FONTS } from "~/theme/type";

// I colori delle schede sono sempre stringhe (vedi tabBarActiveTintColor): lucide vuole una stringa
function tabIcon(Icon: LucideIcon) {
  return function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Icon color={typeof color === "string" ? color : undefined} size={26} strokeWidth={focused ? 2.4 : 1.9} />;
  };
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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
        // Barra alta 60 pt più l'area sicura: icona ed etichetta in Atkinson ci stanno senza essere tagliate
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line, height: 60 + insets.bottom, paddingTop: 4, paddingBottom: insets.bottom + 6 },
        tabBarLabelStyle: { fontFamily: FONTS.bold, fontSize: 12, lineHeight: 16, flexShrink: 0 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      {/* Sintomi e Condizioni hanno una loro pila di schermate, con le intestazioni nei rispettivi _layout */}
      <Tabs.Screen name="(sintomi)" options={{ title: "Sintomi", headerShown: false, tabBarIcon: tabIcon(HeartPulse) }} />
      <Tabs.Screen name="condizioni" options={{ title: "Condizioni", headerShown: false, tabBarIcon: tabIcon(Microscope) }} />
      <Tabs.Screen name="medici" options={{ title: "Medici", tabBarIcon: tabIcon(Stethoscope) }} />
      <Tabs.Screen name="mercato" options={{ title: "Mercato", tabBarIcon: tabIcon(Pill) }} />
      <Tabs.Screen name="profilo" options={{ title: "Profilo", tabBarIcon: tabIcon(UserRound) }} />
    </Tabs>
  );
}
