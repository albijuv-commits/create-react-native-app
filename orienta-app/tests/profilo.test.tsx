import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, renderHook, screen, userEvent, waitFor } from "@testing-library/react-native";
import * as WebBrowser from "expo-web-browser";
import { Alert, Linking, type AlertButton } from "react-native";
import photos from "@data/medicines/photos.json";
import type { HistoryEntry } from "@/lib/storage/history";
import AvvertenzeScreen from "~/app/(tabs)/profilo/avvertenze";
import FontiScreen from "~/app/(tabs)/profilo/fonti";
import ProfiloScreen from "~/app/(tabs)/profilo/index";
import PrivacyScreen from "~/app/(tabs)/profilo/privacy";
import { ErrorScreen } from "~/components/error-screen";
import { readSummaryForDoctors, saveSummaryForDoctors } from "~/lib/doctor-handoff";
import { onEraseAll } from "~/lib/erase";
import { saveSession } from "~/lib/history";
import { useMedicineList } from "~/lib/medicine-lists";
import { renderWithTheme } from "./render";

jest.mock("expo-router", () => ({ router: { push: jest.fn(), navigate: jest.fn(), dismissTo: jest.fn() } }));
jest.mock("~/lib/api", () => ({ apiBaseUrl: jest.fn(() => null) }));
// I PDF rimasti nella cartella temporanea: qui la cartella c'è e va cancellata
const mockDeletePrint = jest.fn();
jest.mock("expo-file-system", () => ({ Paths: { cache: "file:///cache/" }, Directory: jest.fn(() => ({ exists: true, delete: mockDeletePrint })) }));

const router = jest.requireMock<{ router: Record<"push" | "navigate" | "dismissTo", jest.Mock> }>("expo-router").router;
const api = jest.requireMock<{ apiBaseUrl: jest.Mock }>("~/lib/api");

const prefs = async () => JSON.parse((await AsyncStorage.getItem("orienta:prefs")) ?? "{}") as Record<string, unknown>;

const ENTRY: HistoryEntry = {
  id: "sessione-profilo",
  createdAt: "2026-10-10T09:30:00.000Z",
  source: "regole",
  urgency: "soon",
  unidentified: false,
  conditions: [{ id: "cistite", name: "Cistite", compatibility: "alta" }],
  symptoms: ["febbre"],
  age: 41,
  summary: "Riepilogo per il medico\nBruciore e febbre",
};

beforeEach(async () => {
  jest.clearAllMocks();
  api.apiBaseUrl.mockReturnValue(null);
  await AsyncStorage.clear();
});

afterEach(() => jest.restoreAllMocks());

describe("Profilo: preferenze", () => {
  it("tema e dimensione del testo si scelgono e restano sul telefono", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<ProfiloScreen />);
    expect(screen.getByRole("radio", { name: "Automatico" })).toBeChecked();
    await user.press(screen.getByRole("radio", { name: "Scuro" }));
    expect(screen.getByRole("radio", { name: "Scuro" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Automatico" })).not.toBeChecked();
    await user.press(screen.getByRole("radio", { name: "Molto grande" }));
    await waitFor(async () => expect(await prefs()).toMatchObject({ theme: "dark", textSize: "xlarge" }));
  });

  it("legge le preferenze già salvate", async () => {
    await AsyncStorage.setItem("orienta:prefs", JSON.stringify({ theme: "light", textSize: "large" }));
    await renderWithTheme(<ProfiloScreen />);
    expect(await screen.findByRole("radio", { name: "Chiaro", checked: true })).toBeOnTheScreen();
    expect(screen.getByRole("radio", { name: "Grande" })).toBeChecked();
  });

  it("senza il servizio di Orienta la città predefinita non serve e lo dice", async () => {
    await renderWithTheme(<ProfiloScreen />);
    expect(screen.queryByLabelText("Città predefinita")).not.toBeOnTheScreen();
    expect(screen.getByText(/serve il servizio di Orienta: questa app non è collegata/)).toBeOnTheScreen();
  });

  it("con il servizio la città predefinita si salva sul telefono, e si toglie", async () => {
    api.apiBaseUrl.mockReturnValue("https://orienta.example");
    await renderWithTheme(<ProfiloScreen />);
    const field = screen.getByLabelText("Città predefinita");
    await fireEvent.changeText(field, "  Bologna   centro ");
    await fireEvent.press(screen.getByRole("button", { name: "Salva" }));
    expect(await screen.findByText("Città salvata.")).toBeOnTheScreen();
    await waitFor(async () => expect(await prefs()).toMatchObject({ defaultCity: "Bologna centro" }));
    expect(screen.getByLabelText("Città predefinita")).toHaveDisplayValue("Bologna centro");
    await fireEvent.changeText(screen.getByLabelText("Città predefinita"), "");
    await fireEvent(screen.getByLabelText("Città predefinita"), "submitEditing");
    expect(await screen.findByText("Città predefinita tolta.")).toBeOnTheScreen();
    await waitFor(async () => expect(await prefs()).toMatchObject({ defaultCity: "" }));
  });
});

describe("Profilo: i tuoi dati", () => {
  it("«Elimina tutti i miei dati» chiede conferma e poi cancella tutto ciò che Orienta ha sul telefono", async () => {
    const user = userEvent.setup();
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const erased = jest.fn();
    const stop = onEraseAll(erased);
    await AsyncStorage.setItem("orienta:prefs", JSON.stringify({ theme: "dark", textSize: "large", defaultCity: "Torino" }));
    await AsyncStorage.setItem("altra-app:dato", "resta");
    await saveSession(ENTRY);
    const lists = await renderHook(() => useMedicineList("preferiti"));
    await act(async () => lists.result.current.toggle("033007042"));
    saveSummaryForDoctors("Riepilogo per il medico");

    await renderWithTheme(<ProfiloScreen />);
    expect(await screen.findByRole("radio", { name: "Scuro", checked: true })).toBeOnTheScreen();
    expect(await screen.findByText("1 sessione salvata su questo telefono.")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Elimina tutti i miei dati" }));
    expect(alert).toHaveBeenCalledTimes(1);
    const [title, message, buttons] = alert.mock.calls[0]! as [string, string, AlertButton[]];
    expect(title).toBe("Eliminare tutti i tuoi dati?");
    expect(message).toMatch(/lo storico delle sessioni/);
    expect(message).toMatch(/Non si può annullare/);
    // «Annulla» non tocca niente
    expect(buttons[0]).toMatchObject({ text: "Annulla", style: "cancel" });
    expect(await AsyncStorage.getItem("orienta:storico")).not.toBeNull();

    await act(async () => buttons[1]!.onPress!());
    expect(await screen.findByText("Fatto: su questo telefono non resta nessun dato di Orienta.")).toBeOnTheScreen();
    expect((await AsyncStorage.getAllKeys()).filter((k) => k.startsWith("orienta:"))).toEqual([]);
    expect(await AsyncStorage.getItem("altra-app:dato")).toBe("resta");
    expect(lists.result.current.list).toEqual([]);
    expect(readSummaryForDoctors()).toBeNull();
    expect(mockDeletePrint).toHaveBeenCalled();
    expect(erased).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("radio", { name: "Automatico" })).toBeChecked();
    expect(await screen.findByText(/Non hai sessioni salvate/)).toBeOnTheScreen();
    stop();
  });

  it("apre le pagine informative", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<ProfiloScreen />);
    await user.press(screen.getByRole("link", { name: /^Informativa privacy/ }));
    await user.press(screen.getByRole("link", { name: /^Avvertenze mediche/ }));
    await user.press(screen.getByRole("link", { name: /^Fonti/ }));
    expect(router.push.mock.calls.map((c) => c[0])).toEqual(["/profilo/privacy", "/profilo/avvertenze", "/profilo/fonti"]);
  });
});

describe("pagine informative", () => {
  beforeEach(() => {
    jest.spyOn(WebBrowser, "openBrowserAsync").mockResolvedValue({ type: WebBrowser.WebBrowserResultType.OPENED });
    jest.spyOn(Linking, "openURL").mockResolvedValue(true);
  });

  it("l'informativa dice cosa resta sul telefono e che il titolare va indicato prima di pubblicare", async () => {
    const user = userEvent.setup();
    delete process.env.EXPO_PUBLIC_PRIVACY_CONTROLLER;
    await renderWithTheme(<PrivacyScreen />);
    expect(screen.getByText(/Da completare prima della pubblicazione/)).toBeOnTheScreen();
    expect(screen.getByText(/al massimo 50/)).toBeOnTheScreen();
    expect(screen.getByText(/non entrano nel backup automatico su Google Drive/)).toBeOnTheScreen();
    for (const title of ["In breve", "Intervista sui sintomi", "Dati salvati sul telefono", "I tuoi diritti"]) {
      expect(screen.getByRole("heading", { name: title })).toBeOnTheScreen();
    }
    await user.press(screen.getByRole("button", { name: /Dati salvati sul telefono/ }));
    await user.press(screen.getByRole("link", { name: "informativa di Anthropic" }));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith("https://www.anthropic.com/legal/privacy");
  });

  it("con i dati del titolare nella build li mostra", async () => {
    process.env.EXPO_PUBLIC_PRIVACY_CONTROLLER = "Titolare di prova";
    process.env.EXPO_PUBLIC_PRIVACY_CONTACT = "contatto di prova";
    await renderWithTheme(<PrivacyScreen />);
    expect(screen.getByText("Titolare di prova")).toBeOnTheScreen();
    expect(screen.getByText("contatto di prova")).toBeOnTheScreen();
    expect(screen.queryByText(/Da completare prima della pubblicazione/)).not.toBeOnTheScreen();
    delete process.env.EXPO_PUBLIC_PRIVACY_CONTROLLER;
    delete process.env.EXPO_PUBLIC_PRIVACY_CONTACT;
  });

  it("le avvertenze mettono per primi i numeri da chiamare", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<AvvertenzeScreen />);
    expect(screen.getByText(/chiama subito il 112/)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Chiama 112" }));
    expect(Linking.openURL).toHaveBeenCalledWith("tel:112");
    await user.press(screen.getByRole("link", { name: "Emergenza" }));
    expect(router.push).toHaveBeenCalledWith("/emergenza");
    expect(screen.getByText(/condizioni comuni/)).toBeOnTheScreen();
  });

  it("le fonti citano chi ha scattato ogni foto, con la licenza", async () => {
    await renderWithTheme(<FontiScreen />);
    for (const p of photos) expect(screen.getByRole("link", { name: `${p.author}, ${p.license}` })).toBeOnTheScreen();
    expect(screen.getByRole("link", { name: "Open Data dell'AIFA" })).toBeOnTheScreen();
    expect(screen.getByRole("link", { name: "OpenStreetMap contributors" })).toBeOnTheScreen();
  });
});

describe("schermata d'errore", () => {
  it("non mostra dettagli tecnici, tiene il 112 a portata e fa riprovare", async () => {
    const user = userEvent.setup();
    jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    const retry = jest.fn(() => Promise.resolve());
    await renderWithTheme(<ErrorScreen retry={retry} />);
    expect(screen.getByRole("heading", { name: "Qualcosa è andato storto" })).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Chiama il 112" }));
    expect(Linking.openURL).toHaveBeenCalledWith("tel:112");
    await user.press(screen.getByRole("button", { name: "Riprova" }));
    expect(retry).toHaveBeenCalled();
  });
});
