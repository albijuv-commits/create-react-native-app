import { screen, userEvent, within } from "@testing-library/react-native";
import { useState } from "react";
import { Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";
import type { BodyAreaId } from "@data/vocab/body";
import { conditionListItems, getCondition } from "@/lib/conditions/knowledge-base";
import { searchConditions } from "@/lib/conditions/search";
import { ConditionArticle } from "~/components/conditions/condition-article";
import { ConditionList } from "~/components/conditions/condition-list";
import { renderWithTheme } from "./render";

jest.mock("expo-router", () => ({ router: { push: jest.fn(), navigate: jest.fn(), setParams: jest.fn() } }));
const mockRouter = jest.requireMock<{ router: Record<"push" | "navigate" | "setParams", jest.Mock> }>("expo-router").router;

const ITEMS = conditionListItems();

/** L'elenco con lo stato di ricerca e filtro, come nella schermata */
function List() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<BodyAreaId | null>(null);
  return <ConditionList items={ITEMS} query={query} area={area} onQuery={setQuery} onArea={setArea} />;
}

describe("elenco delle condizioni", () => {
  beforeEach(() => jest.clearAllMocks());

  it("mostra tutte le schede e le apre con un tocco", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<List />);
    expect(screen.getByText(`${ITEMS.length} condizioni`)).toBeOnTheScreen();
    await user.press(screen.getByRole("link", { name: "Acne" }));
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: "/condizioni/[id]", params: { id: "acne" } });
  });

  it("cerca per sintomo, anche senza accenti", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<List />);
    await user.type(screen.getByLabelText("Cerca per nome o sintomo"), "tosse");
    const expected = searchConditions(ITEMS, "tosse", null);
    expect(expected.length).toBeGreaterThan(0);
    expect(screen.getByText(`${expected.length === 1 ? "1 condizione" : `${expected.length} condizioni`} per «tosse»`)).toBeOnTheScreen();
    expect(screen.getByRole("link", { name: expected[0]!.name })).toBeOnTheScreen();
    expect(screen.queryByRole("link", { name: "Acne" })).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Cancella la ricerca" }));
    expect(screen.getByText(`${ITEMS.length} condizioni`)).toBeOnTheScreen();
  });

  it("filtra per area del corpo", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<List />);
    const pelle = screen.getByRole("button", { name: "Pelle" });
    await user.press(pelle);
    expect(screen.getByRole("button", { name: "Pelle" })).toBeSelected();
    const inSkin = ITEMS.filter((i) => i.areas.includes("pelle"));
    expect(screen.getByText(`${inSkin.length} condizioni in «Pelle»`)).toBeOnTheScreen();
    expect(screen.queryByRole("link", { name: "Emicrania" })).not.toBeOnTheScreen();
  });

  it("senza risultati suggerisce di descrivere cosa senti", async () => {
    const user = userEvent.setup();
    await renderWithTheme(<List />);
    await user.type(screen.getByLabelText("Cerca per nome o sintomo"), "zzzz");
    expect(screen.getByText("Nessuna condizione trovata.")).toBeOnTheScreen();
    await user.press(screen.getByRole("link", { name: "descrivi cosa senti" }));
    expect(mockRouter.navigate).toHaveBeenCalledWith("/");
  });
});

describe("scheda di una condizione", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    jest.spyOn(WebBrowser, "openBrowserAsync").mockResolvedValue({ type: WebBrowser.WebBrowserResultType.OPENED });
  });
  afterEach(() => jest.restoreAllMocks());

  it("ha tutte le sezioni, con «Quando andare dal medico» prima nell'indice", async () => {
    const condition = getCondition("influenza")!;
    await renderWithTheme(<ConditionArticle condition={condition} />);
    expect(screen.getByRole("heading", { name: "Influenza" })).toBeOnTheScreen();
    for (const title of ["Panoramica", "Com'è fatta", "Storia", "Cause e fattori di rischio", "Sintomi", "Cure possibili", "Quando andare dal medico", "Prevenzione", "Specialista di riferimento", "Fonti"]) {
      expect(screen.getByRole("heading", { name: title })).toBeOnTheScreen();
    }
    const index = screen.getByLabelText("In questa scheda");
    expect(within(index).getAllByRole("link")[0]).toHaveAccessibleName("Quando andare dal medico");
    expect(screen.getByText(condition.overview)).toBeOnTheScreen();
    expect(screen.getByText("Farmaci: chiedi sempre al medico o al farmacista")).toBeOnTheScreen();
  });

  it("il 112 apre il telefono, le fonti si aprono nel browser", async () => {
    const user = userEvent.setup();
    const condition = getCondition("influenza")!;
    await renderWithTheme(<ConditionArticle condition={condition} />);
    await user.press(screen.getAllByRole("button", { name: "Chiama il 112" })[0]!);
    expect(Linking.openURL).toHaveBeenCalledWith("tel:112");
    const source = condition.sources[0]!;
    await user.press(screen.getByRole("link", { name: `${source.publisher}${source.lang === "en" ? " (in inglese)" : ""}: ${source.title}` }));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(source.url);
  });

  it("porta alla ricerca dello specialista con specialista e condizione", async () => {
    const user = userEvent.setup();
    const condition = getCondition("acne")!;
    await renderWithTheme(<ConditionArticle condition={condition} />);
    await user.press(screen.getByRole("button", { name: "Trova vicino a me" }));
    expect(mockRouter.navigate).toHaveBeenCalledWith({ pathname: "/medici", params: { specialista: condition.specialist.id, condizione: "acne" } });
  });
});
