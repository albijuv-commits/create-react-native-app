"use client";

import type { ComponentType } from "react";
import type { SceneId, SceneParams, SceneSpec } from "@/lib/slides/catalog";
import { Infiammazione, ReazioneAllergica } from "./scenes/allergia";
import { BilancioAcqua, Corpo, Termoregolazione } from "./scenes/corpo";
import { IntestinoSensibile, Reflusso } from "./scenes/digestione";
import { HerpesLatenza, InfezioneBatterica, InfezioneVirale } from "./scenes/infezioni";
import { Allarme, CicloSonno, CircoloUmore } from "./scenes/mente";
import { Bronchi, VieAereeSonno } from "./scenes/respiro";
import { Glicemia, GlobuliRossi, Tiroide, VasoPressione } from "./scenes/sangue";
import { Fibre, Pelle } from "./scenes/tessuti";
import { OndaEmicrania, OrecchioMedio, SeniNasali, TensioneMuscolare } from "./scenes/testa";

type SceneComponents = { [K in SceneId]: ComponentType<{ params: SceneParams<K> }> };

const SCENES: SceneComponents = {
  "infezione-virale": InfezioneVirale,
  "infezione-batterica": InfezioneBatterica,
  "herpes-latenza": HerpesLatenza,
  "reazione-allergica": ReazioneAllergica,
  infiammazione: Infiammazione,
  "seni-nasali": SeniNasali,
  "orecchio-medio": OrecchioMedio,
  "onda-emicrania": OndaEmicrania,
  "tensione-muscolare": TensioneMuscolare,
  bronchi: Bronchi,
  "vie-aeree-sonno": VieAereeSonno,
  reflusso: Reflusso,
  "intestino-sensibile": IntestinoSensibile,
  "ciclo-sonno": CicloSonno,
  allarme: Allarme,
  "circolo-umore": CircoloUmore,
  "globuli-rossi": GlobuliRossi,
  tiroide: Tiroide,
  "vaso-pressione": VasoPressione,
  glicemia: Glicemia,
  "bilancio-acqua": BilancioAcqua,
  termoregolazione: Termoregolazione,
  pelle: Pelle,
  fibre: Fibre,
  corpo: Corpo,
};

/** Disegna la scena indicata dalla scheda. */
export function SceneRenderer({ spec }: { spec: SceneSpec }) {
  const Scene = SCENES[spec.scene] as ComponentType<{ params: SceneSpec["params"] }>;
  return <Scene params={spec.params} />;
}
