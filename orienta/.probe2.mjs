import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", proxy: { server: process.env.HTTPS_PROXY } });
const page = await (await browser.newContext({ locale: "it-IT" })).newPage();
const out = [];
for (const u of process.argv.slice(2)) {
  try {
    const res = await page.goto(u, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3500);
    const links = await page.$$eval("a[href]", (as) => as.map((a) => [a.href, (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80)]));
    out.push(`# ${u} -> ${res?.status()} ${page.url()} | ${await page.title()}`);
    for (const [h, t] of links) out.push(`${h} | ${t}`);
  } catch (e) { out.push(`# ${u} ERR ${e.message.split("\n")[0]}`); }
}
writeFileSync("/tmp/claude-0/src-cache/min-links.txt", out.join("\n"));
await browser.close();
