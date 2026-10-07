/**
 * Verifica che ogni link delle fonti della base di conoscenza esista davvero.
 *
 *   npm run check:sources            controlla e stampa il resoconto
 *   npm run check:sources -- --write salva anche data/conditions/sources-report.json
 *
 * Per ogni indirizzo controlla lo stato HTTP, l'indirizzo finale dopo i redirect e il titolo
 * della pagina, così riconosce anche le "false pagine 200" (titoli come "404" o "Not found").
 * Alcuni siti istituzionali bloccano le richieste automatiche: in quel caso, se Playwright è
 * installato, la pagina viene aperta con un browser vero.
 */
import { writeFileSync } from "node:fs";
import { CONDITIONS } from "../data/conditions";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 OrientaLinkCheck";
const SUSPICIOUS_TITLE =
  /\b404\b|not found|non trovat|pagina inesistente|errore|error|request rejected|access denied|forbidden|bad gateway|gcore|just a moment|attention required|checking your browser/i;

interface Result {
  url: string;
  ok: boolean;
  status: number;
  finalUrl: string;
  title: string;
  via: "fetch" | "browser";
  note?: string;
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return "";
  return m[1]
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function judge(status: number, title: string): { ok: boolean; note?: string } {
  if (status < 200 || status >= 300) return { ok: false, note: `stato HTTP ${status}` };
  if (!title) return { ok: false, note: "pagina senza titolo" };
  if (SUSPICIOUS_TITLE.test(title)) return { ok: false, note: "titolo sospetto (possibile pagina di errore)" };
  return { ok: true };
}

async function viaFetch(url: string): Promise<Result> {
  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: { "User-Agent": UA, "Accept-Language": "it-IT,it;q=0.9,en;q=0.8" },
        signal: AbortSignal.timeout(30_000),
      });
      const title = extractTitle(await res.text());
      return { url, status: res.status, finalUrl: res.url, title, via: "fetch", ...judge(res.status, title) };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  return { url, ok: false, status: 0, finalUrl: url, title: "", via: "fetch", note: lastError };
}

type BrowserPage = {
  goto(url: string, o: object): Promise<{ status(): number } | null>;
  waitForTimeout(ms: number): Promise<void>;
  title(): Promise<string>;
  url(): string;
};

let browserPage: Promise<{ page: BrowserPage; close: () => Promise<void> } | null> | null = null;

function getBrowserPage() {
  browserPage ??= (async () => {
    try {
      const { chromium } = await import("@playwright/test");
      const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
      const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, proxy });
      const page = (await (await browser.newContext({ locale: "it-IT" })).newPage()) as unknown as BrowserPage;
      return { page, close: () => browser.close() };
    } catch {
      return null;
    }
  })();
  return browserPage;
}

async function viaBrowser(url: string): Promise<Result | null> {
  const b = await getBrowserPage();
  if (!b) return null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await b.page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await b.page.waitForTimeout(2500);
      const status = res?.status() ?? 0;
      const title = (await b.page.title()).replace(/\s+/g, " ").trim();
      const result: Result = { url, status, finalUrl: b.page.url(), title, via: "browser", ...judge(status, title) };
      if (result.ok || attempt === 2) return result;
    } catch {
      // riprova
    }
    await b.page.waitForTimeout(3000);
  }
  return null;
}

async function main() {
  const write = process.argv.includes("--write");
  const urls = [...new Set(CONDITIONS.flatMap((c) => c.sources.map((s) => s.url)))].sort();
  console.log(`Controllo ${urls.length} link da ${CONDITIONS.length} schede…\n`);

  const results: Result[] = [];
  const queue = [...urls];
  const workers = Array.from({ length: 6 }, async () => {
    for (let url = queue.shift(); url; url = queue.shift()) results.push(await viaFetch(url));
  });
  await Promise.all(workers);

  // Secondo tentativo con il browser per le pagine bloccate o sospette
  for (const [i, r] of results.entries()) {
    if (r.ok) continue;
    const b = await viaBrowser(r.url);
    if (b) results[i] = b;
  }
  await (await getBrowserPage())?.close();

  results.sort((a, b) => a.url.localeCompare(b.url));
  for (const r of results) {
    const mark = r.ok ? "OK  " : "FAIL";
    const redirect = r.finalUrl !== r.url ? `\n       -> ${r.finalUrl}` : "";
    console.log(`${mark} [${r.status} ${r.via}] ${r.url}${redirect}\n       «${r.title}»${r.note ? `  (${r.note})` : ""}`);
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} link verificati.`);

  if (write) {
    const report = {
      checkedAt: new Date().toISOString().slice(0, 10),
      results: results.map(({ url, ok, status, finalUrl, title, via }) => ({ url, ok, status, finalUrl, title, via })),
    };
    writeFileSync(new URL("../data/conditions/sources-report.json", import.meta.url), JSON.stringify(report, null, 2) + "\n");
    console.log("Resoconto salvato in data/conditions/sources-report.json");
  }
  if (failed.length) process.exitCode = 1;
}

void main();
