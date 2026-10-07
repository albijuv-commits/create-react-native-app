import { z } from "zod";
import { FORM_FAMILIES } from "./forms";
import type { NewMedicine } from "./schema";

/**
 * Foto di confezioni con licenza libera (Wikimedia Commons e simili): solo CC0, pubblico dominio,
 * CC BY e CC BY-SA, con autore, licenza e pagina della fonte. Una foto si abbina alle confezioni
 * dello stesso marchio (e, se indicati, dello stesso dosaggio e forma). Le confezioni vendute in
 * altri Paesi europei sono ammesse, con il Paese nella didascalia: possono essere diverse da quella
 * italiana. Le foto stanno in public/farmaci/foto.
 */
export const PHOTO_LICENSES = /^(CC0 1\.0|Pubblico dominio|CC BY(-SA)? [1-4]\.0)$/;

export const photoSchema = z.object({
  file: z.string().regex(/^[a-z0-9-]+\.webp$/),
  /** Il nome del medicinale come nell'anagrafica AIFA (DENOMINAZIONE), senza distinzione di maiuscole */
  brand: z.string().min(1),
  /** Dosaggio confrontabile (strengthKey) e famiglia di forma, se la foto mostra una confezione precisa */
  strength: z.string().min(1).optional(),
  formFamily: z.enum(FORM_FAMILIES).optional(),
  /** Paese in cui è venduta la confezione fotografata, in italiano */
  country: z.string().min(1),
  /** Cosa si vede: «Augmentin 875 mg/125 mg compresse» */
  shows: z.string().min(1),
  author: z.string().min(1),
  license: z.string().regex(PHOTO_LICENSES),
  source: z.url({ protocol: /^https$/ }),
});
export type Photo = z.infer<typeof photoSchema>;
export const photosFileSchema = z.array(photoSchema);

export const PHOTO_PUBLIC_DIR = "/farmaci/foto";

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/** La foto più specifica per la confezione: stesso marchio, poi dosaggio e forma se la foto li indica */
export function photoFor(m: Pick<NewMedicine, "officialName" | "strength" | "formFamily">, photos: readonly Photo[]): Photo | null {
  let best: { photo: Photo; score: number } | null = null;
  for (const p of photos) {
    if (norm(p.brand) !== norm(m.officialName)) continue;
    if (p.strength && p.strength !== m.strength) continue;
    if (p.formFamily && p.formFamily !== m.formFamily) continue;
    const score = (p.strength ? 2 : 0) + (p.formFamily ? 1 : 0);
    if (!best || score > best.score) best = { photo: p, score };
  }
  return best?.photo ?? null;
}

/** Aggiunge a ogni confezione la sua foto, se c'è */
export function applyPhotos(rows: NewMedicine[], photos: readonly Photo[]): number {
  let n = 0;
  for (const row of rows) {
    const p = photoFor(row, photos);
    if (!p) continue;
    row.imageUrl = `${PHOTO_PUBLIC_DIR}/${p.file}`;
    row.imageCredit = `${p.author}, ${p.license}`;
    row.imageSource = p.source;
    row.imageCaption = p.shows;
    row.imageCountry = p.country;
    n++;
  }
  return n;
}
