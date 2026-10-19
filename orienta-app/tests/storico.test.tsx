import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, screen, userEvent, waitFor } from "@testing-library/react-native";
import { MAX_SESSIONS, type HistoryEntry } from "@/lib/storage/history";
import { HistoryList } from "~/components/profile/history-list";
import { SaveToHistory } from "~/components/triage/save-history";
import { clearSessions, deleteSession, HISTORY_KEY, saveSession, useHistory } from "~/lib/history";
import { renderWithTheme } from "./render";

jest.mock("expo-router", () => ({ router: { push: jest.fn(), navigate: jest.fn() } }));
jest.mock("expo-clipboard", () => ({ setStringAsync: jest.fn(() => Promise.resolve(true)) }));
jest.mock("~/lib/summary-pdf", () => ({ shareSummaryPdf: jest.fn(() => Promise.resolve("condiviso")), deleteSummaryPdfs: jest.fn() }));

const router = jest.requireMock<{ router: Record<"push" | "navigate", jest.Mock> }>("expo-router").router;

function entry(n: number, patch: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: `sessione-${String(n).padStart(3, "0")}`,
    createdAt: new Date(Date.UTC(2026, 9, 1, 8, 0) + n * 60_000).toISOString(),
    source: "regole",
    urgency: "gp",
    unidentified: false,
    conditions: [{ id: "faringite-tonsillite", name: "Faringite e tonsillite", compatibility: "media" }],
    symptoms: ["mal-di-gola", "febbre"],
    age: 34,
    summary: `Riepilogo per il medico\nSessione ${n}: mal di gola e febbre`,
    ...patch,
  };
}

const saved = async () => JSON.parse((await AsyncStorage.getItem(HISTORY_KEY)) ?? "null") as HistoryEntry[] | null;

// Lo storico già salvato prima del primo uso: questo file parte con un modulo nuovo, mai letto
beforeAll(async () => {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([entry(1), { id: "non valida", summary: "" }, entry(2)]));
});

describe("storico sul telefono", () => {
  it("rilegge le sessioni salvate dalla più recente e ignora quelle non valide", async () => {
    const { result } = await renderHook(() => useHistory());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    const state = result.current;
    expect(state.status === "ready" && state.sessions.map((s) => s.id)).toEqual(["sessione-002", "sessione-001"]);
  });

  it("salva solo voci valide, al massimo le più recenti, ed elimina una o tutte", async () => {
    await expect(saveSession({ ...entry(3), summary: "" })).rejects.toThrow();
    for (let n = 3; n <= MAX_SESSIONS + 5; n++) await saveSession(entry(n));
    const all = (await saved())!;
    expect(all).toHaveLength(MAX_SESSIONS);
    expect(all[0]!.id).toBe(`sessione-0${MAX_SESSIONS + 5}`);
    expect(all.some((s) => s.id === "sessione-001")).toBe(false);
    // Salvare di nuovo la stessa sessione non la duplica
    await saveSession(entry(MAX_SESSIONS + 5));
    expect((await saved())!).toHaveLength(MAX_SESSIONS);
    await deleteSession(`sessione-0${MAX_SESSIONS + 5}`);
    expect((await saved())!).toHaveLength(MAX_SESSIONS - 1);
    await clearSessions();
    expect(await AsyncStorage.getItem(HISTORY_KEY)).toBeNull();
  });
});

describe("«Salva nello storico» nei risultati", () => {
  it("salva solo quando lo si chiede, e si può togliere subito", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<SaveToHistory entry={entry(7)} />);
    expect(await saved()).toBeNull();
    await user.press(screen.getByRole("button", { name: "Salva nello storico" }));
    expect(await screen.findByText(/Salvata solo su questo telefono/)).toBeOnTheScreen();
    expect((await saved())!.map((s) => s.id)).toEqual(["sessione-007"]);
    await user.press(screen.getByRole("link", { name: "Profilo" }));
    expect(router.navigate).toHaveBeenCalledWith("/profilo");
    await user.press(screen.getByRole("button", { name: "Elimina dallo storico" }));
    expect(await screen.findByText("Eliminata dallo storico: su questo telefono non resta.")).toBeOnTheScreen();
    expect(await AsyncStorage.getItem(HISTORY_KEY)).toBeNull();
  });
});

describe("quando il telefono non riesce a scrivere", () => {
  // Ogni prova parte dallo storico vuoto, anche eseguita da sola, e lo lascia vuoto
  beforeEach(() => clearSessions());
  afterEach(async () => {
    jest.restoreAllMocks();
    await act(() => clearSessions());
  });

  it("se eliminare dallo storico non riesce, la sessione risulta ancora salvata", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<SaveToHistory entry={entry(8)} />);
    await user.press(screen.getByRole("button", { name: "Salva nello storico" }));
    await screen.findByText(/Salvata solo su questo telefono/);
    jest.spyOn(AsyncStorage, "removeItem").mockRejectedValueOnce(new Error("disco pieno"));
    await user.press(screen.getByRole("button", { name: "Elimina dallo storico" }));
    expect(await screen.findByText("Non riusciamo a eliminarla: è ancora nello storico. Riprova tra poco.")).toBeOnTheScreen();
    expect(screen.getByText(/Salvata solo su questo telefono/)).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Salva nello storico" })).not.toBeOnTheScreen();
    expect((await saved())!.map((s) => s.id)).toEqual(["sessione-008"]);
  });

  it("se svuotare lo storico non riesce, lo dice e le sessioni restano", async () => {
    const user = userEvent.setup();
    await saveSession(entry(9));
    await renderWithTheme(<HistoryList />);
    await screen.findByText("1 sessione salvata su questo telefono.");
    jest.spyOn(AsyncStorage, "removeItem").mockRejectedValueOnce(new Error("disco pieno"));
    await user.press(screen.getByRole("button", { name: "Svuota lo storico" }));
    await user.press(screen.getByRole("button", { name: "Sì, svuota lo storico" }));
    expect(await screen.findByText("Non riusciamo a svuotare lo storico. Riprova.")).toBeOnTheScreen();
    expect(screen.getByText("1 sessione salvata su questo telefono.")).toBeOnTheScreen();
  });
});

describe("storico nel Profilo", () => {
  it("senza sessioni invita a fare un'intervista", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<HistoryList />);
    expect(await screen.findByText(/Non hai sessioni salvate/)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Inizia un'intervista" }));
    expect(router.navigate).toHaveBeenCalledWith("/sintomi/intervista");
  });

  it("mostra urgenza, condizioni e riepilogo, ed elimina con una conferma", async () => {
    const user = userEvent.setup();
    await saveSession(entry(10));
    await saveSession(entry(11, { urgency: "home", source: "ai", unidentified: true, conditions: [] }));
    await renderWithTheme(<HistoryList />);
    expect(await screen.findByText("2 sessioni salvate su questo telefono.")).toBeOnTheScreen();
    expect(screen.getByText(/· 34 anni · con l'AI/)).toBeOnTheScreen();
    expect(screen.getByText("Nessuna corrispondenza chiara con le schede di Orienta.")).toBeOnTheScreen();

    await user.press(screen.getByRole("link", { name: "Faringite e tonsillite" }));
    expect(router.push).toHaveBeenCalledWith({ pathname: "/profilo/condizione/[id]", params: { id: "faringite-tonsillite" } });

    const summaries = screen.getAllByRole("button", { name: "Riepilogo per il medico" });
    await user.press(summaries[1]!);
    expect(screen.getByText(entry(10).summary)).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Copia" })).toBeOnTheScreen();

    await user.press(screen.getAllByRole("button", { name: "Elimina" })[0]!);
    expect(screen.getByText("Eliminare questa sessione dallo storico?")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Annulla" }));
    expect(screen.queryByText("Eliminare questa sessione dallo storico?")).not.toBeOnTheScreen();
    await user.press(screen.getAllByRole("button", { name: "Elimina" })[0]!);
    await user.press(screen.getByRole("button", { name: "Sì, elimina" }));
    expect(await screen.findByText("1 sessione salvata su questo telefono.")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Svuota lo storico" }));
    await user.press(screen.getByRole("button", { name: "Sì, svuota lo storico" }));
    expect(await screen.findByText(/Non hai sessioni salvate/)).toBeOnTheScreen();
    await act(async () => {});
    expect(await AsyncStorage.getItem(HISTORY_KEY)).toBeNull();
  });
});
