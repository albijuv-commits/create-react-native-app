import type { StaticImageData } from "next/image";
import { BODY_AREAS, type BodyAreaId } from "@data/vocab/body";
import corpo from "@/assets/illustrations/area-corpo.webp";
import digestione from "@/assets/illustrations/area-digestione.webp";
import mente from "@/assets/illustrations/area-mente.webp";
import muscoli from "@/assets/illustrations/area-muscoli.webp";
import orl from "@/assets/illustrations/area-orl.webp";
import pelle from "@/assets/illustrations/area-pelle.webp";
import respiro from "@/assets/illustrations/area-respiro.webp";
import testa from "@/assets/illustrations/area-testa.webp";
import urinario from "@/assets/illustrations/area-urinario.webp";

const short = (id: BodyAreaId) => BODY_AREAS.find((a) => a.id === id)!.short;

/** Illustrazione ed etichetta breve di ogni area del corpo, per i riquadri del filtro */
export const AREA_TILES: Record<BodyAreaId, { image: StaticImageData; short: string }> = {
  testa: { image: testa, short: short("testa") },
  orl: { image: orl, short: short("orl") },
  respiro: { image: respiro, short: short("respiro") },
  digestione: { image: digestione, short: short("digestione") },
  urinario: { image: urinario, short: short("urinario") },
  pelle: { image: pelle, short: short("pelle") },
  muscoli: { image: muscoli, short: short("muscoli") },
  mente: { image: mente, short: short("mente") },
  corpo: { image: corpo, short: short("corpo") },
};
