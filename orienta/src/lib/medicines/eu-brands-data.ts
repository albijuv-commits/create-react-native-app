import "server-only";
import data from "@data/medicines/eu-brands.json";
import { euBrandsFileSchema, ROUTES_FOR_FORM, type EuBrand } from "./eu-brands";
import type { FormFamily } from "./forms";

/** I marchi europei generati da scripts/import-eu-brands.ts, validati una volta al primo uso */
let parsed: ReturnType<typeof euBrandsFileSchema.parse> | null = null;
function file() {
  parsed ??= euBrandsFileSchema.parse(data);
  return parsed;
}

export interface EuBrandsView {
  source: string;
  url: string;
  updated: string | null;
  products: number;
  countries: string[];
  /** Marchi con la stessa via di somministrazione della confezione, se si riesce a stabilirla */
  brands: EuBrand[];
  sameRoute: boolean;
}

export function euBrandsFor(key: string | null | undefined, form?: FormFamily): EuBrandsView | null {
  if (!key) return null;
  const f = file();
  const entry = f.ingredients[key];
  if (!entry || !entry.brands.length) return null;
  const routes = form ? ROUTES_FOR_FORM[form] : null;
  const byRoute = routes ? entry.brands.filter((b) => b.routes.some((r) => routes.includes(r))) : [];
  const sameRoute = byRoute.length > 0;
  return {
    source: f.source,
    url: f.url,
    updated: f.updated,
    products: entry.products,
    countries: entry.countries,
    brands: sameRoute ? byRoute : entry.brands,
    sameRoute,
  };
}
