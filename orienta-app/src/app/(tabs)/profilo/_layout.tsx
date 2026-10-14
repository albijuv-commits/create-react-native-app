import { Stack } from "expo-router";
import { Brand } from "~/components/brand";
import { EmergencyButton } from "~/components/emergency/emergency-button";
import { useTheme } from "~/theme/theme";

// Una pagina aperta da un link ha comunque il Profilo sotto: c'è sempre il pulsante Indietro
export const unstable_settings = { initialRouteName: "index" };

/** Profilo, pagine informative e schede delle condizioni aperte dallo storico nella stessa pila */
export default function ProfiloLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerRight: () => <EmergencyButton />,
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Profilo", headerTitle: () => <Brand />, headerTitleAlign: "left" }} />
      <Stack.Screen name="privacy" options={{ title: "Informativa privacy" }} />
      <Stack.Screen name="avvertenze" options={{ title: "Avvertenze mediche" }} />
      <Stack.Screen name="fonti" options={{ title: "Fonti" }} />
      <Stack.Screen name="condizione/[id]" options={{ title: "Condizione" }} />
    </Stack>
  );
}
