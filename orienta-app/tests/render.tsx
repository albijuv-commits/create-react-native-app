import { render } from "@testing-library/react-native";
import type { ReactElement, ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "~/theme/theme";

/** Le misure di un telefono qualsiasi: nell'app le dà Expo Router con SafeAreaProvider */
const METRICS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

function Providers({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>
      <ThemeProvider>{children}</ThemeProvider>
    </SafeAreaProvider>
  );
}

/** Disegna un componente dentro il tema dell'app, come nell'app vera */
export function renderWithTheme(ui: ReactElement) {
  return render(ui, { wrapper: Providers });
}
