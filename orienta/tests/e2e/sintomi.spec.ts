import { expect, test } from "@playwright/test";
import { completeCystitisInterview, startInterview } from "./helpers";

test.describe("Sintomi", () => {
  test("intervista completa con il motore a regole fino ai risultati", async ({ page }) => {
    // Senza chiave sul server non c'è la casella per l'AI: si resta sul dispositivo
    await completeCystitisInterview(page);
    await expect(page.getByText("Questa non è una diagnosi. Solo un medico può valutare i tuoi sintomi.")).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: /Cistite/ })).toBeVisible();
    await expect(page.getByText(/Senti il medico di base/).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Scopri di più" }).first()).toHaveAttribute("href", "/condizioni/cistite");
    await expect(page.getByRole("link", { name: /Trova uno specialista/ }).first()).toHaveAttribute("href", /specialista=urologo&condizione=cistite/);
    await expect(page.getByRole("heading", { name: "Riepilogo per il medico" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Copia/ })).toBeVisible();
  });

  test("un segnale d'allarme scritto porta alla schermata di emergenza", async ({ page }) => {
    await startInterview(page, "58", "Maschio");
    await page.getByLabel("Descrivi i tuoi disturbi").fill("Ho un dolore al petto che mi opprime e scende nel braccio");
    await expect(page.getByRole("alert").filter({ hasText: "può essere un'emergenza" })).toBeVisible();
    await page.getByRole("button", { name: "Continua con le domande" }).click();
    await expect(page.getByRole("heading", { level: 1, name: /Dolore al petto/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Chiama il 112" })).toHaveAttribute("href", "tel:112");
  });

  test("pensieri di farsi del male: 112, Telefono Amico e Telefono Azzurro, e si può tornare indietro", async ({ page }) => {
    await startInterview(page, "16", "Altro");
    await page.getByLabel("Descrivi i tuoi disturbi").fill("Non dormo e sono sempre triste");
    await page.getByRole("button", { name: "Continua con le domande" }).click();
    await page.getByLabel("Pensieri di farti del male o di toglierti la vita").check();
    await page.getByRole("button", { name: "Ho almeno uno di questi segnali" }).click();

    await expect(page.getByRole("heading", { level: 1, name: "Non sei solo: chiedi aiuto adesso" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Chiama il 112" })).toHaveAttribute("href", "tel:112");
    await expect(page.getByRole("link", { name: "Chiama 02 2327 2327" })).toHaveAttribute("href", "tel:+390223272327");
    await expect(page.getByRole("link", { name: "Chiama 19696" })).toHaveAttribute("href", "tel:19696");

    await page.getByRole("button", { name: /Ho sbagliato a rispondere/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: /hai uno di questi segnali/ })).toBeVisible();
  });

  test("sotto i 14 anni serve il consenso di un genitore o di un tutore", async ({ page }) => {
    await page.goto("/sintomi/intervista", { waitUntil: "networkidle" });
    await page.getByLabel(/Ho capito che Orienta/).check();
    await page.getByLabel(/Acconsento all'uso dei dati/).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByLabel("Quanti anni hai?").fill("9");
    await page.getByText("Maschio", { exact: true }).click();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByText("Serve il consenso di un genitore o di un tutore.")).toBeVisible();
    await page.getByLabel(/Sono un genitore o un tutore/).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Cosa senti?" })).toBeVisible();
  });

  test("senza il consenso obbligatorio non si parte", async ({ page }) => {
    await page.goto("/sintomi/intervista", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByText("Per continuare spunta le prime due caselle.")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Prima di iniziare" })).toBeVisible();
  });
});
