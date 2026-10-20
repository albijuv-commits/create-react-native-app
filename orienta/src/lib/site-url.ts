/**
 * L'indirizzo pubblico della web app: NEXT_PUBLIC_SITE_URL se c'è, altrimenti quello di produzione
 * che Vercel fornisce da solo (VERCEL_PROJECT_PRODUCTION_URL, senza «https://»). Vuoto vale come
 * assente, come nelle variabili lasciate in bianco di .env.example.
 */
export function siteUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  return vercel ? `https://${vercel}` : null;
}
