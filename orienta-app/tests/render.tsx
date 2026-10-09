import { render } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { ThemeProvider } from "~/theme/theme";

/** Disegna un componente dentro il tema dell'app, come nell'app vera */
export function renderWithTheme(ui: ReactElement) {
  return render(ui, { wrapper: ThemeProvider });
}
