import { expect, test, type Page } from "@playwright/test";

/*
 * Il server dei test gira con MEDICINES_SOURCE=esempio (vedi playwright.config.ts): il catalogo è
 * il campione di esempio, sempre etichettato come tale. Torvast 20 mg (AIC 033007042) ha tre
 * equivalenti nel campione; Augmentin 875/125 (026089019) ha una foto di una confezione belga.
 */
const TORVAST = "033007042";
const AUGMENTIN = "026089019";
/** I prezzi hanno uno spazio non separabile prima di «€» */
const euro = (s: string) => new RegExp(s.replace(" ", "\\s"));

async function openCatalog(page: Page, q = "") {
  await page.goto(`/mercato${q ? `#q=${encodeURIComponent(q)}` : ""}`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1, name: "Mercato" })).toBeVisible();
}

test.describe("Mercato", () => {
  test("catalogo informativo: dati di esempio etichettati, niente linguaggio da negozio", async ({ page }) => {
    await openCatalog(page);
    await expect(page.getByRole("note").filter({ hasText: "DATI DI ESEMPIO" })).toBeVisible();
    await expect(page.getByText("Qui non si compra: è un catalogo informativo.")).toBeVisible();
    await expect(page.getByText(/\d+ confezioni/).first()).toBeVisible();
    const text = (await page.locator("main").innerText()).toLowerCase();
    for (const word of ["offerta", "offerte", "più venduti", "sconto", "promozione", "carrello", "acquista"]) expect(text).not.toContain(word);
  });

  test("ricerca per principio attivo e filtri", async ({ page }) => {
    await openCatalog(page);
    await page.getByLabel("Cerca per nome o principio attivo").fill("atorvastatina");
    await expect(page.getByText("4 confezioni", { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/q=atorvastatina/);

    await page.getByRole("button", { name: /^Filtri/ }).click();
    await page.locator("label").filter({ hasText: "Senza ricetta" }).click();
    await expect(page.getByText("Nessuna confezione trovata.")).toBeVisible();
    await page.getByRole("button", { name: "Azzera filtri" }).click();
    await expect(page.getByText("4 confezioni", { exact: true })).toBeVisible();

    await page.getByLabel("Ordina per").selectOption("prezzo");
    const first = page.getByRole("listitem").filter({ has: page.getByRole("article") }).first();
    await expect(first.getByRole("heading", { level: 3 })).toHaveText(/Atorvastatina (Krka|Sandoz)/);
  });

  test("sotto la card: marchi, aziende e fascia di prezzo da aprire", async ({ page }) => {
    await openCatalog(page, "torvast");
    const card = page.getByRole("article", { name: "Torvast", exact: true });
    const summary = card.getByText("Marchi, aziende e prezzi");
    await expect(card.locator("summary")).toContainText(/4 marchi · da 7,96\s€ a 10,51\s€/);
    await summary.click();
    await expect(card.getByText("Fascia di prezzo")).toBeVisible();
    await expect(card.getByText(/4 marchi di \d+ aziend/)).toBeVisible();
    await expect(card.getByRole("link", { name: "Totalip" })).toBeVisible();
    await expect(card.getByText(/È una statina/)).toBeVisible();
    await expect(card.getByText(/In Europa anche come/)).toBeVisible();
    await summary.click();
    await expect(card.getByText("Fascia di prezzo")).toBeHidden();
  });

  test("scheda: foglietto ufficiale, avviso, principio attivo, equivalenti dal più economico, Europa", async ({ page }) => {
    await page.goto(`/mercato/${TORVAST}`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "Torvast" })).toBeVisible();
    await expect(page.getByText("Chiedi consiglio al medico o al farmacista.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Foglietto illustrativo ufficiale/ })).toHaveAttribute("href", /^https:\/\/api\.aifa\.gov\.it\//);

    const ingredient = page.getByRole("region", { name: /Il principio attivo: atorvastatina/ });
    await expect(ingredient.getByText("C₃₃H₃₅FN₂O₅")).toBeVisible();
    await expect(ingredient.getByRole("link", { name: /RCP Torvast \(AIFA\)/ })).toHaveAttribute("href", /ts=RCP$/);
    await expect(ingredient.getByRole("heading", { name: "Effetti indesiderati" })).toBeVisible();

    const equivalents = page.getByRole("region", { name: "Farmaci equivalenti" }).getByRole("listitem");
    await expect(equivalents).toHaveCount(4);
    await expect(equivalents.first()).toContainText(euro("7,96 €"));
    await expect(equivalents.last()).toContainText(euro("10,51 €"));

    const europe = page.getByRole("region", { name: "In Europa" });
    await europe.getByLabel("Scegli un Paese").selectOption("Germania");
    await expect(europe.getByText(/\d+ marchi? in Germania/)).toBeVisible();
  });

  test("foto con licenza libera: autore, licenza e Paese della confezione", async ({ page }) => {
    await page.goto(`/mercato/${AUGMENTIN}`, { waitUntil: "networkidle" });
    await expect(page.getByRole("article").locator("header img")).toBeVisible();
    await expect(page.getByText(/confezione venduta in Belgio: può essere diversa da quella italiana/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Bree, CC0 1\.0/ })).toHaveAttribute("href", /^https:\/\/commons\.wikimedia\.org\//);
  });

  test("preferiti salvati sul dispositivo", async ({ page }) => {
    await openCatalog(page, "torvast");
    await page.getByRole("button", { name: "Aggiungi ai preferiti: Torvast", exact: true }).click();
    await expect(page.getByRole("tab", { name: "Preferiti (1)" })).toBeVisible();
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("tab", { name: "Preferiti (1)" }).click();
    await expect(page.getByRole("article", { name: "Torvast", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Togli dai preferiti: Torvast", exact: true }).click();
    await expect(page.getByText("Non hai ancora preferiti.")).toBeVisible();
  });

  test("confronto fino a tre farmaci", async ({ page }) => {
    await openCatalog(page, "atorvastatina");
    await expect(page.getByText("4 confezioni", { exact: true })).toBeVisible();
    for (const name of ["Torvast", "Totalip", "Atorvastatina Krka"]) await page.getByRole("button", { name: `Aggiungi al confronto: ${name}`, exact: true }).click();
    await expect(page.getByText("3 su 3 nel confronto")).toBeVisible();
    await expect(page.getByRole("button", { name: "Aggiungi al confronto: Atorvastatina Sandoz Gmbh" })).toBeDisabled();

    await page.getByRole("link", { name: "Confronta" }).click();
    await expect(page).toHaveURL(/\/mercato\/confronto$/);
    const table = page.getByRole("table", { name: "Confronto tra 3 confezioni" });
    await expect(table.getByRole("columnheader")).toHaveCount(3);
    await expect(table.getByText("Il più basso tra questi")).toBeVisible();
    await page.getByRole("button", { name: "Togli Totalip dal confronto" }).click();
    await expect(page.getByRole("table", { name: "Confronto tra 2 confezioni" })).toBeVisible();
  });
});
