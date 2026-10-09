import { screen, userEvent } from "@testing-library/react-native";
import { Linking } from "react-native";
import EmergenzaScreen from "~/app/emergenza";
import { renderWithTheme } from "./render";

describe("schermata Emergenza", () => {
  beforeEach(() => {
    jest.spyOn(Linking, "openURL").mockResolvedValue(true);
  });
  afterEach(() => jest.restoreAllMocks());

  it("il 112 è il primo pulsante e apre il telefono con il numero composto", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<EmergenzaScreen />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAccessibleName("Chiama il 112");
    await user.press(screen.getByRole("button", { name: "Chiama il 112" }));
    expect(Linking.openURL).toHaveBeenCalledWith("tel:112");
  });

  it("un segnale d'allarme si apre e mostra cosa fare", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<EmergenzaScreen />);
    const flag = screen.getByRole("button", { name: /Difficoltà a respirare/ });
    expect(flag).toBeCollapsed();
    expect(screen.queryByText(/Fatica a respirare anche a riposo/)).not.toBeOnTheScreen();
    await user.press(flag);
    expect(screen.getByRole("button", { name: /Difficoltà a respirare/ })).toBeExpanded();
    expect(screen.getByText(/Fatica a respirare anche a riposo/)).toBeOnTheScreen();
  });

  it("i numeri di aiuto si chiamano con un tocco", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<EmergenzaScreen />);
    await user.press(screen.getByRole("button", { name: "Chiama 02 2327 2327" }));
    expect(Linking.openURL).toHaveBeenCalledWith("tel:+390223272327");
    expect(screen.getByRole("button", { name: "Chiama 19696" })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Chiama 116117" })).toBeOnTheScreen();
  });
});
