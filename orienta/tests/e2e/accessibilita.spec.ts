import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { completeCystitisInterview } from "./helpers";

/*
 * Controllo automatico di accessibilità (axe-core) sulle pagine principali, in tema chiaro e
 * scuro: WCAG 2.0, 2.1 e 2.2 livello A e AA, compreso il contrasto dei colori. Non sostituisce
 * la prova con un lettore di schermo, ma ferma le regressioni più comuni.
 */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const PAGES = [
  "/",
  "/sintomi/intervista",
  "/emergenza",
  "/condizioni",
  "/condizioni/cistite",
  "/medici",
  "/mercato",
  "/mercato/033007042",
  "/mercato/confronto",
  "/profilo",
  "/profilo/privacy",
  "/profilo/avvertenze",
  "/profilo/fonti",
  "/offline",
];

async function violations(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return result.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 4).join(" | ")}`);
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`Accessibilità, tema ${colorScheme === "light" ? "chiaro" : "scuro"}`, () => {
    test.use({ colorScheme });

    for (const path of PAGES) {
      test(path, async ({ page }) => {
        await page.route("https://tile.openstreetmap.org/**", (route) => route.abort());
        await page.goto(path, { waitUntil: "networkidle" });
        expect(await violations(page)).toEqual([]);
      });
    }

    test("risultati dell'intervista", async ({ page }) => {
      await completeCystitisInterview(page);
      expect(await violations(page)).toEqual([]);
    });
  });
}
