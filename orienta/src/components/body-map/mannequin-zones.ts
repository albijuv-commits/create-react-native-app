import { BODY_ZONE_IDS, type BodyZoneId } from "@data/vocab/body";

/**
 * Le zone del manichino scolpito (public/models/manichino.glb), in base alla posizione.
 * Il modello è normalizzato: piedi a y = 0, altezza 1,76, guarda verso +z, x laterale.
 * Le soglie vengono dalle misure del modello (fasce di altezza, distacco delle braccia dal busto,
 * profilo del viso) e vanno riviste se il modello cambia. La stessa regola esiste due volte:
 * qui per capire cosa si è toccato, e nello shader per colorare le zone pixel per pixel;
 * i numeri vengono da qui per entrambe.
 */
export const MANNEQUIN_HEIGHT = 1.76;

/** Soglie in frazioni dell'altezza (h) o in metri del modello */
const T = {
  feet: 0.055,
  legsTop: 0.42,
  armpit: 0.64,
  wrist: 0.465,
  gapLow: 0.25,
  gapAt40: 0.289,
  gapSlope: 0.591,
  head: 0.8,
  earsX: 0.145,
  earsLow: 0.845,
  earsHigh: 0.905,
  faceZ: 0.11,
  noseLow: 0.86,
  noseHigh: 0.885,
  noseX: 0.035,
  eyesHigh: 0.93,
  eyesInnerX: 0.02,
  eyesOuterX: 0.085,
  mouthLow: 0.815,
  mouthX: 0.06,
  neck: 0.765,
  neckMidZ: -0.06,
  torsoMidZ: -0.045,
  /** Le spalle sono due calotte: sfere attorno all'articolazione */
  shoulderX: 0.19,
  shoulderY: 1.275,
  shoulderZ: -0.03,
  shoulderR: 0.095,
  upperArmX: 0.165,
  chest: 0.6,
  stomach: 0.555,
  belly: 0.5,
  upperBack: 0.57,
} as const;

/** Fino all'ascella le braccia sono staccate dal busto: oltre questa distanza laterale c'è il braccio */
function armGap(h: number): number {
  if (h < 0.4) return T.gapLow;
  return T.gapAt40 - T.gapSlope * (h - 0.4);
}

export function mannequinZone(x: number, y: number, z: number): BodyZoneId {
  const h = y / MANNEQUIN_HEIGHT;
  const ax = Math.abs(x);

  if (h < T.feet) return "piedi";
  if (h < T.armpit && ax > armGap(h)) return h < T.wrist ? "mani" : "braccia";
  if (h < T.legsTop) return "gambe";

  if (h >= T.head) {
    if (ax > T.earsX && h >= T.earsLow && h < T.earsHigh) return "orecchie";
    if (z > T.faceZ) {
      if (h >= T.noseLow && h < T.noseHigh && ax < T.noseX) return "naso";
      if (h >= T.noseHigh && h < T.eyesHigh && ax >= T.eyesInnerX && ax < T.eyesOuterX) return "occhi";
      if (h >= T.mouthLow && h < T.noseLow && ax < T.mouthX) return "bocca";
    }
    return "testa";
  }

  if (h >= T.armpit && Math.hypot(ax - T.shoulderX, y - T.shoulderY, z - T.shoulderZ) < T.shoulderR) return "spalle";
  if (h >= T.neck) return z > T.neckMidZ ? "collo" : "nuca";
  const front = z > T.torsoMidZ;
  if (h >= T.armpit) return ax >= T.upperArmX ? "braccia" : front ? "petto" : "schiena-alta";
  if (front) {
    if (h >= T.chest) return "petto";
    if (h >= T.stomach) return "stomaco";
    if (h >= T.belly) return "pancia";
    return "basso-ventre";
  }
  return h >= T.upperBack ? "schiena-alta" : "schiena-bassa";
}

/** Indice di ogni zona nel bitmask dello shader */
export const ZONE_INDEX: Readonly<Record<BodyZoneId, number>> = Object.fromEntries(BODY_ZONE_IDS.map((id, i) => [id, i])) as Record<
  BodyZoneId,
  number
>;

export function zoneMask(zones: readonly BodyZoneId[]): number {
  return zones.reduce((mask, z) => mask | (1 << ZONE_INDEX[z]), 0);
}

const f = (n: number) => (Number.isInteger(n) ? `${n}.0` : `${n}`);
const zi = (z: BodyZoneId) => `${ZONE_INDEX[z]}`;

/** La stessa regola di mannequinZone, in GLSL, con le stesse soglie */
export const MANNEQUIN_ZONE_GLSL = /* glsl */ `
int mannequinZone(vec3 p) {
  float h = p.y / ${f(MANNEQUIN_HEIGHT)};
  float ax = abs(p.x);
  float z = p.z;
  if (h < ${f(T.feet)}) return ${zi("piedi")};
  float gap = h < 0.4 ? ${f(T.gapLow)} : ${f(T.gapAt40)} - ${f(T.gapSlope)} * (h - 0.4);
  if (h < ${f(T.armpit)} && ax > gap) return h < ${f(T.wrist)} ? ${zi("mani")} : ${zi("braccia")};
  if (h < ${f(T.legsTop)}) return ${zi("gambe")};
  if (h >= ${f(T.head)}) {
    if (ax > ${f(T.earsX)} && h >= ${f(T.earsLow)} && h < ${f(T.earsHigh)}) return ${zi("orecchie")};
    if (z > ${f(T.faceZ)}) {
      if (h >= ${f(T.noseLow)} && h < ${f(T.noseHigh)} && ax < ${f(T.noseX)}) return ${zi("naso")};
      if (h >= ${f(T.noseHigh)} && h < ${f(T.eyesHigh)} && ax >= ${f(T.eyesInnerX)} && ax < ${f(T.eyesOuterX)}) return ${zi("occhi")};
      if (h >= ${f(T.mouthLow)} && h < ${f(T.noseLow)} && ax < ${f(T.mouthX)}) return ${zi("bocca")};
    }
    return ${zi("testa")};
  }
  if (h >= ${f(T.armpit)} && length(vec3(ax - ${f(T.shoulderX)}, p.y - ${f(T.shoulderY)}, z - ${f(T.shoulderZ)})) < ${f(T.shoulderR)}) return ${zi("spalle")};
  if (h >= ${f(T.neck)}) return z > ${f(T.neckMidZ)} ? ${zi("collo")} : ${zi("nuca")};
  bool front = z > ${f(T.torsoMidZ)};
  if (h >= ${f(T.armpit)}) return ax >= ${f(T.upperArmX)} ? ${zi("braccia")} : (front ? ${zi("petto")} : ${zi("schiena-alta")});
  if (front) {
    if (h >= ${f(T.chest)}) return ${zi("petto")};
    if (h >= ${f(T.stomach)}) return ${zi("stomaco")};
    if (h >= ${f(T.belly)}) return ${zi("pancia")};
    return ${zi("basso-ventre")};
  }
  return h >= ${f(T.upperBack)} ? ${zi("schiena-alta")} : ${zi("schiena-bassa")};
}
`;
