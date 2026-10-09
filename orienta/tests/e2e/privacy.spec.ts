import { expect, test, type Page } from "@playwright/test";
import { completeCystitisInterview } from "./helpers";

/*
 * GDPR art. 9: i sintomi lasciano il dispositivo solo con il consenso esplicito all'AI, e sulle
 * pagine dei sintomi non ci sono strumenti di analisi, servizi di terze parti o cookie.
 */
type Sent = { url: string; method: string; body: string };

function recordRequests(page: Page): Sent[] {
  const sent: Sent[] = [];
  page.on("request", (r) => sent.push({ url: r.url(), method: r.method(), body: r.postData() ?? "" }));
  return sent;
}

/** Il server risponde che l'AI è attiva, così compare la casella del consenso facoltativo */
async function aiAvailable(page: Page, onPost: Parameters<Page["route"]>[1]) {
  await page.route("**/api/triage", (route, request) => (request.method() === "GET" ? route.fulfill({ json: { ai: true } }) : onPost(route, request)));
}

test.describe("Privacy delle pagine dei sintomi", () => {
  test("senza il consenso all'AI i sintomi restano sul dispositivo: niente terze parti, niente cookie", async ({ page, context }) => {
    const sent = recordRequests(page);
    let posts = 0;
    await aiAvailable(page, (route) => {
      posts++;
      return route.abort();
    });

    await page.goto("/", { waitUntil: "networkidle" });
    await page.goto("/emergenza", { waitUntil: "networkidle" });
    await page.goto("/sintomi/intervista", { waitUntil: "networkidle" });
    const ai = page.getByLabel(/voglio domande più mirate con l'intelligenza artificiale/);
    await expect(ai).toBeVisible();
    await expect(ai).not.toBeChecked();
    await completeCystitisInterview(page);

    expect(posts).toBe(0);
    expect(sent.filter((s) => /brucia|pipì/i.test(decodeURIComponent(s.url) + s.body))).toEqual([]);
    const origin = new URL(page.url()).origin;
    const thirdParty = sent.map((s) => new URL(s.url)).filter((u) => u.protocol.startsWith("http") && u.origin !== origin);
    expect(thirdParty.map(String)).toEqual([]);
    expect(await context.cookies()).toEqual([]);
  });

  test("con il consenso all'AI i dati passano solo da /api/triage, e si può tornare al metodo sul dispositivo", async ({ page }) => {
    const bodies: Record<string, unknown>[] = [];
    await aiAvailable(page, (route, request) => {
      bodies.push(request.postDataJSON() as Record<string, unknown>);
      return route.fulfill({ status: 502, json: { kind: "error", message: "In questo momento non riusciamo a completare l'analisi con l'AI." } });
    });

    await page.goto("/sintomi/intervista", { waitUntil: "networkidle" });
    await page.getByLabel(/Ho capito che Orienta/).check();
    await page.getByLabel(/Acconsento all'uso dei dati/).check();
    await page.getByLabel(/voglio domande più mirate con l'intelligenza artificiale/).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByLabel("Quanti anni hai?").fill("27");
    await page.getByText("Femmina", { exact: true }).click();
    await page.getByText("No", { exact: true }).click();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByLabel("Descrivi i tuoi disturbi").fill("Mi brucia quando faccio pipì");
    await page.getByRole("button", { name: "Continua con le domande" }).click();

    // Le domande fisse (segnali d'allarme, durata, intensità) restano sul dispositivo: nessun dato parte finché non serve
    await expect(page.getByRole("heading", { level: 1, name: /hai uno di questi segnali/ })).toBeVisible();
    await page.getByRole("button", { name: "Nessuno di questi" }).click();
    await page.getByRole("button", { name: "Da 1 a 3 giorni" }).click();
    await page.locator("label").filter({ has: page.getByRole("radio", { name: /^3\b/ }) }).click();
    expect(bodies).toHaveLength(0);
    await page.getByRole("button", { name: "Conferma" }).click();

    await expect(page.getByText("In questo momento non riusciamo a completare l'analisi con l'AI.")).toBeVisible();
    expect(bodies).toHaveLength(1);
    expect(bodies[0]).toMatchObject({ consent: true, text: "Mi brucia quando faccio pipì" });
    expect(Object.keys(bodies[0]!).sort()).toEqual(["answers", "consent", "profile", "symptoms", "text", "zones"]);

    // Il metodo semplificato continua sul dispositivo: nessun'altra richiesta
    await page.getByRole("button", { name: "Continua con il metodo semplificato" }).click();
    const results = page.getByRole("heading", { level: 1, name: "Cosa potrebbe essere" });
    const no = page.getByRole("button", { name: "No", exact: true });
    await expect(results.or(no).first()).toBeVisible({ timeout: 15_000 });
    if (await no.isVisible()) await no.click();
    await page.waitForTimeout(500);
    expect(bodies).toHaveLength(1);
  });
});
