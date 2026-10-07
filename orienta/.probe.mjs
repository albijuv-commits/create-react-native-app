import { chromium } from "@playwright/test";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", proxy: { server: process.env.HTTPS_PROXY } });
const ctx = await browser.newContext({ ignoreHTTPSErrors: false, locale: "it-IT" });
const page = await ctx.newPage();
for (const u of process.argv.slice(2)) {
  try {
    const res = await page.goto(u, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(4000);
    console.log(u, "->", res?.status(), "| final:", page.url(), "| title:", (await page.title()).slice(0, 120));
  } catch (e) { console.log(u, "ERR", e.message.split("\n")[0]); }
}
await browser.close();
