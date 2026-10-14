import { z } from "zod";

/**
 * Un marchio dello stesso principio attivo negli altri Paesi europei, dall'elenco pubblico dell'EMA
 * (Article 57 database). Sta da solo, senza le tabelle e le funzioni di importazione di
 * eu-brands.ts, perché lo usano anche gli schemi delle risposte mostrate nel browser e nell'app.
 */
export const EMA_ARTICLE57_PAGE =
  "https://www.ema.europa.eu/en/human-regulatory-overview/post-authorisation/data-medicines-iso-idmp-standards-post-authorisation/public-data-article-57-database";

export const euBrandSchema = z.object({
  name: z.string().min(1),
  countries: z.array(z.string().min(1)).min(1),
  routes: z.array(z.string().min(1)).min(1),
  holders: z.array(z.string().min(1)).max(3),
});
export type EuBrand = z.infer<typeof euBrandSchema>;
