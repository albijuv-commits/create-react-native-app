import AsyncStorage from "@react-native-async-storage/async-storage";
import { screen, userEvent, waitFor } from "@testing-library/react-native";
import ProfiloScreen from "~/app/(tabs)/profilo";
import { renderWithTheme } from "./render";

const saved = async () => JSON.parse((await AsyncStorage.getItem("orienta:prefs")) ?? "{}") as Record<string, unknown>;

describe("Profilo: preferenze", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("tema e dimensione del testo si scelgono e restano sul telefono", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<ProfiloScreen />);
    expect(screen.getByRole("radio", { name: "Automatico" })).toBeChecked();
    await user.press(screen.getByRole("radio", { name: "Scuro" }));
    expect(screen.getByRole("radio", { name: "Scuro" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Automatico" })).not.toBeChecked();
    await user.press(screen.getByRole("radio", { name: "Molto grande" }));
    await waitFor(async () => expect(await saved()).toMatchObject({ theme: "dark", textSize: "xlarge" }));
  });

  it("legge le preferenze già salvate", async () => {
    await AsyncStorage.setItem("orienta:prefs", JSON.stringify({ theme: "light", textSize: "large" }));
    await renderWithTheme(<ProfiloScreen />);
    expect(await screen.findByRole("radio", { name: "Chiaro", checked: true })).toBeOnTheScreen();
    expect(screen.getByRole("radio", { name: "Grande" })).toBeChecked();
  });
});
