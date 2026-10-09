import { render, screen, userEvent } from "@testing-library/react-native";
import { AccessibilityInfo } from "react-native";
import { CONDITIONS } from "@data/conditions";
import { SCENE_IDS, SCENE_STEPS } from "@/lib/slides/catalog";
import { stillFrame, transformMatrix } from "~/components/slide/motion";
import { SCENES } from "~/components/slide/registry";
import { SlideSvg } from "~/components/slide/slide-svg";
import { SlideViewer } from "~/components/slide/slide-viewer";
import { renderWithTheme } from "./render";

const influenza = CONDITIONS.find((c) => c.id === "influenza")!;

describe("matrici del vetrino", () => {
  it("scala e rotazione girano intorno al centro indicato, come transform-origin", () => {
    // Scala 2 intorno a (10, 10): il centro resta fermo
    // (+ 0 trasforma -0 in 0)
    expect(transformMatrix(0, 0, 2, 2, 0, 10, 10).map((v) => v + 0)).toEqual([2, 0, 0, 2, -10, -10]);
    // Rotazione di 90° intorno a (5, 0): il punto (5, 0) non si muove
    const m = transformMatrix(0, 0, 1, 1, 90, 5, 0);
    const x = m[0]! * 5 + m[2]! * 0 + m[4]!;
    const y = m[1]! * 5 + m[3]! * 0 + m[5]!;
    expect(x).toBeCloseTo(5);
    expect(y).toBeCloseTo(0);
  });

  it("una scena ferma disegna subito i valori finali di animate", () => {
    expect(stillFrame({ opacity: 0.5, fill: "#ff0000" }, undefined, 100)).toEqual({ opacity: 0.5, fill: "#ff0000" });
    expect(stillFrame({ x: 10, y: 20 }, undefined, 100)).toEqual({ transform: "matrix(1 0 0 1 10 20)" });
    expect(stillFrame({ pathLength: 0.25, pathOffset: 0.5 }, undefined, 200)).toEqual({ strokeDasharray: [50, 200], strokeDashoffset: -100 });
  });
});

describe("scene del vetrino", () => {
  it("ogni scena del catalogo ha il suo disegno", () => {
    for (const id of SCENE_IDS) expect(SCENES[id]).toBeDefined();
  });

  // Ogni scheda, a ogni passo: sia ferma (anteprime) sia animata (scheda)
  for (const condition of CONDITIONS) {
    it(`${condition.id}: la scena si disegna a ogni passo`, async () => {
      for (let step = 0; step < SCENE_STEPS; step++) {
        const still = await render(<SlideSvg spec={condition.animation} step={step} playing={false} reduced={false} still />);
        expect(still.toJSON()).toBeTruthy();
        await still.unmount();
      }
      const view = await render(<SlideSvg spec={condition.animation} step={0} playing reduced={false} label="Vetrino" />);
      for (let step = 1; step < SCENE_STEPS; step++) {
        await view.rerender(<SlideSvg spec={condition.animation} step={step} playing reduced={false} label="Vetrino" />);
      }
      expect(screen.getByLabelText("Vetrino")).toBeOnTheScreen();
      await view.unmount();
    });
  }
});

describe("visore del vetrino", () => {
  afterEach(() => jest.restoreAllMocks());

  it("Avanti e Indietro cambiano passo e didascalia", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<SlideViewer spec={influenza.animation} subject={influenza.name} />);
    expect(screen.getByText(influenza.animation.captions[0], { exact: false })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Indietro" })).toBeDisabled();
    await user.press(screen.getByRole("button", { name: "Avanti" }));
    expect(screen.getByText(influenza.animation.captions[1], { exact: false })).toBeOnTheScreen();
    expect(screen.getByLabelText(/Passo 2 di 4/)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Vai al passo 4" }));
    expect(screen.getByText(influenza.animation.captions[3], { exact: false })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Avanti" })).toBeDisabled();
  });

  it("non parte da solo: si avvia con un tocco e si mette in pausa", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<SlideViewer spec={influenza.animation} subject={influenza.name} />);
    expect(screen.queryByRole("button", { name: "Pausa" })).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: /Avvia l'animazione/ }));
    expect(screen.getByRole("button", { name: "Pausa" })).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: /Avvia l'animazione/ })).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Pausa" }));
    expect(screen.getByRole("button", { name: "Riproduci" })).toBeOnTheScreen();
  });

  it("con «riduci movimento» mostra tutte le didascalie e nessun pulsante di riproduzione", async () => {
    jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(true);
    await renderWithTheme(<SlideViewer spec={influenza.animation} subject={influenza.name} />);
    expect(await screen.findByLabelText("Passi dell'illustrazione")).toBeOnTheScreen();
    for (const caption of influenza.animation.captions) expect(screen.getByText(caption)).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Riproduci" })).not.toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: /Avvia l'animazione/ })).not.toBeOnTheScreen();
  });
});
