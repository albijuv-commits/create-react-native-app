import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Test end-to-end su una build di produzione, con viewport da telefono.
 * Se il browser di Playwright non è installato si può indicare un Chromium già presente
 * con la variabile CHROMIUM_PATH.
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    ...devices["Pixel 7"],
    baseURL: `http://localhost:${PORT}`,
    locale: "it-IT",
    trace: "retain-on-failure",
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    // Medici: solo dati di esempio, nessuna chiamata a Google o a Overpass durante i test
    env: { DOCTORS_PROVIDER: "esempio" },
  },
});
