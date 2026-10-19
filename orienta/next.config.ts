import type { NextConfig } from "next";

const MEDICINES_DB = "./data/medicines/orienta.db";

const nextConfig: NextConfig = {
  // Il repository contiene un altro lockfile nella cartella superiore: la radice è questa cartella
  outputFileTracingRoot: __dirname,
  // Il database dei medicinali (npm run import:aifa) si apre a runtime, quindi non entra da solo nelle
  // tracce: dove ogni route diventa una funzione a sé, come su Vercel, deve viaggiare con quelle che lo leggono
  outputFileTracingIncludes: {
    "/api/farmaci": [MEDICINES_DB],
    "/api/farmaci/**": [MEDICINES_DB],
    "/mercato": [MEDICINES_DB],
    "/mercato/**": [MEDICINES_DB],
    "/profilo/fonti": [MEDICINES_DB],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        // Il service worker va sempre riletto dalla rete, così gli aggiornamenti arrivano subito
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
