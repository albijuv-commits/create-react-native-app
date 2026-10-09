import { Stack } from "expo-router";
import { Brand } from "~/components/brand";
import { EmergencyButton } from "~/components/emergency/emergency-button";
import { useTheme } from "~/theme/theme";

// Una scheda aperta da un link ha comunque l'elenco sotto: c'è sempre il pulsante Indietro
export const unstable_settings = { initialRouteName: "index" };

/** Elenco e scheda delle condizioni nella stessa sezione: la barra delle sezioni resta visibile */
export default function CondizioniLayout() {
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
      <Stack.Screen name="index" options={{ title: "Condizioni", headerTitle: () => <Brand />, headerTitleAlign: "left" }} />
      <Stack.Screen name="[id]" options={{ title: "Condizione", headerBackTitle: "Condizioni" }} />
    </Stack>
  );
}
