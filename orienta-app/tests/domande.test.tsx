import { act, screen, userEvent } from "@testing-library/react-native";
import { DURATION_QUESTION, INTENSITY_QUESTION, RED_FLAG_QUESTION, symptomQuestion } from "@/lib/triage/questions";
import type { Answer, Question } from "@/lib/triage/schema";
import { QuestionDeck } from "~/components/triage/question-deck";
import { renderWithTheme } from "./render";

async function wait(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

function deck(question: Question, { previous = null, reduced = false, onAnswer = jest.fn(), onBack = jest.fn() }: { previous?: Answer | null; reduced?: boolean; onAnswer?: jest.Mock; onBack?: jest.Mock } = {}) {
  return <QuestionDeck question={question} number={2} total={6} previous={previous} onAnswer={onAnswer} onBack={onBack} reduced={reduced} />;
}

beforeEach(() => jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate", "queueMicrotask"] }));
afterEach(() => jest.useRealTimers());

const setup = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

describe("mazzo delle domande", () => {
  it("sì/no: la carta vola via e poi arriva la risposta, una sola anche con il doppio tocco", async () => {
    const user = setup();
    const onAnswer = jest.fn();
    const question = symptomQuestion("mal-di-gola");
    await renderWithTheme(deck(question, { onAnswer }));
    expect(screen.getByRole("heading", { name: question.text })).toBeOnTheScreen();
    // Il suggerimento è solo per chi vede la carta: con VoiceOver e TalkBack si usano i pulsanti
    expect(screen.getByText("Trascina a destra per Sì, a sinistra per No.", { includeHiddenElements: true })).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Sì" }));
    // La carta che vola via non risponde più, nemmeno a un secondo tocco
    await user.press(screen.getByRole("button", { name: "Sì", includeHiddenElements: true }));
    await wait(400);
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith({ kind: "yesno", question, value: "si" });
  });

  it("con «Riduci movimento» la risposta è immediata e non si parla di trascinare", async () => {
    const user = setup();
    const onAnswer = jest.fn();
    const question = symptomQuestion("febbre");
    await renderWithTheme(deck(question, { onAnswer, reduced: true }));
    expect(screen.queryByText("Trascina a destra per Sì, a sinistra per No.", { includeHiddenElements: true })).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Non so" }));
    expect(onAnswer).toHaveBeenCalledWith({ kind: "yesno", question, value: "non-so" });
  });

  it("scala: senza un numero chiede di sceglierlo; poi conferma il valore", async () => {
    const user = setup();
    const onAnswer = jest.fn();
    await renderWithTheme(deck(INTENSITY_QUESTION, { onAnswer }));
    // Il quadrante è un disegno: per VoiceOver e TalkBack valgono i numeri con la loro parola
    expect(screen.getByText("Tocca un numero", { includeHiddenElements: true })).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Conferma" }));
    expect(screen.getByText("Scegli un numero, oppure tocca «Non so».")).toBeOnTheScreen();
    expect(onAnswer).not.toHaveBeenCalled();

    await user.press(screen.getByRole("radio", { name: "7: forte" }));
    expect(screen.getByRole("radio", { name: "7: forte" })).toBeChecked();
    expect(screen.getByText("Forte", { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.queryByText("Scegli un numero, oppure tocca «Non so».")).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Conferma" }));
    await wait(400);
    expect(onAnswer).toHaveBeenCalledWith({ kind: "scale", question: INTENSITY_QUESTION, value: 7 });
  });

  it("tornando indietro mostra la risposta di prima", async () => {
    await renderWithTheme(deck(INTENSITY_QUESTION, { previous: { kind: "scale", question: INTENSITY_QUESTION, value: 4 } }));
    expect(screen.getByText("Prima avevi risposto: 4 su 10")).toBeOnTheScreen();
    expect(screen.getByRole("radio", { name: "4: moderato" })).toBeChecked();
  });

  it("scelta: «Non so» è sempre tra le risposte e la risposta di prima resta evidenziata", async () => {
    const user = setup();
    const onAnswer = jest.fn();
    await renderWithTheme(deck(DURATION_QUESTION, { onAnswer, previous: { kind: "choice", question: DURATION_QUESTION, value: "1-3-giorni" } }));
    expect(screen.getByText("Prima avevi risposto: da 1 a 3 giorni")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Da 1 a 3 giorni" })).toBeSelected();
    await user.press(screen.getByRole("button", { name: "Più di una settimana" }));
    await wait(500);
    expect(onAnswer).toHaveBeenCalledWith({ kind: "choice", question: DURATION_QUESTION, value: "piu-di-una-settimana" });
  });

  it("segnali d'allarme: il pulsante dice cosa succede e manda solo quelli spuntati", async () => {
    const user = setup();
    const onAnswer = jest.fn();
    await renderWithTheme(deck(RED_FLAG_QUESTION, { onAnswer }));
    expect(screen.getByRole("button", { name: "Nessuno di questi" })).toBeOnTheScreen();
    await user.press(screen.getByRole("checkbox", { name: /Fatica a respirare anche a riposo/ }));
    expect(screen.getByRole("checkbox", { name: /Fatica a respirare anche a riposo/ })).toBeChecked();
    await user.press(screen.getByRole("button", { name: "Ho almeno uno di questi segnali" }));
    await wait(400);
    expect(onAnswer).toHaveBeenCalledWith({ kind: "redflags", question: RED_FLAG_QUESTION, value: ["respiro"] });
  });

  it("il pulsante indietro della prima domanda torna alla descrizione", async () => {
    const user = setup();
    const onBack = jest.fn();
    await renderWithTheme(<QuestionDeck question={RED_FLAG_QUESTION} number={1} total={5} previous={null} onAnswer={jest.fn()} onBack={onBack} reduced={false} />);
    expect(screen.getByRole("progressbar", { name: "Domande completate" })).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Torna alla descrizione" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
