/**
 * Sagoma anatomica stilizzata, fronte e retro, divisa nelle zone del vocabolario
 * (data/vocab/body.ts). Coordinate in un riquadro 100×200.
 * Usata dalla scena "corpo" del vetrino e dalla mappa interattiva dell'intervista.
 * Le forme sono in body-shapes.ts, condiviso con l'app nativa.
 */
import type { SVGProps } from "react";
import type { BodyView } from "@data/vocab/body";
import { C } from "@/components/slide/palette";
import { faceShapes, silhouetteShapes, type ShapeSpec } from "./body-shapes";

export * from "./body-shapes";

export function ZoneShape({ shape, ...props }: { shape: ShapeSpec } & SVGProps<SVGPathElement & SVGEllipseElement>) {
  return shape.kind === "path" ? <path d={shape.d} {...props} /> : <ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} {...props} />;
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
      {view === "fronte" && faceShapes("fronte").map((s, i) => <ZoneShape key={`v${i}`} shape={s} fill="#ffffff" stroke={line} strokeWidth="0.6" />)}
      {view === "retro" && <path d="M50 46 V 112" stroke={line} strokeWidth="0.6" strokeOpacity="0.5" strokeDasharray="2 2" />}
    </g>
  );
}
