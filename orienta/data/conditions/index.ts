import { z } from "zod";
import { conditionSchema, type Condition } from "@/lib/conditions/schema";
import acne from "./acne";
import allergiaAcari from "./allergia-acari";
import anemia from "./anemia";
import ansia from "./ansia";
import apneeNotturne from "./apnee-notturne";
import asma from "./asma";
import bronchite from "./bronchite";
import bruxismo from "./bruxismo";
import cefaleaTensiva from "./cefalea-tensiva";
import cistite from "./cistite";
import colonIrritabile from "./colon-irritabile";
import colpoDiCalore from "./colpo-di-calore";
import congiuntivite from "./congiuntivite";
import covid19 from "./covid-19";
import depressione from "./depressione";
import dermatiteAtopica from "./dermatite-atopica";
import dermatiteContatto from "./dermatite-contatto";
import diabeteTipo2 from "./diabete-tipo-2";
import disidratazione from "./disidratazione";
import distorsione from "./distorsione";
import emicrania from "./emicrania";
import faringiteTonsillite from "./faringite-tonsillite";
import gastroenterite from "./gastroenterite";
import herpesLabiale from "./herpes-labiale";
import influenza from "./influenza";
import insonnia from "./insonnia";
import intossicazioneMonossido from "./intossicazione-monossido";
import ipertensione from "./ipertensione";
import ipotiroidismo from "./ipotiroidismo";
import malDiSchiena from "./mal-di-schiena";
import mononucleosi from "./mononucleosi";
import orticaria from "./orticaria";
import otite from "./otite";
import psoriasi from "./psoriasi";
import raffreddore from "./raffreddore";
import reflusso from "./reflusso";
import riniteAllergica from "./rinite-allergica";
import sinusite from "./sinusite";
import tendinite from "./tendinite";
import varicella from "./varicella";

/**
 * Base di conoscenza delle condizioni. Per aggiungerne una: crea il file in questa cartella
 * con `defineCondition`, importalo qui e lancia `npm test` (che valida tutte le schede).
 */
const RAW = [
  acne,
  allergiaAcari,
  anemia,
  ansia,
  apneeNotturne,
  asma,
  bronchite,
  bruxismo,
  cefaleaTensiva,
  cistite,
  colonIrritabile,
  colpoDiCalore,
  congiuntivite,
  covid19,
  depressione,
  dermatiteAtopica,
  dermatiteContatto,
  diabeteTipo2,
  disidratazione,
  distorsione,
  emicrania,
  faringiteTonsillite,
  gastroenterite,
  herpesLabiale,
  influenza,
  insonnia,
  intossicazioneMonossido,
  ipertensione,
  ipotiroidismo,
  malDiSchiena,
  mononucleosi,
  orticaria,
  otite,
  psoriasi,
  raffreddore,
  reflusso,
  riniteAllergica,
  sinusite,
  tendinite,
  varicella,
];

export const CONDITIONS: readonly Condition[] = z.array(conditionSchema).parse(RAW);
