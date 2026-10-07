/**
 * Sagoma anatomica stilizzata, fronte e retro, divisa nelle zone del vocabolario
 * (data/vocab/body.ts). Coordinate in un riquadro 100×200.
 * Usata dalla scena "corpo" del vetrino e, nella fase 3, dalla mappa interattiva dell'intervista.
 */
import type { SVGProps } from "react";
import type { BodyView, BodyZoneId } from "@data/vocab/body";
import { C } from "@/components/slide/palette";

export type ShapeSpec =
  | { kind: "path"; d: string }
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number };

interface BodyShape {
  zone?: BodyZoneId;
  shape: ShapeSpec;
}

const HEAD: ShapeSpec = { kind: "ellipse", cx: 50, cy: 21, rx: 13, ry: 16 };
const NECK: ShapeSpec = { kind: "path", d: "M44 34 H56 V45 C 56 48 44 48 44 45 Z" };
const SHOULDER_L: ShapeSpec = { kind: "ellipse", cx: 30, cy: 54, rx: 7, ry: 7 };
const SHOULDER_R: ShapeSpec = { kind: "ellipse", cx: 70, cy: 54, rx: 7, ry: 7 };
const ARM_L: ShapeSpec = { kind: "path", d: "M24 56 C 20 70 18 88 15 110 L 22 111 C 25 90 28 72 33 60 Z" };
const ARM_R: ShapeSpec = { kind: "path", d: "M76 56 C 80 70 82 88 85 110 L 78 111 C 75 90 72 72 67 60 Z" };
const HAND_L: ShapeSpec = { kind: "ellipse", cx: 18, cy: 118, rx: 4.6, ry: 7.6 };
const HAND_R: ShapeSpec = { kind: "ellipse", cx: 82, cy: 118, rx: 4.6, ry: 7.6 };
const LEG_L: ShapeSpec = { kind: "path", d: "M35 124 C 40 130 46 131 49.5 130 L 47.5 158 L 46.5 186 L 39 186 L 37.5 158 Z" };
const LEG_R: ShapeSpec = { kind: "path", d: "M65 124 C 60 130 54 131 50.5 130 L 52.5 158 L 53.5 186 L 61 186 L 62.5 158 Z" };
const FOOT_L: ShapeSpec = { kind: "ellipse", cx: 42, cy: 191, rx: 6.6, ry: 4 };
const FOOT_R: ShapeSpec = { kind: "ellipse", cx: 58, cy: 191, rx: 6.6, ry: 4 };

const LIMBS: BodyShape[] = [
  { zone: "spalle", shape: SHOULDER_L },
  { zone: "spalle", shape: SHOULDER_R },
  { zone: "braccia", shape: ARM_L },
  { zone: "braccia", shape: ARM_R },
  { zone: "mani", shape: HAND_L },
  { zone: "mani", shape: HAND_R },
  { zone: "gambe", shape: LEG_L },
  { zone: "gambe", shape: LEG_R },
  { zone: "piedi", shape: FOOT_L },
  { zone: "piedi", shape: FOOT_R },
];

export const BODY_SHAPES: Record<BodyView, BodyShape[]> = {
  fronte: [
    { zone: "testa", shape: HEAD },
    { zone: "collo", shape: NECK },
    ...LIMBS,
    { zone: "petto", shape: { kind: "path", d: "M30 52 C 32 46 40 45 50 45 C 60 45 68 46 70 52 L 68 80 L 32 80 Z" } },
    { zone: "stomaco", shape: { kind: "path", d: "M32 80 H68 L67 96 H33 Z" } },
    { zone: "pancia", shape: { kind: "path", d: "M33 96 H67 L66 112 H34 Z" } },
    { zone: "basso-ventre", shape: { kind: "path", d: "M34 112 H66 C 66 120 62 128 50 130 C 38 128 34 120 34 112 Z" } },
    { zone: "occhi", shape: { kind: "ellipse", cx: 45, cy: 19, rx: 2.6, ry: 1.6 } },
    { zone: "occhi", shape: { kind: "ellipse", cx: 55, cy: 19, rx: 2.6, ry: 1.6 } },
    { zone: "naso", shape: { kind: "path", d: "M50 21 L 47.6 26.4 H 52.4 Z" } },
    { zone: "bocca", shape: { kind: "ellipse", cx: 50, cy: 30, rx: 4, ry: 1.5 } },
    { zone: "orecchie", shape: { kind: "ellipse", cx: 37, cy: 22, rx: 1.8, ry: 3.6 } },
    { zone: "orecchie", shape: { kind: "ellipse", cx: 63, cy: 22, rx: 1.8, ry: 3.6 } },
  ],
  retro: [
    { zone: "testa", shape: HEAD },
    { zone: "nuca", shape: NECK },
    ...LIMBS,
    { zone: "schiena-alta", shape: { kind: "path", d: "M30 52 C 32 46 40 45 50 45 C 60 45 68 46 70 52 L 68 84 L 32 84 Z" } },
    { zone: "schiena-bassa", shape: { kind: "path", d: "M32 84 H68 L66 114 H34 Z" } },
    { shape: { kind: "path", d: "M34 114 H66 C 66 122 62 130 50 131 C 38 130 34 122 34 114 Z" } },
    { zone: "orecchie", shape: { kind: "ellipse", cx: 37, cy: 22, rx: 1.8, ry: 3.6 } },
    { zone: "orecchie", shape: { kind: "ellipse", cx: 63, cy: 22, rx: 1.8, ry: 3.6 } },
  ],
};

/** Zone del viso: piccole, disegnate sopra la testa */
const FACE_ZONES = new Set<BodyZoneId>(["occhi", "naso", "bocca", "orecchie"]);

/** Centro approssimativo di ogni zona, per etichette ed effetti */
export const ZONE_CENTERS: Partial<Record<BodyZoneId, [number, number]>> = {
  testa: [50, 18],
  occhi: [50, 19],
  orecchie: [37, 22],
  naso: [50, 24],
  bocca: [50, 30],
  collo: [50, 40],
  nuca: [50, 40],
  spalle: [30, 54],
  petto: [50, 64],
  stomaco: [50, 88],
  pancia: [50, 104],
  "basso-ventre": [50, 120],
  "schiena-alta": [50, 66],
  "schiena-bassa": [50, 99],
  braccia: [22, 84],
  mani: [18, 118],
  gambe: [43, 160],
  piedi: [42, 191],
};

export function ZoneShape({ shape, ...props }: { shape: ShapeSpec } & SVGProps<SVGPathElement & SVGEllipseElement>) {
  return shape.kind === "path" ? <path d={shape.d} {...props} /> : <ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} {...props} />;
}

/** Le forme di una zona in una vista (vuoto se la zona non è visibile da quel lato) */
export function zoneShapes(view: BodyView, zone: BodyZoneId): ShapeSpec[] {
  return BODY_SHAPES[view].filter((s) => s.zone === zone).map((s) => s.shape);
}

/** Forme da evidenziare per un gruppo di zone: «pelle» e «tutto il corpo» accendono l'intera sagoma */
export function zonesShapes(view: BodyView, zones: readonly BodyZoneId[]): ShapeSpec[] {
  if (zones.some((z) => z === "pelle" || z === "tutto-il-corpo")) return silhouetteShapes(view);
  return zones.flatMap((z) => zoneShapes(view, z));
}

/** Forme della sola sagoma (senza i dettagli del viso), utili anche come clipPath */
export function silhouetteShapes(view: BodyView): ShapeSpec[] {
  return BODY_SHAPES[view].filter((s) => !s.zone || !FACE_ZONES.has(s.zone)).map((s) => s.shape);
}

/** Sagoma con contorno pulito e lievi linee tra le zone */
export function BodyFigure({ view, fill = C.body, line = C.bodyLine }: { view: BodyView; fill?: string; line?: string }) {
  const shapes = silhouetteShapes(view);
  return (
    <g>
      {shapes.map((s, i) => (
        <ZoneShape key={`o${i}`} shape={s} fill={line} stroke={line} strokeWidth="2.6" strokeLinejoin="round" />
      ))}
      {shapes.map((s, i) => (
        <ZoneShape key={`f${i}`} shape={s} fill={fill} stroke={line} strokeWidth="0.4" strokeOpacity="0.35" />
      ))}
      {view === "fronte" &&
        BODY_SHAPES.fronte
          .filter((s) => s.zone && FACE_ZONES.has(s.zone))
          .map((s, i) => <ZoneShape key={`v${i}`} shape={s.shape} fill="#ffffff" stroke={line} strokeWidth="0.6" />)}
      {view === "retro" && <path d="M50 46 V 112" stroke={line} strokeWidth="0.6" strokeOpacity="0.5" strokeDasharray="2 2" />}
    </g>
  );
}
