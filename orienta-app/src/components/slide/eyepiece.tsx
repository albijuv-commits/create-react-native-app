import type { ReactNode } from "react";
import { Circle, ClipPath, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import type { SceneScale } from "@/lib/slides/catalog";
import { C } from "@/components/slide/palette";
import { SvgLabel } from "./label";

/**
 * La cornice del vetrino: un oculare circolare con il fondo luminoso del vetro, una leggera
 * vignettatura e la barra di scala, come nella web app. Le scene disegnano in un viewBox 200×200,
 * area visibile: cerchio di raggio 90 centrato in (100,100).
 */
export function Eyepiece({ id, scale, children }: { id: string; scale: SceneScale | null; children: ReactNode }) {
  const clip = `${id}-clip`;
  const glass = `${id}-glass`;
  const ring = `${id}-ring`;
  const vignette = `${id}-vignette`;
  return (
    <>
      <Defs>
        <ClipPath id={clip}>
          <Circle cx="100" cy="100" r="90" />
        </ClipPath>
        <RadialGradient id={glass} cx="45%" cy="40%" r="70%">
          <Stop offset="0" stopColor="#fffcfe" />
          <Stop offset="0.75" stopColor="#f8eef5" />
          <Stop offset="1" stopColor="#eadcea" />
        </RadialGradient>
        <RadialGradient id={vignette} cx="50%" cy="50%" r="50%">
          <Stop offset="0.72" stopColor="#2a2340" stopOpacity="0" />
          <Stop offset="1" stopColor="#2a2340" stopOpacity="0.28" />
        </RadialGradient>
        <LinearGradient id={ring} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#5a4f7e" />
          <Stop offset="0.5" stopColor="#2a2340" />
          <Stop offset="1" stopColor="#4a4068" />
        </LinearGradient>
      </Defs>

      <Circle cx="100" cy="100" r="99" fill={`url(#${ring})`} />
      <Circle cx="100" cy="100" r="94.5" fill="none" stroke="#7a6fa3" strokeWidth="0.8" opacity="0.6" />
      <G clipPath={`url(#${clip})`}>
        <Rect x="0" y="0" width="200" height="200" fill={`url(#${glass})`} />
        {children}
        <Rect x="0" y="0" width="200" height="200" fill={`url(#${vignette})`} />
      </G>
      <ScaleBar scale={scale} />
    </>
  );
}

function ScaleBar({ scale }: { scale: SceneScale | null }) {
  const y = 176;
  if (!scale) {
    return (
      <SvgLabel x={100} y={y + 3} anchor="middle" size={6.5} fill={C.inkSoft}>
        schema, non in scala
      </SvgLabel>
    );
  }
  const x1 = 100 - scale.units / 2;
  const x2 = 100 + scale.units / 2;
  const d = `M${x1} ${y - 2}V${y + 2}M${x1} ${y}H${x2}M${x2} ${y - 2}V${y + 2}`;
  return (
    <G>
      <SvgLabel x={100} y={y - 3} anchor="middle" size={7} bold halo fill={C.ink}>
        {scale.label}
      </SvgLabel>
      <Path d={d} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <Path d={d} stroke={C.ink} strokeWidth="1.2" strokeLinecap="round" />
    </G>
  );
}
