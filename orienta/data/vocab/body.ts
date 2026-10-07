/**
 * Aree del corpo (filtro della pagina Condizioni) e zone della mappa del corpo
 * (scene "corpo" e, nella fase 3, la mappa interattiva fronte/retro).
 */

export const BODY_AREAS = [
  { id: "testa", label: "Testa" },
  { id: "orl", label: "Occhi, naso, orecchie e gola" },
  { id: "respiro", label: "Petto e respiro" },
  { id: "digestione", label: "Pancia e digestione" },
  { id: "urinario", label: "Vie urinarie" },
  { id: "pelle", label: "Pelle" },
  { id: "muscoli", label: "Ossa, muscoli e articolazioni" },
  { id: "mente", label: "Mente e sonno" },
  { id: "corpo", label: "Tutto il corpo" },
] as const;

export type BodyAreaId = (typeof BODY_AREAS)[number]["id"];
export const BODY_AREA_IDS = BODY_AREAS.map((a) => a.id) as [BodyAreaId, ...BodyAreaId[]];

export type BodyView = "fronte" | "retro";

export const BODY_ZONES = [
  { id: "testa", label: "Testa", views: ["fronte", "retro"] },
  { id: "occhi", label: "Occhi", views: ["fronte"], parent: "testa" },
  { id: "orecchie", label: "Orecchie", views: ["fronte", "retro"], parent: "testa" },
  { id: "naso", label: "Naso e seni nasali", views: ["fronte"], parent: "testa" },
  { id: "bocca", label: "Bocca, denti e mandibola", views: ["fronte"], parent: "testa" },
  { id: "collo", label: "Gola e collo", views: ["fronte"] },
  { id: "nuca", label: "Nuca", views: ["retro"] },
  { id: "spalle", label: "Spalle", views: ["fronte", "retro"] },
  { id: "petto", label: "Petto", views: ["fronte"] },
  { id: "stomaco", label: "Stomaco (parte alta della pancia)", views: ["fronte"] },
  { id: "pancia", label: "Pancia", views: ["fronte"] },
  { id: "basso-ventre", label: "Basso ventre", views: ["fronte"] },
  { id: "schiena-alta", label: "Parte alta della schiena", views: ["retro"] },
  { id: "schiena-bassa", label: "Parte bassa della schiena", views: ["retro"] },
  { id: "braccia", label: "Braccia e gomiti", views: ["fronte", "retro"] },
  { id: "mani", label: "Mani e polsi", views: ["fronte", "retro"] },
  { id: "gambe", label: "Gambe e ginocchia", views: ["fronte", "retro"] },
  { id: "piedi", label: "Caviglie e piedi", views: ["fronte", "retro"] },
  { id: "pelle", label: "Pelle, in più punti", views: [] },
  { id: "tutto-il-corpo", label: "Tutto il corpo", views: [] },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  views: readonly BodyView[];
  parent?: string;
}>;

export type BodyZoneId = (typeof BODY_ZONES)[number]["id"];
export const BODY_ZONE_IDS = BODY_ZONES.map((z) => z.id) as [BodyZoneId, ...BodyZoneId[]];

export function bodyAreaLabel(id: BodyAreaId): string {
  return BODY_AREAS.find((a) => a.id === id)?.label ?? id;
}

export function bodyZoneLabel(id: BodyZoneId): string {
  return BODY_ZONES.find((z) => z.id === id)?.label ?? id;
}
