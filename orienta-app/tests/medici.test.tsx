import { act, fireEvent, screen, userEvent, waitFor } from "@testing-library/react-native";
import { Linking } from "react-native";
import { DoctorsRequestError } from "@/lib/doctors/client";
import MediciScreen from "~/app/(tabs)/medici";
import { bearingDeg, directionWord } from "~/components/doctors/doctor-map";
import { clearSummaryForDoctors, saveSummaryForDoctors } from "~/lib/doctor-handoff";
import { LocationError } from "~/lib/location";
import { renderWithTheme } from "./render";

// Parametri della schermata in memoria, come quelli di Expo Router: setParams li cambia e la schermata si aggiorna
jest.mock("expo-router", () => {
  const { useSyncExternalStore } = jest.requireActual<typeof import("react")>("react");
  let params: Record<string, string> = {};
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  return {
    router: {
      push: jest.fn(),
      navigate: jest.fn(),
      setParams: jest.fn((patch: Record<string, string | undefined>) => {
        const next = { ...params };
        for (const [k, v] of Object.entries(patch)) {
          if (v === undefined) delete next[k];
          else next[k] = v;
        }
        params = next;
        emit();
      }),
    },
    useLocalSearchParams: () =>
      useSyncExternalStore(
        (l: () => void) => {
          listeners.add(l);
          return () => listeners.delete(l);
        },
        () => params,
      ),
    __setParams: (next: Record<string, string>) => {
      params = next;
      emit();
    },
  };
});
// Il servizio della web app: di serie non c'è (dati di esempio calcolati sul telefono); la ricerca dei luoghi si simula
jest.mock("~/lib/api", () => {
  const actual = jest.requireActual<typeof import("~/lib/api")>("~/lib/api");
  return { ...actual, apiBaseUrl: jest.fn(() => null), findPlace: jest.fn(), searchDoctors: jest.fn(actual.searchDoctors) };
});
jest.mock("~/lib/location", () => {
  const actual = jest.requireActual<typeof import("~/lib/location")>("~/lib/location");
  return { ...actual, currentPosition: jest.fn() };
});

const expoRouter = jest.requireMock<{ __setParams: (p: Record<string, string>) => void }>("expo-router");
const api = jest.requireMock<{ apiBaseUrl: jest.Mock; findPlace: jest.Mock; searchDoctors: jest.Mock }>("~/lib/api");
const location = jest.requireMock<{ currentPosition: jest.Mock }>("~/lib/location");

const MILANO = { lat: 45.4642, lon: 9.19 };
const SUMMARY = "Riepilogo per il medico\nPreparato con Orienta\n\nCosa ha descritto\n- «Bruciore quando faccio pipì»";

beforeEach(() => {
  jest.clearAllMocks();
  expoRouter.__setParams({});
  api.apiBaseUrl.mockReturnValue(null);
  location.currentPosition.mockResolvedValue(MILANO);
  jest.spyOn(Linking, "openURL").mockResolvedValue(true);
  jest.spyOn(Linking, "openSettings").mockResolvedValue();
});
afterEach(() => {
  clearSummaryForDoctors();
  jest.restoreAllMocks();
});

describe("sezione Medici", () => {
  it("dai risultati allo specialista, con il riepilogo dei sintomi nell'email", async () => {
    const user = userEvent.setup();
    saveSummaryForDoctors(SUMMARY);
    expoRouter.__setParams({ specialista: "urologo", condizione: "cistite" });
    await renderWithTheme(<MediciScreen />);

    expect(screen.getByText(/Specialista di riferimento per «Cistite»:/)).toBeOnTheScreen();
    expect(screen.getByRole("radio", { name: "Urologo, consigliato" })).toBeChecked();
    expect(screen.getByText("Primo passo: il medico di base")).toBeOnTheScreen();
    expect(screen.getByText("Il riepilogo dei tuoi sintomi è pronto")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Usa la mia posizione" }));
    expect(await screen.findByText("6 risultati entro 10 km da te")).toBeOnTheScreen();
    expect(screen.getByRole("status")).toHaveTextContent(/DATI DI ESEMPIO/);
    expect(api.searchDoctors).toHaveBeenCalledWith({ specialty: "urologo", lat: MILANO.lat, lon: MILANO.lon, radiusKm: 10 }, expect.anything());
    // I dati di esempio non hanno numeri di telefono: niente «Chiama»
    expect(screen.queryByRole("button", { name: "Chiama" })).not.toBeOnTheScreen();

    await user.press(screen.getAllByRole("button", { name: "Email" })[0]!);
    expect(await screen.findByRole("heading", { name: "Email a Studio medico di esempio 1" })).toBeOnTheScreen();
    const include = screen.getByRole("checkbox", { name: /Aggiungi il riepilogo dei sintomi/ });
    expect(include).toBeChecked();
    await user.press(screen.getByRole("button", { name: "Apri l'app di posta" }));
    const href = (Linking.openURL as jest.Mock).mock.lastCall![0] as string;
    expect(href).toMatch(/^mailto:esempio1@example\.com\?subject=Richiesta%20di%20appuntamento%2C%20con%20riepilogo%20dei%20sintomi&body=/);
    expect(decodeURIComponent(href)).toContain("Riepilogo per il medico");

    await user.press(include);
    await user.press(screen.getByRole("button", { name: "Apri l'app di posta" }));
    const plain = (Linking.openURL as jest.Mock).mock.lastCall![0] as string;
    expect(plain).toMatch(/subject=Richiesta%20di%20appuntamento&body=/);
    expect(decodeURIComponent(plain)).not.toContain("Riepilogo per il medico");
    await user.press(screen.getByRole("button", { name: "Chiudi" }));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Email a Studio medico di esempio 1" })).not.toBeOnTheScreen());
  });

  it("cambiando specialista la ricerca riparte; il riepilogo si può togliere", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<MediciScreen />);
    expect(screen.getByRole("radio", { name: "Medico di base" })).toBeChecked();
    expect(screen.queryByText("Primo passo: il medico di base")).not.toBeOnTheScreen();
    expect(screen.queryByText("Il riepilogo dei tuoi sintomi è pronto")).not.toBeOnTheScreen();

    // Il riepilogo preparato dai Risultati compare anche se la sezione era già aperta
    await act(async () => saveSummaryForDoctors(SUMMARY));
    expect(screen.getByText("Il riepilogo dei tuoi sintomi è pronto")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Togli" }));
    expect(screen.queryByText("Il riepilogo dei tuoi sintomi è pronto")).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Usa la mia posizione" }));
    await screen.findByText("6 risultati entro 10 km da te");
    await user.press(screen.getByRole("radio", { name: "Dermatologo" }));
    await waitFor(() => expect(api.searchDoctors).toHaveBeenLastCalledWith(expect.objectContaining({ specialty: "dermatologo" }), expect.anything()));
    expect(await screen.findByText("6 risultati entro 10 km da te")).toBeOnTheScreen();
    expect(screen.getAllByText("Dermatologo").length).toBeGreaterThan(1);
  });

  it("cerca per città, cambia distanza e passa alla mappa schematica", async () => {
    const user = userEvent.setup();
    api.apiBaseUrl.mockReturnValue("https://web-app.test");
    api.findPlace.mockResolvedValue({ label: "Bologna, Emilia-Romagna", lat: 44.4938, lon: 11.3387 });
    await renderWithTheme(<MediciScreen />);

    await user.type(screen.getByLabelText("Città o CAP"), "Bologna");
    await user.press(screen.getByRole("button", { name: "Cerca" }));
    expect(api.findPlace).toHaveBeenCalledWith("Bologna", expect.anything());
    expect(await screen.findByText("6 risultati entro 10 km da Bologna, Emilia-Romagna")).toBeOnTheScreen();

    await user.press(screen.getByRole("radio", { name: "2 km" }));
    expect(await screen.findByText("2 risultati entro 2 km da Bologna, Emilia-Romagna")).toBeOnTheScreen();

    await user.press(screen.getByRole("radio", { name: "Mappa" }));
    await fireEvent(screen.getByTestId("mappa-medici"), "layout", { nativeEvent: { layout: { x: 0, y: 0, width: 340, height: 420 } } });
    expect(screen.getByText(/i cerchi indicano 500 m, 1 km, 2 km/)).toBeOnTheScreen();
    expect(screen.getByText("Tocca un numero per vedere i contatti. Lo stesso numero è nella vista lista.")).toBeOnTheScreen();
    const pin = screen.getByRole("button", { name: /^1\. Studio medico di esempio 1, 450 m a nord-est$/ });
    expect(screen.getByRole("button", { name: /^2\. Studio medico di esempio 2, 1,2 km a sud-est$/ })).toBeOnTheScreen();
    await user.press(pin);
    expect(screen.getByRole("button", { name: /^1\. Studio medico di esempio 1/ })).toBeSelected();
    expect(screen.getByRole("heading", { name: "1. Studio medico di esempio 1" })).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Indicazioni" }));
    expect(Linking.openURL).toHaveBeenLastCalledWith(expect.stringMatching(/^https:\/\/maps\.apple\.com\/\?daddr=44\.49\d+,11\.34\d+&q=Studio%20medico%20di%20esempio%201$/));
  });

  it("pronto soccorso: prima di tutto il 112", async () => {
    const user = userEvent.setup();
    expoRouter.__setParams({ specialista: "pronto-soccorso" });
    await renderWithTheme(<MediciScreen />);
    expect(screen.getByText("In un'emergenza non cercare: chiama subito il 112.")).toBeOnTheScreen();
    await user.press(screen.getAllByRole("button", { name: "Chiama il 112" })[0]!);
    expect(Linking.openURL).toHaveBeenCalledWith("tel:112");
  });

  it("spiega cosa fare se la posizione è negata o la città non si trova", async () => {
    const user = userEvent.setup();
    api.apiBaseUrl.mockReturnValue("https://web-app.test");
    api.findPlace.mockResolvedValue(null);
    location.currentPosition.mockRejectedValue(new LocationError("Non hai dato il permesso di usare la posizione. Scrivi la città o il CAP.", true));
    await renderWithTheme(<MediciScreen />);

    await user.press(screen.getByRole("button", { name: "Usa la mia posizione" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/Non hai dato il permesso di usare la posizione/);
    await user.press(screen.getByRole("button", { name: "Apri le impostazioni" }));
    expect(Linking.openSettings).toHaveBeenCalled();

    await user.type(screen.getByLabelText("Città o CAP"), "Paese Inesistente");
    await user.press(screen.getByRole("button", { name: "Cerca" }));
    expect(await screen.findByText("Non troviamo «Paese Inesistente». Controlla come è scritto, oppure prova con il CAP.")).toBeOnTheScreen();
  });

  it("senza il servizio di Orienta si cerca solo con la posizione e lo si dice", async () => {
    await renderWithTheme(<MediciScreen />);
    expect(screen.queryByLabelText("Città o CAP")).not.toBeOnTheScreen();
    expect(screen.getByText(/Questa app non è collegata al servizio di Orienta/)).toBeOnTheScreen();
    expect(screen.getByRole("heading", { name: "Come prenotare" })).toBeOnTheScreen();
    expect(screen.getByRole("link", { name: /Ministero della Salute, Ricetta elettronica e CUP/ })).toBeOnTheScreen();
  });
});

describe("servizio Medici", () => {
  it("senza indirizzo della web app: dati di esempio etichettati e posizione arrotondata", async () => {
    const { searchDoctors, findPlace, EXAMPLE_DOCTORS_NOTICE } = jest.requireActual<typeof import("~/lib/api")>("~/lib/api");
    const res = await searchDoctors({ specialty: "medico-di-base", lat: 45.46421, lon: 9.19017, radiusKm: 5 });
    expect(res.source).toBe("esempio");
    expect(res.notice).toBe(EXAMPLE_DOCTORS_NOTICE);
    expect(res.notice).toContain("DATI DI ESEMPIO");
    expect(res.doctors.map((d) => d.distanceM)).toEqual([450, 1200, 2600, 4100]);
    expect(res.doctors.every((d) => d.phone === null && (d.email === null || d.email.endsWith("@example.com")))).toBe(true);
    await expect(findPlace("Bologna")).rejects.toBeInstanceOf(DoctorsRequestError);
  });

  it("direzioni della mappa: nord, est, sud-ovest", () => {
    expect(directionWord(bearingDeg(MILANO, { lat: 45.5, lon: 9.19 }))).toBe("nord");
    expect(directionWord(bearingDeg(MILANO, { lat: 45.4642, lon: 9.3 }))).toBe("est");
    expect(directionWord(bearingDeg(MILANO, { lat: 45.4, lon: 9.1 }))).toBe("sud-ovest");
  });
});
