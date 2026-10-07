import { expect, test } from "@playwright/test";

test.describe("Condizioni", () => {
  test("cerca una condizione e apre la scheda completa", async ({ page }) => {
    await page.goto("/condizioni", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "Condizioni" })).toBeVisible();
    await expect(page.getByText("40 condizioni")).toBeVisible();

    await page.getByLabel("Cerca per nome o sintomo").fill("febbre da fieno");
    await expect(page.getByText("1 condizione per «febbre da fieno»")).toBeVisible();
    await page.getByRole("link", { name: /Rinite allergica/ }).click();

    await expect(page.getByRole("heading", { level: 1, name: "Rinite allergica" })).toBeVisible();
    await expect(page.getByText("Contenuto non ancora revisionato da un medico.")).toBeVisible();

    // Le undici sezioni, nell'ordine previsto
    const sections = await page.locator("article h2").allInnerTexts();
    expect(sections).toEqual([
      "Panoramica",
      "Com'è fatta",
      "Storia",
      expect.stringMatching(/^(Un caso clinico|Casi clinici)$/),
      "Cause e fattori di rischio",
      "Sintomi",
      "Cure possibili",
      "Quando andare dal medico",
      "Prevenzione",
      "Specialista di riferimento",
      "Fonti",
    ]);

    await expect(page.getByText("Caso inventato a scopo illustrativo").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Trova vicino a me" })).toHaveAttribute(
      "href",
      "/medici?specialista=allergologo&condizione=rinite-allergica",
    );
    await expect(page.getByRole("link", { name: "Chiama il 112" })).toHaveAttribute("href", "tel:112");
  });

  test("filtra per area del corpo e conserva il filtro nell'indirizzo", async ({ page }) => {
    // Si aspetta l'idratazione: prima di allora i pulsanti non rispondono
    await page.goto("/condizioni", { waitUntil: "networkidle" });
    const pelle = page.getByRole("button", { name: "Pelle", exact: true });
    await pelle.click();
    await expect(pelle).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("7 condizioni in «Pelle»")).toBeVisible();
    await expect(page.getByRole("link", { name: /Psoriasi/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Asma/ })).toHaveCount(0);
    await expect(page).toHaveURL(/\?area=pelle$/);

    // Ricaricando, ricerca e filtro restano
    await page.getByLabel("Cerca per nome o sintomo").fill("prurito");
    await expect(page).toHaveURL(/area=pelle/);
    await expect(page).toHaveURL(/q=prurito/);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByLabel("Cerca per nome o sintomo")).toHaveValue("prurito");
    await expect(page.getByRole("button", { name: "Pelle", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("l'animazione si guida con i pulsanti e mostra la didascalia", async ({ page }) => {
    await page.goto("/condizioni/raffreddore", { waitUntil: "networkidle" });
    const viewer = page.locator("#come-e-fatta");
    const caption = viewer.locator("p[aria-live]");
    const dot = (n: number) => viewer.getByRole("button", { name: `Vai al passo ${n}` });
    await expect(caption).toContainText("Un rinovirus");
    await expect(dot(1)).toHaveAttribute("aria-current", "step");

    await viewer.getByRole("button", { name: "Avanti" }).click();
    await expect(dot(2)).toHaveAttribute("aria-current", "step");
    await expect(caption).toContainText("Si aggancia alle cellule");

    await dot(4).click();
    await expect(caption).toContainText("Anticorpi e globuli bianchi");
    await expect(viewer.getByRole("button", { name: "Avanti" })).toBeDisabled();

    await viewer.getByRole("button", { name: "Indietro" }).click();
    await expect(dot(3)).toHaveAttribute("aria-current", "step");
  });

  test("con movimento ridotto mostra tutte le didascalie, senza riproduzione", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/condizioni/emicrania");
    const viewer = page.locator("#come-e-fatta");
    await expect(viewer.getByRole("listitem")).toHaveCount(4);
    await expect(viewer.getByRole("button", { name: /Avvia l'animazione/ })).toHaveCount(0);
    await context.close();
  });
});
