import { expect, type Page } from "@playwright/test";

/** Consenso e dati di base fino alla descrizione */
export async function startInterview(page: Page, age = "27", sex = "Femmina") {
  await page.goto("/sintomi/intervista", { waitUntil: "networkidle" });
  await page.getByLabel(/Ho capito che Orienta/).check();
  await page.getByLabel(/Acconsento all'uso dei dati/).check();
  await page.getByRole("button", { name: "Continua" }).click();
  await page.getByLabel("Quanti anni hai?").fill(age);
  await page.getByText(sex, { exact: true }).click();
  if (sex === "Femmina" || sex === "Altro") await page.getByText("No", { exact: true }).click();
  await page.getByRole("button", { name: "Continua" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Cosa senti?" })).toBeVisible();
}

/** Un'intervista completa con il motore a regole che porta alla cistite */
export async function completeCystitisInterview(page: Page) {
  await startInterview(page);
  await page.getByLabel("Descrivi i tuoi disturbi").fill("Mi brucia quando faccio pipì e devo andare spesso in bagno");
  await expect(page.getByRole("button", { name: /Bruciore quando urini/ })).toBeVisible();
  await page.getByRole("button", { name: "Continua con le domande" }).click();

  await expect(page.getByRole("heading", { level: 1, name: /hai uno di questi segnali/ })).toBeVisible();
  await page.getByRole("button", { name: "Nessuno di questi" }).click();
  await page.getByRole("button", { name: "Da 1 a 3 giorni" }).click();
  // Si tocca il numero visibile, come farebbe una persona
  await page.locator("label").filter({ has: page.getByRole("radio", { name: /^3\b/ }) }).click();
  await expect(page.getByRole("radio", { name: /^3\b/ })).toBeChecked();
  await page.getByRole("button", { name: "Conferma" }).click();

  // Domande sì/no finché arrivano i risultati (prima c'è una breve attesa senza pulsanti)
  const results = page.getByRole("heading", { level: 1, name: "Cosa potrebbe essere" });
  const no = page.getByRole("button", { name: "No", exact: true });
  for (let i = 0; i < 12; i++) {
    await expect(results.or(no).first()).toBeVisible();
    if (await results.isVisible()) break;
    const title = (await page.getByRole("heading", { level: 1 }).first().textContent()) ?? "";
    const yes = /urine torbide|basso ventre/i.test(title);
    await page.getByRole("button", { name: yes ? "Sì" : "No", exact: true }).click();
    await page.waitForTimeout(450);
  }
  await expect(results).toBeVisible();
}
