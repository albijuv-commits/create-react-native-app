import { Stack } from "expo-router";
import { Brand } from "~/components/brand";
import { EmergencyButton } from "~/components/emergency/emergency-button";
import { useTheme } from "~/theme/theme";

// Una scheda aperta da un link ha comunque il catalogo sotto: c'è sempre il pulsante Indietro
export const unstable_settings = { initialRouteName: "index" };

/** Catalogo, scheda della confezione e confronto nella stessa sezione: la barra delle sezioni resta visibile */
export default function MercatoLayout() {
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
      <Stack.Screen name="index" options={{ title: "Mercato", headerTitle: () => <Brand />, headerTitleAlign: "left" }} />
      <Stack.Screen name="[aic]" options={{ title: "Scheda" }} />
      <Stack.Screen name="confronto" options={{ title: "Confronto" }} />
    </Stack>
  );
}
