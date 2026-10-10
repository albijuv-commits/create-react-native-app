import { Stack } from "expo-router";
import { Brand } from "~/components/brand";
import { EmergencyButton } from "~/components/emergency/emergency-button";
import { useTheme } from "~/theme/theme";

// L'intervista aperta da un link ha comunque la pagina Sintomi sotto: c'è sempre il pulsante Indietro
export const unstable_settings = { initialRouteName: "index" };

/**
 * Pagina Sintomi e intervista nella stessa pila: la scheda di una condizione aperta dai risultati
 * si apre sopra l'intervista, e aprendo i Medici si cambia sezione; tornando qui, l'intervista è
 * ancora com'era.
 */
export default function SintomiLayout() {
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
      <Stack.Screen name="index" options={{ title: "Sintomi", headerTitle: () => <Brand />, headerTitleAlign: "left" }} />
      <Stack.Screen name="sintomi/intervista" options={{ title: "Intervista", headerBackTitle: "Sintomi" }} />
      <Stack.Screen name="sintomi/condizione/[id]" options={{ title: "Scheda", headerBackTitle: "Risultati" }} />
    </Stack>
  );
}
