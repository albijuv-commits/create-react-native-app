import { act, screen, userEvent } from "@testing-library/react-native";
import * as Clipboard from "expo-clipboard";
import { Alert, Linking, Share } from "react-native";
import { interviewConditions } from "@/lib/conditions/knowledge-base";
import { TriageRequestError } from "@/lib/triage/client";
import { CORE_QUESTIONS } from "@/lib/triage/questions";
import type { TriageResponse } from "@/lib/triage/schema";
import { Interview } from "~/components/triage/interview";
import { readSummaryForDoctors } from "~/lib/doctor-handoff";
import { renderWithTheme } from "./render";

jest.mock("expo-router", () => ({ router: { push: jest.fn(), navigate: jest.fn() }, useNavigation: () => ({ dispatch: jest.fn() }) }));
jest.mock("expo-router/react-navigation", () => ({ useHeaderHeight: () => 0, usePreventRemove: jest.fn() }));
jest.mock("expo-clipboard", () => ({ setStringAsync: jest.fn(() => Promise.resolve(true)) }));
jest.mock("~/lib/summary-pdf", () => ({ shareSummaryPdf: jest.fn(() => Promise.resolve("condiviso")) }));
jest.mock("~/lib/api", () => ({ apiBaseUrl: jest.fn(() => null), aiAvailable: jest.fn(() => Promise.resolve(false)), postStep: jest.fn() }));

const api = jest.requireMock<{ aiAvailable: jest.Mock; postStep: jest.Mock }>("~/lib/api");
const mockRouter = jest.requireMock<{ router: Record<"push" | "navigate", jest.Mock> }>("expo-router").router;
const preventRemove = jest.requireMock<{ usePreventRemove: jest.Mock }>("expo-router/react-navigation").usePreventRemove;
const pdf = jest.requireMock<{ shareSummaryPdf: jest.Mock }>("~/lib/summary-pdf").shareSummaryPdf;

const CONDITIONS = interviewConditions();
const DISCLAIMER = "Questa non è una diagnosi. Solo un medico può valutare i tuoi sintomi.";

type User = ReturnType<typeof userEvent.setup>;

/** Fa passare il tempo (animazioni delle carte, attesa del testo, «messa a fuoco») */
async function wait(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

/** Consenso e dati di base, fino alla descrizione */
async function start(user: User, { ai = false } = {}) {
  await renderWithTheme(<Interview conditions={CONDITIONS} />);
  await user.press(screen.getByRole("checkbox", { name: /Ho capito che Orienta/ }));
  await user.press(screen.getByRole("checkbox", { name: /Acconsento all'uso dei dati/ }));
  if (ai) await user.press(await screen.findByRole("checkbox", { name: /intelligenza artificiale/ }));
  await user.press(screen.getByRole("button", { name: "Continua" }));
  await user.type(await screen.findByLabelText("Età in anni"), "34");
  await user.press(screen.getByRole("radio", { name: "Maschio" }));
  await user.press(screen.getByRole("button", { name: "Continua" }));
  expect(await screen.findByRole("heading", { name: "Cosa senti?" })).toBeOnTheScreen();
}

async function describe_(user: User, text: string) {
  await user.type(screen.getByLabelText("Descrivi i tuoi disturbi"), text);
  // Il testo si analizza poco dopo che si smette di scrivere
  await wait(350);
}

/** Risponde «no», «non so» o «nessuno» a ogni carta finché compaiono i risultati (aspettando la «messa a fuoco») */
async function answerAll(user: User) {
  for (let i = 0; i < 40; i++) {
    await wait(500);
    if (screen.queryByText(DISCLAIMER)) return;
    const button =
      screen.queryByRole("button", { name: "Nessuno di questi" }) ?? screen.queryByRole("button", { name: "No" }) ?? screen.queryByRole("button", { name: "Non so" });
    if (button) await user.press(button);
  }
  throw new Error("I risultati non arrivano");
}

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate", "queueMicrotask"] });
  jest.clearAllMocks();
  api.aiAvailable.mockResolvedValue(false);
  jest.spyOn(Linking, "openURL").mockResolvedValue(true);
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const setup = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

describe("intervista con le regole fisse", () => {
  it("dalla descrizione ai risultati, senza mai chiamare l'AI", async () => {
    const user = setup();
    await start(user);
    // Senza il servizio configurato la casella dell'AI non c'è nemmeno: si vede solo nei passi successivi
    await describe_(user, "Da ieri ho mal di gola e la febbre");
    expect(screen.getByRole("button", { name: "Mal di gola: togli" })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Febbre: togli" })).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Continua con le domande" }));

    // La prima carta è sempre il controllo dei segnali d'allarme
    expect(await screen.findByRole("heading", { name: CORE_QUESTIONS[0]!.text })).toBeOnTheScreen();
    expect(screen.getByText("Domanda 1")).toBeOnTheScreen();
    await answerAll(user);

    expect(screen.getByRole("heading", { name: /Cosa potrebbe essere|Nessuna corrispondenza chiara/ })).toBeOnTheScreen();
    expect(screen.getByRole("heading", { name: "Quando farti vedere" })).toBeOnTheScreen();
    expect(screen.getByRole("heading", { name: "Riepilogo per il medico" })).toBeOnTheScreen();
    expect(screen.getByText(/usando regole fisse, direttamente sul tuo telefono/)).toBeOnTheScreen();
    expect(api.postStep).not.toHaveBeenCalled();
  });

  it("senza descrizione non si va avanti", async () => {
    const user = setup();
    await start(user);
    await user.press(screen.getByRole("button", { name: "Continua con le domande" }));
    expect(screen.getByText("Scrivi cosa senti, tocca un sintomo o indica una zona del corpo.")).toBeOnTheScreen();
    // Basta toccare un sintomo frequente
    await user.press(screen.getByRole("button", { name: "Aggiungi: Tosse secca" }));
    expect(screen.queryByText("Scrivi cosa senti, tocca un sintomo o indica una zona del corpo.")).not.toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Tosse secca: togli" })).toBeOnTheScreen();
  });

  it("dai risultati: riepilogo da copiare, condividere o salvare in PDF, schede e specialista", async () => {
    const user = setup();
    jest.spyOn(Share, "share").mockResolvedValue({ action: Share.sharedAction });
    await start(user);
    await describe_(user, "Ho mal di gola e la febbre");
    await user.press(screen.getByRole("button", { name: "Continua con le domande" }));
    await answerAll(user);

    await user.press(screen.getByRole("button", { name: "Copia" }));
    expect(Clipboard.setStringAsync).toHaveBeenCalledTimes(1);
    const summary = (Clipboard.setStringAsync as jest.Mock).mock.calls[0][0] as string;
    expect(summary).toMatch(/mal di gola/i);
    expect(await screen.findByText("Riepilogo copiato: puoi incollarlo in un messaggio o in una email.")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Condividi" }));
    expect(Share.share).toHaveBeenCalledWith({ title: "Riepilogo per il medico", message: summary });

    await user.press(screen.getByRole("button", { name: "PDF" }));
    expect(pdf).toHaveBeenCalledWith(summary);
    expect(await screen.findByText("PDF pronto.")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Leggi il riepilogo" }));
    expect(screen.getByText(summary)).toBeOnTheScreen();

    // Mal di gola e febbre trovano sempre qualche scheda compatibile
    await user.press(screen.getAllByRole("button", { name: "Scopri di più" })[0]!);
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: "/sintomi/condizione/[id]", params: { id: expect.any(String) } });
    await user.press(screen.getAllByRole("button", { name: /^Trova uno specialista: / })[0]!);
    expect(mockRouter.navigate).toHaveBeenCalledWith({ pathname: "/medici", params: { specialista: expect.any(String), condizione: expect.any(String) } });
    // Il riepilogo è pronto per l'email al medico, solo in memoria
    expect(readSummaryForDoctors()).toBe(summary);

    await user.press(screen.getByRole("button", { name: "Nuova intervista" }));
    expect(await screen.findByRole("heading", { name: "Cosa senti?" })).toBeOnTheScreen();
    expect(screen.getByLabelText("Descrivi i tuoi disturbi")).toHaveDisplayValue("");
    expect(readSummaryForDoctors()).toBeNull();
  });

  it("chiede conferma prima di lasciare l'intervista a metà, mai sull'Emergenza", async () => {
    const user = setup();
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    await renderWithTheme(<Interview conditions={CONDITIONS} />);
    expect(preventRemove).toHaveBeenLastCalledWith(false, expect.any(Function));
    await user.press(screen.getByRole("checkbox", { name: /Ho capito che Orienta/ }));
    await user.press(screen.getByRole("checkbox", { name: /Acconsento all'uso dei dati/ }));
    await user.press(screen.getByRole("button", { name: "Continua" }));
    expect(preventRemove).toHaveBeenLastCalledWith(true, expect.any(Function));
    const onLeave = preventRemove.mock.lastCall![1] as (e: { data: { action: unknown } }) => void;
    await act(async () => onLeave({ data: { action: { type: "GO_BACK" } } }));
    expect(alert).toHaveBeenCalledWith("Uscire dall'intervista?", "Le risposte date finora si perdono.", expect.any(Array));
  });
});

describe("segnali d'allarme", () => {
  it("dal testo: avviso immediato, schermata Emergenza con il 112 per primo e ritorno alla descrizione", async () => {
    const user = setup();
    await start(user);
    await describe_(user, "Mi manca il respiro");
    expect(screen.getByText("Quello che descrivi può essere un'emergenza.")).toBeOnTheScreen();
    await user.press(screen.getAllByRole("button", { name: "Chiama il 112" })[0]!);
    expect(Linking.openURL).toHaveBeenCalledWith("tel:112");

    await user.press(screen.getByRole("button", { name: "Cosa fare" }));
    expect(await screen.findByRole("heading", { name: "Difficoltà a respirare" })).toBeOnTheScreen();
    expect(screen.getAllByRole("button")[0]).toHaveAccessibleName("Chiama il 112");
    expect(preventRemove).toHaveBeenLastCalledWith(false, expect.any(Function));

    await user.press(screen.getByRole("button", { name: "Ho sbagliato a rispondere: torna indietro" }));
    expect(await screen.findByRole("heading", { name: "Cosa senti?" })).toBeOnTheScreen();
  });

  it("dall'elenco della prima domanda: si va subito all'Emergenza", async () => {
    const user = setup();
    await start(user);
    await describe_(user, "Ho mal di testa");
    await user.press(screen.getByRole("button", { name: "Continua con le domande" }));
    await screen.findByRole("heading", { name: CORE_QUESTIONS[0]!.text });
    await user.press(screen.getByRole("checkbox", { name: /Dolore al petto che opprime o stringe/ }));
    await user.press(screen.getByRole("button", { name: "Ho almeno uno di questi segnali" }));
    await wait(400);
    expect(await screen.findByRole("heading", { name: "Dolore al petto: può essere un problema al cuore" })).toBeOnTheScreen();
  });
});

describe("intervista con l'AI", () => {
  const results = (id: string): TriageResponse => ({
    kind: "results",
    source: "ai",
    urgency: "gp",
    unidentified: false,
    conditions: [{ id, compatibility: "alta", matchingSymptoms: ["mal-di-gola"] }],
  });
  const throat = CONDITIONS.find((c) => c.keySymptoms.includes("mal-di-gola"))!;

  it("le domande fisse restano sul telefono: i dati partono solo dopo, con il consenso", async () => {
    const user = setup();
    api.aiAvailable.mockResolvedValue(true);
    api.postStep.mockResolvedValue(results(throat.id));
    await start(user, { ai: true });
    await describe_(user, "Ho mal di gola");
    await user.press(screen.getByRole("button", { name: "Continua con le domande" }));

    // Segnali d'allarme, durata e intensità: nessuna richiesta finché non sono finite
    await screen.findByRole("heading", { name: CORE_QUESTIONS[0]!.text });
    await user.press(screen.getByRole("button", { name: "Nessuno di questi" }));
    await wait(400);
    expect(api.postStep).not.toHaveBeenCalled();
    await user.press(await screen.findByRole("button", { name: "Da 1 a 3 giorni" }));
    await wait(600);
    expect(api.postStep).not.toHaveBeenCalled();
    await user.press(await screen.findByRole("radio", { name: "3: lieve" }));
    await user.press(screen.getByRole("button", { name: "Conferma" }));
    await wait(400);

    expect(api.postStep).toHaveBeenCalledTimes(1);
    const req = api.postStep.mock.calls[0][0];
    expect(req).toMatchObject({ profile: { age: 34, sex: "maschio" }, text: "Ho mal di gola", symptoms: ["mal-di-gola"] });
    expect(req.answers).toHaveLength(3);
    expect(await screen.findByText(DISCLAIMER)).toBeOnTheScreen();
    expect(screen.getByRole("heading", { name: `1. ${throat.name}` })).toBeOnTheScreen();
    expect(screen.getByText(/preparati con l'intelligenza artificiale/)).toBeOnTheScreen();
  });

  it("se il servizio non risponde si può continuare con le regole fisse", async () => {
    const user = setup();
    api.aiAvailable.mockResolvedValue(true);
    api.postStep.mockRejectedValue(new TriageRequestError("Il servizio non risponde. Riprova tra poco."));
    await start(user, { ai: true });
    await describe_(user, "Ho mal di gola");
    await user.press(screen.getByRole("button", { name: "Continua con le domande" }));
    await screen.findByRole("heading", { name: CORE_QUESTIONS[0]!.text });
    await user.press(screen.getByRole("button", { name: "Nessuno di questi" }));
    await wait(400);
    await user.press(await screen.findByRole("button", { name: "Non so" }));
    await wait(400);
    await user.press(await screen.findByRole("button", { name: "Non so" }));
    await wait(400);

    expect(await screen.findByRole("heading", { name: "Non siamo riusciti a continuare" })).toBeOnTheScreen();
    expect(screen.getByText("Il servizio non risponde. Riprova tra poco.")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Continua con il metodo semplificato" }));
    await answerAll(user);
    expect(screen.getByText(/usando regole fisse/)).toBeOnTheScreen();
    expect(api.postStep).toHaveBeenCalledTimes(1);
  });
});
