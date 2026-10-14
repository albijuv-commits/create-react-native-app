import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, renderHook, screen, waitFor, within } from "@testing-library/react-native";
import * as WebBrowser from "expo-web-browser";
import euData from "@data/medicines/eu-brands.json";
import seed from "@data/medicines/seed.json";
import MedicineScreen from "~/app/(tabs)/mercato/[aic]";
import ConfrontoScreen from "~/app/(tabs)/mercato/confronto";
import MercatoScreen from "~/app/(tabs)/mercato/index";
import { catalogQuerySchema } from "@/lib/medicines/types";
import { sampleBrands, sampleByAic, sampleDetail, sampleInfo, sampleSearch } from "~/lib/catalog-sample";
import { clearMedicineLists, useMedicineList } from "~/lib/medicine-lists";
import { renderWithTheme } from "./render";

// Parametri della schermata in memoria, come quelli di Expo Router; il titolo della scheda si legge da Stack.Screen
jest.mock("expo-router", () => {
  const { useSyncExternalStore } = jest.requireActual<typeof import("react")>("react");
  let params: Record<string, string> = {};
  const listeners = new Set<() => void>();
  return {
    router: { push: jest.fn(), navigate: jest.fn(), dismissTo: jest.fn(), setParams: jest.fn() },
    Stack: { Screen: jest.fn(() => null) },
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
      listeners.forEach((l) => l());
    },
  };
});
// Senza il servizio della web app: il campione di esempio si cerca sul telefono
jest.mock("~/lib/api", () => ({ apiBaseUrl: jest.fn(() => null) }));

const expoRouter = jest.requireMock<{
  router: Record<"push" | "navigate" | "dismissTo", jest.Mock>;
  Stack: { Screen: jest.Mock };
  __setParams: (p: Record<string, string>) => void;
}>("expo-router");
const { router } = expoRouter;
const api = jest.requireMock<{ apiBaseUrl: jest.Mock }>("~/lib/api");

const TORVAST = "033007042";
const TOTALIP = "033006040";
const KRKA = "040899142";
const TACHIPIRINA = "012745093";
/** Linguaggio pubblicitario che il Mercato non usa mai */
const ADVERTISING = /offert|più vendut|scont|promozion|imperdibil|miglior prezzo|occasion/i;

const lastTitle = () => (expoRouter.Stack.Screen.mock.calls.at(-1)?.[0] as { options: { title: string } } | undefined)?.options.title;
const cards = () => screen.queryAllByRole("button", { name: /^Aggiungi ai preferiti:|^Togli dai preferiti:/ });

async function search(text: string) {
  await fireEvent.changeText(screen.getByLabelText("Cerca per nome o principio attivo"), text);
}

beforeEach(async () => {
  jest.clearAllMocks();
  api.apiBaseUrl.mockReturnValue(null);
  jest.spyOn(WebBrowser, "openBrowserAsync").mockResolvedValue({ type: WebBrowser.WebBrowserResultType.OPENED });
  await clearMedicineLists();
});

afterEach(() => jest.restoreAllMocks());

describe("catalogo del Mercato", () => {
  it("mostra il campione etichettato come DATI DI ESEMPIO, l'avviso e la fonte", async () => {
    await renderWithTheme(<MercatoScreen />);
    expect(await screen.findByText("44 confezioni")).toBeTruthy();
    expect(screen.getByText("DATI DI ESEMPIO")).toBeTruthy();
    expect(screen.getByText(/Questa app non è collegata al servizio di Orienta/)).toBeTruthy();
    expect(screen.getByText("Qui non si compra: è un catalogo informativo.")).toBeTruthy();
    expect(screen.getByText(/licenza CC BY 4\.0/)).toBeTruthy();
    expect(screen.queryByText(ADVERTISING)).toBeNull();
    expect(cards()).toHaveLength(24);
    await fireEvent.press(screen.getByRole("button", { name: "Mostra altre confezioni (20)" }));
    await waitFor(() => expect(cards()).toHaveLength(44));
    expect(screen.queryByRole("button", { name: /^Mostra altre confezioni/ })).toBeNull();
  });

  it("cerca per nome o principio attivo e dice quando non trova niente", async () => {
    await renderWithTheme(<MercatoScreen />);
    await screen.findByText("44 confezioni");
    await search("atorvastatina");
    expect(await screen.findByText("4 confezioni")).toBeTruthy();
    expect(cards().map((c) => c.props.accessibilityLabel)).toEqual([
      "Aggiungi ai preferiti: Atorvastatina Krka",
      "Aggiungi ai preferiti: Atorvastatina Sandoz Gmbh",
      "Aggiungi ai preferiti: Torvast",
      "Aggiungi ai preferiti: Totalip",
    ]);
    await search("farmaco inesistente");
    expect(await screen.findByText("Nessuna confezione trovata.")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Cancella la ricerca" }));
    expect(await screen.findByText("44 confezioni")).toBeTruthy();
  });

  it("filtra per forma, ricetta e categoria, e azzera i filtri", async () => {
    await renderWithTheme(<MercatoScreen />);
    await screen.findByText("44 confezioni");
    await fireEvent.press(screen.getByRole("radio", { name: "Sciroppi e gocce" }));
    expect(await screen.findByText("3 confezioni")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Filtri (1)" })).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Azzera filtri" }));
    expect(await screen.findByText("44 confezioni")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Filtri" }));
    await fireEvent.press(screen.getByRole("radio", { name: "Senza ricetta" }));
    expect(await screen.findByText("12 confezioni")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Categoria terapeutica (ATC): Tutte le categorie" }));
    await fireEvent.press(screen.getByRole("radio", { name: "C · Sistema cardiovascolare" }));
    expect(await screen.findByText("Nessuna confezione trovata.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Categoria terapeutica (ATC): C · Sistema cardiovascolare" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Filtri (2)" })).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Azzera filtri" }));
    expect(await screen.findByText("44 confezioni")).toBeTruthy();
  });

  it("ordina per prezzo", async () => {
    await renderWithTheme(<MercatoScreen />);
    await screen.findByText("44 confezioni");
    await fireEvent.press(screen.getByRole("button", { name: "Filtri" }));
    await fireEvent.press(screen.getByRole("radio", { name: "Prezzo crescente" }));
    await waitFor(() => expect(cards()[0]?.props.accessibilityLabel).toBe("Aggiungi ai preferiti: Eutirox"));
    await fireEvent.press(screen.getByRole("radio", { name: "Prezzo decrescente" }));
    await waitFor(() => expect(cards()[0]?.props.accessibilityLabel).toBe("Aggiungi ai preferiti: Ondansetron Kabi"));
  });

  it("apre la scheda toccando la confezione e i marchi solo quando si chiedono", async () => {
    await renderWithTheme(<MercatoScreen />);
    await screen.findByText("44 confezioni");
    // «torvast» è anche dentro «atorvastatina»: escono tutti e quattro i marchi
    await search("torvast");
    await screen.findByText("4 confezioni");
    await fireEvent.press(screen.getByRole("link", { name: /^Torvast, / }));
    expect(router.push).toHaveBeenCalledWith({ pathname: "/mercato/[aic]", params: { aic: TORVAST } });

    const disclosure = screen.getAllByRole("button", { name: /^Marchi, aziende e prezzi/ })[2]!;
    expect(disclosure.props.accessibilityState).toMatchObject({ expanded: false });
    await fireEvent.press(disclosure);
    expect(await screen.findByText("4 marchi di 4 aziende")).toBeTruthy();
    expect(screen.getByText(/4 confezioni con prezzo nelle liste AIFA/)).toBeTruthy();
    await fireEvent.press(screen.getAllByText("Totalip")[0]!);
    expect(router.push).toHaveBeenLastCalledWith({ pathname: "/mercato/[aic]", params: { aic: TOTALIP } });
  });

  it("salva i preferiti sul telefono e li mostra nella loro scheda", async () => {
    await renderWithTheme(<MercatoScreen />);
    await screen.findByText("44 confezioni");
    await fireEvent.press(screen.getByRole("tab", { name: "Preferiti" }));
    expect(screen.getByText("Non hai ancora preferiti.")).toBeTruthy();
    await fireEvent.press(screen.getByRole("tab", { name: "Catalogo" }));
    await search("torvast");
    await screen.findByText("4 confezioni");
    await fireEvent.press(screen.getByRole("button", { name: "Aggiungi ai preferiti: Torvast" }));
    expect(JSON.parse((await AsyncStorage.getItem("orienta:farmaci-preferiti")) ?? "[]")).toEqual([TORVAST]);
    await fireEvent.press(screen.getByRole("tab", { name: "Preferiti (1)" }));
    expect(await screen.findByRole("button", { name: "Togli dai preferiti: Torvast" })).toBeTruthy();
    expect(screen.getByText("I preferiti restano solo su questo telefono.")).toBeTruthy();
  });

  it("mette in confronto fino a tre confezioni e apre il confronto", async () => {
    await renderWithTheme(<MercatoScreen />);
    await screen.findByText("44 confezioni");
    await search("atorvastatina");
    await screen.findByText("4 confezioni");
    await fireEvent.press(screen.getByRole("button", { name: "Aggiungi al confronto: Atorvastatina Krka" }));
    expect(screen.getByText("1 su 3 nel confronto")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Aggiungi al confronto: Torvast" }));
    await fireEvent.press(screen.getByRole("button", { name: "Aggiungi al confronto: Totalip" }));
    expect(screen.getByText("3 su 3 nel confronto")).toBeTruthy();
    const full = screen.getByRole("button", { name: "Confronto pieno (al massimo 3): Atorvastatina Sandoz Gmbh" });
    expect(full.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(screen.getByRole("button", { name: "Confronta" }));
    expect(router.push).toHaveBeenCalledWith("/mercato/confronto");
    await fireEvent.press(screen.getByRole("button", { name: "Svuota" }));
    expect(screen.queryByText(/nel confronto$/)).toBeNull();
  });
});

describe("Mercato con il servizio, quando la rete non risponde", () => {
  const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
  /** Il catalogo risponde; elenco e marchi falliscono le prime volte, poi rispondono */
  function network(failures: { elenco: number; marchi: number }) {
    return jest.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      const body = JSON.parse(String(init?.body ?? "{}")) as { aics?: string[]; aic?: string };
      if (url.endsWith("/api/farmaci")) return json({ info: { ...sampleInfo(), source: "aifa" }, page: sampleSearch(catalogQuerySchema.parse({})) });
      if (url.endsWith("/api/farmaci/elenco")) {
        if (failures.elenco-- > 0) throw new TypeError("Network request failed");
        return json({ items: sampleByAic(body.aics ?? []) });
      }
      if (url.endsWith("/api/farmaci/marchi")) {
        if (failures.marchi-- > 0) throw new TypeError("Network request failed");
        return json(sampleBrands(body.aic ?? ""));
      }
      throw new Error(`richiesta inattesa: ${url}`);
    });
  }

  it("i preferiti che non arrivano lo dicono e si può riprovare", async () => {
    api.apiBaseUrl.mockReturnValue("https://orienta.example");
    network({ elenco: 1, marchi: 0 });
    const lists = await renderHook(() => useMedicineList("preferiti"));
    await act(async () => lists.result.current.toggle(TORVAST));
    await renderWithTheme(<MercatoScreen />);
    await screen.findByText("44 confezioni");
    await fireEvent.press(screen.getByRole("tab", { name: "Preferiti (1)" }));
    expect(await screen.findByText("Non riusciamo a raggiungere il catalogo. Controlla la connessione.")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Riprova" }));
    expect(await screen.findByRole("button", { name: "Togli dai preferiti: Torvast" })).toBeOnTheScreen();
  });

  it("il riquadro dei marchi riprova quando lo si riapre dopo un errore", async () => {
    api.apiBaseUrl.mockReturnValue("https://orienta.example");
    network({ elenco: 0, marchi: 1 });
    await renderWithTheme(<MercatoScreen />);
    await screen.findByText("44 confezioni");
    const disclosure = () => screen.getAllByRole("button", { name: /^Marchi, aziende e prezzi/ })[0]!;
    await fireEvent.press(disclosure());
    expect(await screen.findByText("Non riusciamo a raggiungere il catalogo. Controlla la connessione.")).toBeOnTheScreen();
    await fireEvent.press(disclosure());
    await fireEvent.press(disclosure());
    expect(await screen.findByText(/marchi? di \d+ aziend/)).toBeOnTheScreen();
    expect(screen.queryByText("Non riusciamo a raggiungere il catalogo. Controlla la connessione.")).not.toBeOnTheScreen();
  });
});

describe("scheda della confezione", () => {
  it("mostra prezzo, ricetta, foglietto, informazioni, equivalenti e marchi", async () => {
    expoRouter.__setParams({ aic: TORVAST });
    await renderWithTheme(<MedicineScreen />);
    expect(await screen.findByText("Farmaci equivalenti")).toBeTruthy();
    expect(lastTitle()).toBe("Torvast");
    expect(screen.getByText("DATI DI ESEMPIO")).toBeTruthy();
    expect(screen.getByText(/Prezzo di riferimento SSN/)).toBeTruthy();
    expect(screen.getByText("Chiedi consiglio al medico o al farmacista.")).toBeTruthy();
    expect(screen.getByText("C10AA05 · Sistema cardiovascolare · Ipocolesterolemizzanti ed ipotrigliceridemizzanti")).toBeTruthy();
    expect(screen.getByText("Il principio attivo: atorvastatina")).toBeTruthy();
    expect(screen.getByText("(questa confezione)")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Marchi e aziende" })).toBeTruthy();
    // I marchi europei stanno solo sul servizio: nel campione la sezione non c'è
    expect(screen.queryByText("In Europa")).toBeNull();
    expect(screen.queryByText(ADVERTISING)).toBeNull();
    // Nessun dosaggio consigliato: c'è il foglietto ufficiale dell'AIFA
    const leaflet = seed.medicines.find((m) => m.aic === TORVAST)!.leafletUrl;
    await fireEvent.press(screen.getByRole("link", { name: /^Foglietto illustrativo ufficiale/ }));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(leaflet);

    const nav = ["Prezzo", "Principio attivo", "Equivalenti", "Marchi e aziende"];
    for (const label of nav) expect(screen.getByRole("button", { name: label })).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Equivalenti" }));

    await fireEvent.press(screen.getAllByText("Atorvastatina Krka")[0]!);
    expect(router.push).toHaveBeenCalledWith({ pathname: "/mercato/[aic]", params: { aic: KRKA } });
  });

  it("con il servizio mostra anche gli stessi principi attivi in Europa, Paese per Paese", async () => {
    // La risposta di /api/farmaci/scheda con i dati veri dell'elenco EMA usati dalla web app
    const entry = euData.ingredients.atorvastatina;
    const europe = { source: euData.source, url: euData.url, updated: euData.updated, products: entry.products, countries: entry.countries, brands: entry.brands, sameRoute: true };
    const detail = { ...sampleDetail(TORVAST)!, info: { ...sampleInfo(), source: "aifa" }, europe };
    api.apiBaseUrl.mockReturnValue("https://orienta.example");
    jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(detail), { status: 200 }));
    expoRouter.__setParams({ aic: TORVAST });
    await renderWithTheme(<MedicineScreen />);
    expect(await screen.findByRole("heading", { name: "In Europa" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "In Europa" })).toBeTruthy();
    expect(screen.queryByText("DATI DI ESEMPIO")).toBeNull();
    expect(screen.getByText(new RegExp(`autorizzato in ${entry.countries.length} Paesi europei: qui ${entry.brands.length} marchi da usare per bocca`))).toBeTruthy();
    expect(screen.queryByRole("radio", { name: "Italia" })).toBeNull();
    await fireEvent.press(screen.getByRole("radio", { name: "Germania" }));
    const inGermany = entry.brands.filter((b) => b.countries.includes("Germania") || b.countries.includes("Tutta l'UE"));
    expect(screen.getByText(`${inGermany.length} marchi in Germania`)).toBeTruthy();
    expect(screen.getByText("Sortis")).toBeTruthy();
    await fireEvent.press(screen.getByRole("link", { name: /elenco EMA/ }));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(euData.url);
  });

  it("per un farmaco senza ricetta spiega dove si compra e come riconoscere i siti autorizzati", async () => {
    expoRouter.__setParams({ aic: TACHIPIRINA });
    await renderWithTheme(<MedicineScreen />);
    expect(await screen.findByText(/Si compra in farmacia o in parafarmacia/)).toBeTruthy();
    expect(lastTitle()).toBe("Tachipirina");
    expect(screen.getByText("Prezzo non presente nelle liste AIFA")).toBeTruthy();
    await fireEvent.press(screen.getByRole("link", { name: "Verifica un sito di vendita online" }));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith("https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm");
  });

  it("dice quando una scheda non c'è e permette di riprovare", async () => {
    expoRouter.__setParams({ aic: "999999999" });
    await renderWithTheme(<MedicineScreen />);
    expect(await screen.findByText("Non riusciamo a mostrare questa scheda")).toBeTruthy();
    expect(screen.getByText("Questa confezione non è nel catalogo.")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Riprova" }));
    expect(await screen.findByText("Questa confezione non è nel catalogo.")).toBeTruthy();
  });
});

describe("confronto", () => {
  it("senza confezioni spiega come aggiungerle", async () => {
    await renderWithTheme(<ConfrontoScreen />);
    expect(screen.getByText("Non hai ancora scelto farmaci da confrontare.")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Vai al catalogo" }));
    expect(router.dismissTo).toHaveBeenCalledWith("/mercato");
  });

  it("affianca le confezioni, segna il prezzo più basso e permette di toglierle", async () => {
    const { result } = await renderHook(() => useMedicineList("confronto"));
    await act(async () => {
      result.current.toggle(KRKA);
      result.current.toggle(TORVAST);
    });
    await renderWithTheme(<ConfrontoScreen />);
    expect(await screen.findByText("Il più basso tra questi")).toBeTruthy();
    expect(screen.getByLabelText(/^Atorvastatina Krka: 7,96\s€, il più basso tra questi/)).toBeTruthy();
    expect(screen.getByLabelText(/^Torvast: 10,51\s€, al 15 settembre 2026$/)).toBeTruthy();
    expect(screen.getByLabelText("Torvast: Viatris Pharma S.r.l.")).toBeTruthy();
    expect(screen.getByText("Per scegliere un farmaco chiedi consiglio al medico o al farmacista.")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Togli Torvast dal confronto" }));
    await waitFor(() => expect(screen.queryByText("Torvast")).toBeNull());
    expect(screen.queryByText("Il più basso tra questi")).toBeNull();
    await fireEvent.press(screen.getByRole("link", { name: "Atorvastatina Krka" }));
    expect(router.push).toHaveBeenCalledWith({ pathname: "/mercato/[aic]", params: { aic: KRKA } });

    await fireEvent.press(screen.getByRole("button", { name: "Svuota il confronto" }));
    expect(await screen.findByText("Non hai ancora scelto farmaci da confrontare.")).toBeTruthy();
    const empty = screen.getByText("Non hai ancora scelto farmaci da confrontare.");
    expect(within(empty).queryByText(ADVERTISING)).toBeNull();
  });
});
