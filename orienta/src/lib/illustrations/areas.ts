import type { StaticImageData } from "next/image";
import type { BodyAreaId } from "@data/vocab/body";
import corpo from "@/assets/illustrations/area-corpo.webp";
import digestione from "@/assets/illustrations/area-digestione.webp";
import mente from "@/assets/illustrations/area-mente.webp";
import muscoli from "@/assets/illustrations/area-muscoli.webp";
import orl from "@/assets/illustrations/area-orl.webp";
import pelle from "@/assets/illustrations/area-pelle.webp";
import respiro from "@/assets/illustrations/area-respiro.webp";
import testa from "@/assets/illustrations/area-testa.webp";
import urinario from "@/assets/illustrations/area-urinario.webp";

/** Illustrazione ed etichetta breve di ogni area del corpo, per i riquadri del filtro */
export const AREA_TILES: Record<BodyAreaId, { image: StaticImageData; short: string }> = {
  testa: { image: testa, short: "Testa" },
  orl: { image: orl, short: "Occhi, naso, gola" },
  respiro: { image: respiro, short: "Petto e respiro" },
  digestione: { image: digestione, short: "Pancia" },
  urinario: { image: urinario, short: "Vie urinarie" },
  pelle: { image: pelle, short: "Pelle" },
  muscoli: { image: muscoli, short: "Ossa e muscoli" },
  mente: { image: mente, short: "Mente e sonno" },
  corpo: { image: corpo, short: "Tutto il corpo" },
};
