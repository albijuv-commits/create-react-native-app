import { expect, test, type Page } from "@playwright/test";
import { completeCystitisInterview } from "./helpers";

/** Una sessione già salvata nello storico (stesso formato che usa l'app) */
async function seedHistory(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open("orienta", 1);
        open.onupgradeneeded = () => open.result.createObjectStore("sessioni", { keyPath: "id" });
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const tx = open.result.transaction("sessioni", "readwrite");
          tx.objectStore("sessioni").put({
            id: "sessione-di-prova",
            createdAt: "2026-10-01T08:00:00.000Z",
            source: "regole",
            urgency: "gp",
            unidentified: false,
            conditions: [{ id: "cistite", name: "Cistite", compatibility: "alta" }],
            symptoms: ["bruciore-urinare"],
            age: 27,
            summary: "Riepilogo per il medico\nSintomi: bruciore quando urini.",
          });
          tx.oncomplete = () => {
            open.result.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
}

test.describe("Profilo", () => {
  test("tema e dimensione del testo restano dopo il ricaricamento", async ({ page }) => {
    await page.goto("/profilo", { waitUntil: "networkidle" });
    const html = page.locator("html");
    await page.getByRole("group", { name: "Tema" }).getByText("Scuro", { exact: true }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.getByRole("group", { name: "Dimensione del testo" }).getByText("Molto grande", { exact: true }).click();
    await expect(html).toHaveAttribute("data-text-size", "xlarge");

    await page.reload({ waitUntil: "networkidle" });
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(html).toHaveAttribute("data-text-size", "xlarge");
    await expect(page.getByRole("radio", { name: "Scuro" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "Molto grande" })).toBeChecked();
  });

  test("la città predefinita diventa una ricerca rapida tra i Medici", async ({ page }) => {
    await page.route("https://tile.openstreetmap.org/**", (route) => route.abort());
    await page.route("**/api/luoghi", (route) => route.fulfill({ json: { place: { label: "Bologna, Emilia-Romagna", lat: 44.4938, lon: 11.3387 } } }));
    await page.goto("/profilo", { waitUntil: "networkidle" });
    await page.getByLabel("Città predefinita").fill("  Bologna ");
    await page.getByRole("button", { name: "Salva", exact: true }).click();
    await expect(page.getByText("Città salvata.")).toBeVisible();
    await expect(page.getByLabel("Città predefinita")).toHaveValue("Bologna");

    await page.goto("/medici", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Cerca a Bologna" }).click();
    await expect(page.getByText(/6 risultati entro 10 km da Bologna, Emilia-Romagna/)).toBeVisible();
  });

  test("salvi i risultati nello storico, li ritrovi nel profilo e li elimini", async ({ page }) => {
    await completeCystitisInterview(page);
    await page.getByRole("button", { name: "Salva nello storico" }).click();
    await expect(page.getByText("Salvata solo su questo dispositivo.", { exact: false })).toBeVisible();
    await page.getByRole("region", { name: "Storico delle sessioni" }).getByRole("link", { name: "Profilo" }).click();

    await expect(page).toHaveURL(/\/profilo#storico$/);
    const storico = page.locator("#storico");
    await expect(storico.getByText("1 sessione salvata su questo dispositivo.")).toBeVisible();
    await expect(storico.getByText("Senti il medico di base o la guardia medica (116117 dove attivo)", { exact: true })).toBeVisible();
    await expect(storico.getByRole("link", { name: "Cistite" })).toHaveAttribute("href", "/condizioni/cistite");
    await storico.locator("summary", { hasText: "Riepilogo per il medico" }).click();
    await expect(storico.locator("pre")).toContainText("Cistite");

    await storico.getByRole("button", { name: "Elimina", exact: true }).click();
    await storico.getByRole("button", { name: "Sì, elimina" }).click();
    await expect(storico.getByText(/Non hai sessioni salvate/)).toBeVisible();
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("#storico").getByText(/Non hai sessioni salvate/)).toBeVisible();
  });

  test("«Elimina tutti i miei dati» toglie storico, preferiti e preferenze", async ({ page }) => {
    await page.goto("/mercato?q=torvast", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Aggiungi ai preferiti: Torvast", exact: true }).click();
    await expect(page.getByRole("tab", { name: "Preferiti (1)" })).toBeVisible();

    await page.goto("/profilo", { waitUntil: "networkidle" });
    await seedHistory(page);
    await page.getByRole("group", { name: "Tema" }).getByText("Scuro", { exact: true }).click();
    await page.getByLabel("Città predefinita").fill("Bologna");
    await page.getByRole("button", { name: "Salva", exact: true }).click();
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByText("1 sessione salvata su questo dispositivo.")).toBeVisible();

    await page.getByRole("button", { name: "Elimina tutti i miei dati" }).click();
    const dialog = page.getByRole("dialog", { name: "Eliminare tutti i tuoi dati?" });
    await expect(dialog).toBeVisible();
    // Annulla ha il focus: un Invio di troppo non cancella niente
    await expect(dialog.getByRole("button", { name: "Annulla" })).toBeFocused();
    await dialog.getByRole("button", { name: "Sì, elimina tutto" }).click();

    const done = page.getByRole("status").filter({ hasText: "Fatto: su questo dispositivo non resta nessun dato di Orienta." });
    await expect(done).toBeVisible();
    await expect(done).toBeFocused();
    await expect(page.getByText(/Non hai sessioni salvate/)).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.getByLabel("Città predefinita")).toHaveValue("");
    expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("orienta:")))).toEqual([]);

    await page.goto("/mercato", { waitUntil: "networkidle" });
    await expect(page.getByRole("tab", { name: "Preferiti", exact: true })).toBeVisible();
  });

  test("dal profilo si aprono Informativa privacy, Avvertenze mediche e Fonti", async ({ page }) => {
    await page.goto("/profilo", { waitUntil: "networkidle" });
    const info = page.getByRole("navigation", { name: "Informazioni" });
    for (const title of ["Informativa privacy", "Avvertenze mediche", "Fonti"]) {
      await info.getByRole("link", { name: new RegExp(`^${title}`) }).click();
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await page.goBack({ waitUntil: "networkidle" });
    }
    await page.goto("/profilo/avvertenze", { waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: /112/ }).first()).toHaveAttribute("href", "tel:112");
    await expect(page.getByText(/Regolamento \(UE\) 2017\/745/).first()).toBeVisible();
  });
});
