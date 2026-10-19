/**
 * Sagoma anatomica stilizzata, fronte e retro, con react-native-svg. Le forme e le zone sono
 * quelle della web app (orienta/src/components/body-map/body-shapes.ts), riquadro 100×200.
 */
import { Ellipse, G, Path, type PathProps } from "react-native-svg";
import type { BodyView } from "@data/vocab/body";
import { faceShapes, silhouetteShapes, type ShapeSpec } from "@/components/body-map/body-shapes";
import { C } from "@/components/slide/palette";

export function ZoneShape({ shape, ...props }: { shape: ShapeSpec } & Omit<PathProps, "d">) {
  return shape.kind === "path" ? <Path d={shape.d} {...props} /> : <Ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} {...props} />;
}

/** Sagoma con contorno pulito e lievi linee tra le zone */
export function BodyFigure({ view, fill = C.body, line = C.bodyLine }: { view: BodyView; fill?: string; line?: string }) {
  const shapes = silhouetteShapes(view);
  return (
    <G>
      {shapes.map((s, i) => (
        <ZoneShape key={`o${i}`} shape={s} fill={line} stroke={line} strokeWidth="2.6" strokeLinejoin="round" />
      ))}
      {shapes.map((s, i) => (
        <ZoneShape key={`f${i}`} shape={s} fill={fill} stroke={line} strokeWidth="0.4" strokeOpacity="0.35" />
      ))}
      {view === "fronte" && faceShapes("fronte").map((s, i) => <ZoneShape key={`v${i}`} shape={s} fill="#ffffff" stroke={line} strokeWidth="0.6" />)}
      {view === "retro" && <Path d="M50 46 V 112" stroke={line} strokeWidth="0.6" strokeOpacity="0.5" strokeDasharray="2 2" />}
    </G>
  );
}
