import { expect, test, type Page } from "@playwright/test";
import { completeCystitisInterview } from "./helpers";

/*
 * Il server dei test gira con DOCTORS_PROVIDER=esempio (vedi playwright.config.ts): nessuna chiamata
 * a Google o a Overpass. La città si simula nel browser e le tile di OpenStreetMap non si scaricano.
 */
const MILANO = { latitude: 45.4642, longitude: 9.19 };

async function blockTiles(page: Page) {
  await page.route("https://tile.openstreetmap.org/**", (route) => route.abort());
}

test.describe("Medici", () => {
  test.use({ geolocation: MILANO, permissions: ["geolocation"] });

  test("dai risultati allo specialista, con il riepilogo dei sintomi nell'email", async ({ page }) => {
    await blockTiles(page);
    await completeCystitisInterview(page);
    await page.getByRole("link", { name: /Trova uno specialista/ }).first().click();

    await expect(page).toHaveURL(/\/medici\?specialista=urologo&condizione=cistite/);
    await expect(page.getByText("Specialista di riferimento per «Cistite»:")).toBeVisible();
    await expect(page.getByRole("radio", { name: /^Urologo/ })).toBeChecked();
    await expect(page.getByText("Primo passo: il medico di base")).toBeVisible();
    await expect(page.getByText("Il riepilogo dei tuoi sintomi è pronto")).toBeVisible();

    await page.getByRole("button", { name: "Usa la mia posizione" }).click();
    await expect(page.getByText(/6 risultati entro 10 km da te/)).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "DATI DI ESEMPIO" })).toBeVisible();
    // I dati di esempio non hanno numeri di telefono: niente «Chiama»
    await expect(page.getByRole("link", { name: "Chiama" })).toHaveCount(0);

    await page.getByRole("button", { name: "Email" }).first().click();
    const dialog = page.getByRole("dialog", { name: /Email a Studio medico di esempio 1/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel(/Aggiungi il riepilogo dei sintomi/)).toBeChecked();
    const mail = dialog.getByRole("link", { name: /Apri l'app di posta/ });
    await expect(mail).toHaveAttribute("href", /^mailto:esempio1@example\.com\?subject=Richiesta%20di%20appuntamento%2C%20con%20riepilogo%20dei%20sintomi&body=/);
    expect(decodeURIComponent((await mail.getAttribute("href")) ?? "")).toContain("Riepilogo per il medico");

    await dialog.getByLabel(/Aggiungi il riepilogo dei sintomi/).uncheck();
    await expect(mail).toHaveAttribute("href", /subject=Richiesta%20di%20appuntamento&body=/);
    expect(decodeURIComponent((await mail.getAttribute("href")) ?? "")).not.toContain("Riepilogo per il medico");
    await dialog.getByRole("button", { name: "Chiudi" }).click();
    await expect(dialog).toBeHidden();
  });

  test("cerca per città, cambia distanza e passa alla mappa", async ({ page }) => {
    await blockTiles(page);
    await page.route("**/api/luoghi", (route) => route.fulfill({ json: { place: { label: "Bologna, Emilia-Romagna", lat: 44.4938, lon: 11.3387 } } }));
    await page.goto("/medici", { waitUntil: "networkidle" });
    await expect(page.getByRole("radio", { name: /^Medico di base/ })).toBeChecked();
    await expect(page.getByText("Primo passo: il medico di base")).toHaveCount(0);

    await page.getByLabel("Città o CAP").fill("Bologna");
    await page.getByRole("button", { name: "Cerca", exact: true }).click();
    await expect(page.getByText("Bologna, Emilia-Romagna", { exact: true })).toBeVisible();
    await expect(page.getByText(/6 risultati entro 10 km da Bologna, Emilia-Romagna/)).toBeVisible();

    await page.getByText("2 km", { exact: true }).click();
    await expect(page.getByText(/2 risultati entro 2 km/)).toBeVisible();
    await expect(page).toHaveURL(/raggio=2/);

    await page.getByText("Mappa", { exact: true }).click();
    await expect(page).toHaveURL(/vista=mappa/);
    const pins = page.locator(".orienta-pin");
    await expect(pins).toHaveCount(2);
    await expect(page.getByRole("link", { name: "OpenStreetMap" }).first()).toHaveAttribute("href", "https://www.openstreetmap.org/copyright");
    await pins.first().click();
    await expect(page.getByRole("heading", { level: 3, name: /Studio medico di esempio 1/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Indicazioni/ })).toHaveAttribute("href", /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=44\./);
  });

  test("pronto soccorso: prima di tutto il 112", async ({ page }) => {
    await page.goto("/medici?specialista=pronto-soccorso", { waitUntil: "networkidle" });
    await expect(page.getByText("In un'emergenza non cercare: chiama subito il 112.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Chiama il 112" }).last()).toHaveAttribute("href", "tel:112");
  });
});

test.describe("Medici senza permesso di posizione", () => {
  test("spiega cosa fare se la posizione è negata o la città non si trova", async ({ page }) => {
    // Il browser automatico lascerebbe la richiesta in sospeso: si simula il «no» della persona
    await page.addInitScript(() => {
      navigator.geolocation.getCurrentPosition = (_ok, fail) =>
        fail?.({ code: 1, message: "negato", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
    });
    await page.route("**/api/luoghi", (route) => route.fulfill({ json: { place: null } }));
    await page.goto("/medici", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Usa la mia posizione" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Non hai dato il permesso di usare la posizione" })).toBeVisible();
    await page.getByLabel("Città o CAP").fill("Paese Inesistente");
    await page.getByRole("button", { name: "Cerca", exact: true }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Non troviamo «Paese Inesistente»" })).toBeVisible();
  });
});
