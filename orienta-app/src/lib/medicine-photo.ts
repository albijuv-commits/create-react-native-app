import type { ImageSource } from "expo-image";
import augmentin from "../../../orienta/public/farmaci/foto/augmentin-875-125-belgio.webp";
import eutirox from "../../../orienta/public/farmaci/foto/eutirox-100-125-italia.webp";
import fluimucil from "../../../orienta/public/farmaci/foto/fluimucil-300-fiale-italia.webp";
import ventolin from "../../../orienta/public/farmaci/foto/ventolin-100-spray-repubblica-ceca.webp";
import { apiBaseUrl } from "./api";

/**
 * Le foto delle confezioni (licenza libera, data/medicines/photos.json) stanno nella web app, in
 * /farmaci/foto. Le poche del campione viaggiano anche con l'app, così si vedono senza servizio;
 * le altre arrivano dalla web app. Senza foto si usa l'illustrazione della forma.
 */
const BUNDLED: Readonly<Record<string, number>> = {
  "/farmaci/foto/augmentin-875-125-belgio.webp": augmentin,
  "/farmaci/foto/eutirox-100-125-italia.webp": eutirox,
  "/farmaci/foto/fluimucil-300-fiale-italia.webp": fluimucil,
  "/farmaci/foto/ventolin-100-spray-repubblica-ceca.webp": ventolin,
};

export function medicinePhoto(imageUrl: string | null): ImageSource | number | null {
  if (!imageUrl) return null;
  const local = BUNDLED[imageUrl];
  if (local !== undefined) return local;
  const base = apiBaseUrl();
  return base ? { uri: `${base}${imageUrl}` } : null;
}
