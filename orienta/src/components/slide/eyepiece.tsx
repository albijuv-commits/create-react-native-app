import type { ReactNode } from "react";
import type { SceneScale } from "@/lib/slides/catalog";
import { C } from "./palette";

/**
 * La cornice del vetrino: un oculare circolare con il fondo luminoso del vetro,
 * una leggera vignettatura e la barra di scala. Le scene disegnano in un viewBox 200×200,
 * area visibile: cerchio di raggio 90 centrato in (100,100).
 */
export function Eyepiece({
  id,
  scale,
  children,
}: {
  id: string;
  scale: SceneScale | null;
  children: ReactNode;
}) {
  const clip = `${id}-clip`;
  const glass = `${id}-glass`;
  const ring = `${id}-ring`;
  const vignette = `${id}-vignette`;
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <circle cx="100" cy="100" r="90" />
        </clipPath>
        <radialGradient id={glass} cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#fffcfe" />
          <stop offset="0.75" stopColor="#f8eef5" />
          <stop offset="1" stopColor="#eadcea" />
        </radialGradient>
        <radialGradient id={vignette} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.72" stopColor="#2a2340" stopOpacity="0" />
          <stop offset="1" stopColor="#2a2340" stopOpacity="0.28" />
        </radialGradient>
        <linearGradient id={ring} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a4f7e" />
          <stop offset="0.5" stopColor="#2a2340" />
          <stop offset="1" stopColor="#4a4068" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="99" fill={`url(#${ring})`} />
      <circle cx="100" cy="100" r="94.5" fill="none" stroke="#7a6fa3" strokeWidth="0.8" opacity="0.6" />
      <g clipPath={`url(#${clip})`}>
        <rect x="0" y="0" width="200" height="200" fill={`url(#${glass})`} />
        {children}
        <rect x="0" y="0" width="200" height="200" fill={`url(#${vignette})`} pointerEvents="none" />
      </g>
      <ScaleBar scale={scale} />
    </>
  );
}

function ScaleBar({ scale }: { scale: SceneScale | null }) {
  const y = 176;
  if (!scale) {
    return (
      <text x="100" y={y + 3} textAnchor="middle" className="slide-label" fontSize="6.5" fill={C.inkSoft}>
        schema, non in scala
      </text>
    );
  }
  const x1 = 100 - scale.units / 2;
  const x2 = 100 + scale.units / 2;
  return (
    <g aria-hidden>
      <text x="100" y={y - 3} textAnchor="middle" className="slide-label slide-halo" fontSize="7" fontWeight="700" fill={C.ink}>
        {scale.label}
      </text>
      <path d={`M${x1} ${y - 2}V${y + 2}M${x1} ${y}H${x2}M${x2} ${y - 2}V${y + 2}`} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <path d={`M${x1} ${y - 2}V${y + 2}M${x1} ${y}H${x2}M${x2} ${y - 2}V${y + 2}`} stroke={C.ink} strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}
