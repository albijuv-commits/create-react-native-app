/**
 * Elementi grafici riutilizzabili delle scene: agenti (virus, batteri, acari, pollini, funghi),
 * cellule e molecole. Gli stessi disegni della web app (orienta/src/components/slide/primitives.tsx),
 * con react-native-svg. Coordinate nel viewBox 200×200.
 */
import type { ReactNode } from "react";
import { Circle, Ellipse, G, Line, Path, Polygon, Rect, type GProps } from "react-native-svg";
import { C } from "@/components/slide/palette";
import type { VirusKind } from "@/lib/slides/catalog";
import { FlowPath, Idle } from "./idle";
import { SvgLabel } from "./label";

const TAU = Math.PI * 2;

/** Generatore pseudo-casuale deterministico: stesse posizioni a ogni render */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function polar(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

export function fmt(n: number) {
  return Math.round(n * 100) / 100;
}

function polygon(cx: number, cy: number, r: number, n: number, rot = 0) {
  return Array.from({ length: n }, (_, i) => polar(cx, cy, r, rot + (i * TAU) / n).map(fmt).join(",")).join(" ");
}

type Gp = Omit<GProps, "children">;

/* ------------------------------------------------------------------ VIRUS */

export function Virus({ kind, r, ...g }: { kind: VirusKind; r: number } & Gp) {
  return (
    <G {...g}>
      {kind === "influenza" && <Influenza r={r} />}
      {kind === "coronavirus" && <Coronavirus r={r} />}
      {kind === "rinovirus" && <Icosahedral r={r} cups={false} />}
      {kind === "norovirus" && <Icosahedral r={r} cups />}
      {kind === "herpesvirus" && <Herpesvirus r={r} />}
    </G>
  );
}

function Influenza({ r }: { r: number }) {
  const env = r * 0.74;
  const n = 16;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = (i * TAU) / n;
        const [x1, y1] = polar(0, 0, env, a);
        const [x2, y2] = polar(0, 0, r * 0.98, a);
        const ha = i % 2 === 0;
        return (
          <G key={i}>
            <Line x1={fmt(x1)} y1={fmt(y1)} x2={fmt(x2)} y2={fmt(y2)} stroke={ha ? C.spike : C.spikeSoft} strokeWidth={r * (ha ? 0.13 : 0.08)} strokeLinecap="round" />
            {ha ? (
              <Circle cx={fmt(x2)} cy={fmt(y2)} r={r * 0.09} fill={C.spike} />
            ) : (
              <Rect x={fmt(x2 - r * 0.08)} y={fmt(y2 - r * 0.08)} width={r * 0.16} height={r * 0.16} rx={r * 0.03} fill={C.spikeSoft} />
            )}
          </G>
        );
      })}
      <Circle r={env} fill={C.virus} stroke={C.virusDark} strokeWidth={r * 0.08} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const [x, y] = polar(0, 0, env * 0.45, (i * TAU) / 8 + 0.3);
        return <Ellipse key={i} cx={fmt(x)} cy={fmt(y)} rx={r * 0.14} ry={r * 0.06} transform={`rotate(${i * 45} ${fmt(x)} ${fmt(y)})`} fill={C.capsid} opacity={0.85} />;
      })}
    </>
  );
}

function Coronavirus({ r }: { r: number }) {
  const env = r * 0.7;
  const n = 12;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = (i * TAU) / n + 0.13;
        const [x1, y1] = polar(0, 0, env, a);
        const [x2, y2] = polar(0, 0, r * 0.86, a);
        const deg = (a * 180) / Math.PI;
        return (
          <G key={i}>
            <Line x1={fmt(x1)} y1={fmt(y1)} x2={fmt(x2)} y2={fmt(y2)} stroke={C.spike} strokeWidth={r * 0.07} />
            <Ellipse cx={fmt(x2)} cy={fmt(y2)} rx={r * 0.13} ry={r * 0.09} transform={`rotate(${fmt(deg)} ${fmt(x2)} ${fmt(y2)})`} fill={C.spike} />
          </G>
        );
      })}
      <Circle r={env} fill={C.virus} stroke={C.virusDark} strokeWidth={r * 0.07} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const [x, y] = polar(0, 0, env * 0.62, (i * TAU) / 6);
        return <Circle key={i} cx={fmt(x)} cy={fmt(y)} r={r * 0.07} fill={C.spikeSoft} />;
      })}
      <Circle r={r * 0.2} fill={C.capsid} opacity={0.7} />
    </>
  );
}

function Icosahedral({ r, cups }: { r: number; cups: boolean }) {
  const pts = polygon(0, 0, r, 6, Math.PI / 6);
  return (
    <>
      <Polygon points={pts} fill={cups ? C.virus : C.virusDark} stroke={C.virusDark} strokeWidth={r * 0.1} strokeLinejoin="round" />
      {Array.from({ length: 6 }, (_, i) => {
        const [x, y] = polar(0, 0, r, Math.PI / 6 + (i * TAU) / 6);
        return <Line key={i} x1={0} y1={0} x2={fmt(x)} y2={fmt(y)} stroke={C.capsid} strokeWidth={r * 0.07} opacity={0.8} />;
      })}
      {cups ? (
        Array.from({ length: 6 }, (_, i) => {
          const [x, y] = polar(0, 0, r * 0.62, (i * TAU) / 6);
          return <Circle key={i} cx={fmt(x)} cy={fmt(y)} r={r * 0.17} fill={C.capsid} stroke={C.virusDark} strokeWidth={r * 0.05} />;
        })
      ) : (
        <Polygon points={polygon(0, 0, r * 0.38, 5, -Math.PI / 2)} fill={C.spikeSoft} opacity={0.9} />
      )}
    </>
  );
}

function Herpesvirus({ r }: { r: number }) {
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i * TAU) / 10;
        const [x1, y1] = polar(0, 0, r * 0.9, a);
        const [x2, y2] = polar(0, 0, r * 1.02, a);
        return <Line key={i} x1={fmt(x1)} y1={fmt(y1)} x2={fmt(x2)} y2={fmt(y2)} stroke={C.spike} strokeWidth={r * 0.07} strokeLinecap="round" />;
      })}
      <Circle r={r * 0.9} fill={C.capsid} stroke={C.virusDark} strokeWidth={r * 0.06} />
      <Circle r={r * 0.72} fill="none" stroke={C.spikeSoft} strokeWidth={r * 0.1} strokeDasharray={[r * 0.08, r * 0.08]} />
      <Polygon points={polygon(0, 0, r * 0.55, 6, Math.PI / 6)} fill={C.virus} stroke={C.virusDark} strokeWidth={r * 0.06} />
      <Path
        d={`M${fmt(-r * 0.3)} 0 C ${fmt(-r * 0.3)} ${fmt(-r * 0.32)} ${fmt(r * 0.3)} ${fmt(-r * 0.32)} ${fmt(r * 0.3)} 0 S ${fmt(-r * 0.18)} ${fmt(r * 0.3)} ${fmt(-r * 0.1)} ${fmt(r * 0.05)}`}
        fill="none"
        stroke={C.capsid}
        strokeWidth={r * 0.06}
      />
    </>
  );
}

/* --------------------------------------------------------------- BATTERI */

export function Bacillus({ len = 32, ...g }: { len?: number } & Gp) {
  const h = len * 0.42;
  return (
    <G {...g}>
      <Path d={`M${len / 2} 0 c 6 -4 8 4 14 0 s 8 4 14 0`} fill="none" stroke={C.gramNegDark} strokeWidth={0.8} opacity={0.8} />
      <Path d={`M${len / 2 - 2} 3 c 6 3 9 -3 15 1 s 8 -3 13 1`} fill="none" stroke={C.gramNegDark} strokeWidth={0.8} opacity={0.6} />
      {Array.from({ length: 9 }, (_, i) => {
        const x = -len / 2 + 4 + (i * (len - 8)) / 8;
        return <Line key={i} x1={x} y1={-h / 2} x2={x + (i % 2 ? 1 : -1)} y2={-h / 2 - 2.6} stroke={C.gramNegDark} strokeWidth={0.6} />;
      })}
      <Rect x={-len / 2} y={-h / 2} width={len} height={h} rx={h / 2} fill={C.gramNeg} stroke={C.gramNegDark} strokeWidth={1} />
      <Path d={`M${-len / 4} 0 q 3 -3 6 0 t 6 0 t 6 0`} fill="none" stroke="#f3b3c6" strokeWidth={1} />
    </G>
  );
}

/**
 * Centro del riquadro di un bacillo con i flagelli. Nella web app motion e le classi idle-* ruotano e
 * scalano intorno al centro del riquadro dell'elemento (transform-box: fill-box): qui serve saperlo.
 */
export function bacillusCenter(len: number): [number, number] {
  const top = -(len * 0.21 + 2.6);
  const bottom = Math.max(len * 0.21, 5.3);
  return [14, fmt((top + bottom) / 2)];
}

/** Centro del riquadro di una catena di streptococchi (vedi bacillusCenter) */
export function streptococcusCenter(n: number, r: number): [number, number] {
  const ys = Array.from({ length: n }, (_, i) => Math.sin(i * 0.9) * r * 0.6);
  return [fmt(((n - 1) * r * 1.85) / 2), fmt((Math.min(...ys) + Math.max(...ys)) / 2)];
}

export function Streptococcus({ n = 6, r = 4.6, ...g }: { n?: number; r?: number } & Gp) {
  return (
    <G {...g}>
      {Array.from({ length: n }, (_, i) => {
        const x = i * r * 1.85;
        const y = Math.sin(i * 0.9) * r * 0.6;
        return (
          <G key={i}>
            <Circle cx={x} cy={y} r={r} fill={C.gramPos} stroke={C.gramPosDark} strokeWidth={0.8} />
            <Line x1={x} y1={y - r * 0.8} x2={x} y2={y + r * 0.8} stroke={C.gramPosDark} strokeWidth={0.5} opacity={0.6} />
          </G>
        );
      })}
    </G>
  );
}

/* ----------------------------------------------- ACARO, POLLINE, MUFFA */

export function Mite({ ...g }: Gp) {
  const legs = [
    { y: -9, a: -1 },
    { y: -3, a: -0.4 },
    { y: 4, a: 0.4 },
    { y: 9, a: 1 },
  ];
  return (
    <G {...g}>
      {legs.flatMap((l, i) =>
        [-1, 1].map((side) => {
          const x0 = side * 15;
          const x1 = side * 27;
          const y1 = l.y + l.a * 7;
          const x2 = side * 34;
          const y2 = l.y + l.a * 14 + 3;
          // Le zampe oscillano intorno al centro del loro riquadro, sfasate come nella web app
          const ox = (Math.min(x0, x1, x2) + Math.max(x0, x1, x2)) / 2;
          const oy = (Math.min(l.y, y1, y2) + Math.max(l.y, y1, y2)) / 2;
          return (
            <Idle key={`${i}${side}`} kind="wiggle" pivot={[ox, oy]} delay={-i * 0.3}>
              <Path d={`M${x0} ${l.y} L${x1} ${y1} L${x2} ${y2}`} fill="none" stroke={C.miteDark} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              <Circle cx={x1} cy={y1} r={1.2} fill={C.miteDark} />
            </Idle>
          );
        }),
      )}
      <Path d="M-5 -19 L0 -27 L5 -19 Z" fill={C.miteDark} />
      <Ellipse cx={0} cy={0} rx={19} ry={21} fill={C.mite} stroke={C.miteDark} strokeWidth={1.4} />
      {[-12, -6, 0, 6, 12].map((y) => (
        <Path key={y} d={`M-14 ${y} Q0 ${y + 4} 14 ${y}`} fill="none" stroke={C.miteDark} strokeWidth={0.6} opacity={0.55} />
      ))}
      {[-8, 8].map((x) =>
        [-14, 15].map((y) => <Line key={`${x}${y}`} x1={x} y1={y} x2={x * 1.5} y2={y + (y > 0 ? 6 : -6)} stroke={C.miteDark} strokeWidth={0.6} />),
      )}
    </G>
  );
}

export function Pollen({ r = 20, ...g }: { r?: number } & Gp) {
  const n = 26;
  const rand = rng(7);
  const dots = Array.from({ length: 14 }, () => polar(0, 0, r * 0.82 * Math.sqrt(rand()), rand() * TAU));
  return (
    <G {...g}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i * TAU) / n;
        const [x1, y1] = polar(0, 0, r * 0.98, a - 0.07);
        const [x2, y2] = polar(0, 0, r * 1.22, a);
        const [x3, y3] = polar(0, 0, r * 0.98, a + 0.07);
        return <Polygon key={i} points={`${fmt(x1)},${fmt(y1)} ${fmt(x2)},${fmt(y2)} ${fmt(x3)},${fmt(y3)}`} fill={C.pollenDark} />;
      })}
      <Circle r={r} fill={C.pollen} stroke={C.pollenDark} strokeWidth={r * 0.06} />
      {[0, 1, 2].map((i) => {
        const [x, y] = polar(0, 0, r * 0.55, (i * TAU) / 3 - 0.4);
        return <Ellipse key={i} cx={fmt(x)} cy={fmt(y)} rx={r * 0.16} ry={r * 0.11} fill="#f3d58f" stroke={C.pollenDark} strokeWidth={r * 0.03} />;
      })}
      {dots.map(([x, y], i) => (
        <Circle key={`d${i}`} cx={fmt(x)} cy={fmt(y)} r={r * 0.035} fill={C.pollenDark} opacity={0.5} />
      ))}
    </G>
  );
}

export function Mould({ ...g }: Gp) {
  return (
    <G {...g}>
      <Path d="M-60 30 C-40 20 -20 28 0 18 S 40 0 62 6" fill="none" stroke={C.hypha} strokeWidth={3} strokeLinecap="round" />
      <Path d="M-20 25 C-18 10 -8 0 -4 -14" fill="none" stroke={C.hypha} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M22 10 C26 -2 34 -10 40 -22" fill="none" stroke={C.hypha} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M-44 24 C-48 12 -46 2 -40 -8" fill="none" stroke={C.hypha} strokeWidth={2.2} strokeLinecap="round" />
      {[
        { x: -4, y: -14, a: -80 },
        { x: 40, y: -22, a: -60 },
        { x: -40, y: -8, a: -100 },
      ].map((c, ci) =>
        [0, 1, 2].map((k) => {
          const rad = (c.a * Math.PI) / 180;
          const x = c.x + Math.cos(rad) * (6 + k * 11);
          const y = c.y + Math.sin(rad) * (6 + k * 11);
          return (
            <G key={`${ci}${k}`} transform={`translate(${fmt(x)} ${fmt(y)}) rotate(${c.a + 90})`}>
              <Ellipse rx={4.4} ry={6.2} fill={C.spore} stroke="#4d3f5a" strokeWidth={0.7} />
              <Line x1={-4} y1={-1.5} x2={4} y2={-1.5} stroke="#4d3f5a" strokeWidth={0.5} />
              <Line x1={-4} y1={2} x2={4} y2={2} stroke="#4d3f5a" strokeWidth={0.5} />
              <Line x1={0} y1={-5.5} x2={0} y2={5.5} stroke="#4d3f5a" strokeWidth={0.5} />
            </G>
          );
        }),
      )}
    </G>
  );
}

/* ------------------------------------------------ CELLULE E MOLECOLE */

export function Antibody({ s = 1, color = C.antibody, ...g }: { s?: number; color?: string } & Gp) {
  return (
    <G {...g}>
      <Path
        d={`M0 ${6 * s} V0 M0 0 L${-4.5 * s} ${-5 * s} M0 0 L${4.5 * s} ${-5 * s}`}
        fill="none"
        stroke={color}
        strokeWidth={1.8 * s}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  );
}

export function RedCell({ r = 14, pale = false, ...g }: { r?: number; pale?: boolean } & Gp) {
  return (
    <G {...g}>
      <Circle r={r} fill={pale ? C.rbcPale : C.rbc} stroke={pale ? "#e48c95" : C.rbcRim} strokeWidth={r * 0.08} />
      <Circle r={r * (pale ? 0.62 : 0.45)} fill={pale ? "#fbe1e3" : C.rbcCenter} opacity={0.9} />
    </G>
  );
}

export function WhiteCell({ r = 26, lobeShift = 0, ...g }: { r?: number; lobeShift?: number } & Gp) {
  const lobes: [number, number][] = [
    [-0.32, -0.12],
    [0.02, -0.3],
    [0.3, -0.05],
    [0.05, 0.25],
  ];
  const shifted = lobes.map(([x, y]) => [x + lobeShift, y] as [number, number]);
  const rand = rng(31);
  const dots = Array.from({ length: 18 }, () => polar(0, 0, r * 0.85 * Math.sqrt(rand()), rand() * TAU));
  return (
    <G {...g}>
      <Circle r={r} fill={C.whiteCell} stroke={C.whiteCellEdge} strokeWidth={r * 0.06} />
      {dots.map(([x, y], i) => (
        <Circle key={i} cx={fmt(x)} cy={fmt(y)} r={r * 0.035} fill={C.whiteCellEdge} />
      ))}
      <Path
        d={shifted.map(([x, y], i) => `${i ? "L" : "M"}${fmt(x * r)} ${fmt(y * r)}`).join(" ")}
        stroke={C.whiteNucleus}
        strokeWidth={r * 0.1}
        fill="none"
        strokeLinejoin="round"
      />
      {shifted.map(([x, y], i) => (
        <Circle key={i} cx={fmt(x * r)} cy={fmt(y * r)} r={r * 0.2} fill={C.whiteNucleus} />
      ))}
    </G>
  );
}

export function MastCell({ r = 38, ...g }: { r?: number } & Gp) {
  const rand = rng(101);
  const granules = Array.from({ length: 44 }, () => {
    const rr = r * (0.42 + 0.48 * Math.sqrt(rand()));
    return polar(0, 0, rr, rand() * TAU);
  });
  return (
    <G {...g}>
      <Circle r={r} fill={C.mast} stroke={C.eosin} strokeWidth={r * 0.04} />
      <Ellipse cx={r * -0.1} cy={r * 0.05} rx={r * 0.32} ry={r * 0.26} fill={C.nucleus} opacity={0.9} />
      {granules.map(([x, y], i) => (
        <Circle key={i} cx={fmt(x)} cy={fmt(y)} r={r * 0.06} fill={C.granule} opacity={0.85} />
      ))}
    </G>
  );
}

/** Cellula di tessuto vista al microscopio (citoplasma rosa, nucleo viola) */
export function TissueCell({ rx = 12, ry = 8, rot = 0, fill = C.cytoplasm, ...g }: { rx?: number; ry?: number; rot?: number; fill?: string } & Gp) {
  return (
    <G {...g}>
      <Ellipse rx={rx} ry={ry} transform={`rotate(${rot})`} fill={fill} stroke={C.eosin} strokeWidth={0.7} />
      <Ellipse rx={rx * 0.36} ry={ry * 0.42} transform={`rotate(${rot})`} fill={C.nucleus} opacity={0.85} />
    </G>
  );
}

export function Droplet({ s = 1, color = C.water, ...g }: { s?: number; color?: string } & Gp) {
  return (
    <G {...g}>
      <Path d={`M0 ${-4 * s} C ${2.6 * s} ${-0.6 * s} ${3 * s} ${1.4 * s} 0 ${3.4 * s} C ${-3 * s} ${1.4 * s} ${-2.6 * s} ${-0.6 * s} 0 ${-4 * s} Z`} fill={color} />
    </G>
  );
}

/** Piccola icona di un fattore scatenante (sole, fulmine dello stress, fumo, freddo) */
export function TriggerIcon({ kind, ...g }: { kind: "sole" | "stress" | "fumo" | "freddo" | "luna" } & Gp) {
  return (
    <G {...g}>
      <Circle r={9} fill="#ffffff" stroke={C.inkSoft} strokeWidth={0.8} opacity={0.95} />
      {kind === "sole" && (
        <G stroke={C.pollenDark} strokeWidth={1.2} strokeLinecap="round">
          <Circle r={3.4} fill={C.pollen} stroke="none" />
          {Array.from({ length: 8 }, (_, i) => {
            const [x1, y1] = polar(0, 0, 5, (i * TAU) / 8);
            const [x2, y2] = polar(0, 0, 6.8, (i * TAU) / 8);
            return <Line key={i} x1={fmt(x1)} y1={fmt(y1)} x2={fmt(x2)} y2={fmt(y2)} />;
          })}
        </G>
      )}
      {kind === "stress" && <Path d="M1.5 -6 L-3 0.5 H0.5 L-1.5 6 L3.5 -1 H0 Z" fill={C.eosinDark} />}
      {kind === "fumo" && <Path d="M-4 4 C-6 1 -2 -1 -3 -4 M1 4 C-1 1 3 -1 2 -4 M5 4 C3 1 7 -1 6 -4" fill="none" stroke={C.inkSoft} strokeWidth={1.2} strokeLinecap="round" />}
      {kind === "freddo" && (
        <G stroke={C.waterDeep} strokeWidth={1.1} strokeLinecap="round">
          <Line x1={0} y1={-6} x2={0} y2={6} />
          <Line x1={-5.2} y1={-3} x2={5.2} y2={3} />
          <Line x1={-5.2} y1={3} x2={5.2} y2={-3} />
        </G>
      )}
      {kind === "luna" && <Path d="M3 -5.2 A6 6 0 1 0 3 5.2 A5.3 5.3 0 0 1 3 -5.2 Z" fill={C.nucleus} />}
    </G>
  );
}

/** Disco bianco che fa da sfondo a una piccola icona (fattore scatenante, consiglio, segnale) */
export function IconDisc({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Circle r={9} fill="#ffffff" stroke={C.inkSoft} strokeWidth={0.8} opacity={0.95} />
      {children}
    </G>
  );
}

/** Freccia dritta con punta, da `from` a `to`; con `flow` il tratto scorre come nella web app (idle-flow) */
export function Arrow({
  from,
  to,
  via,
  color = C.inkSoft,
  width = 1.4,
  head = 3.2,
  flow,
}: {
  from: [number, number];
  to: [number, number];
  /** Punto di controllo: se c'è, la freccia è curva */
  via?: [number, number];
  color?: string;
  width?: number;
  head?: number;
  flow?: "flow" | "flow-slow";
}) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const [bx, by] = via ?? from;
  const a = Math.atan2(y2 - by, x2 - bx);
  const h1 = [x2 - head * Math.cos(a - 0.5), y2 - head * Math.sin(a - 0.5)].map(fmt);
  const h2 = [x2 - head * Math.cos(a + 0.5), y2 - head * Math.sin(a + 0.5)].map(fmt);
  const line = via ? `M${x1} ${y1} Q ${via[0]} ${via[1]} ${x2} ${y2}` : `M${x1} ${y1} L${x2} ${y2}`;
  const props = {
    d: `${line} M${h1[0]} ${h1[1]} L${x2} ${y2} L${h2[0]} ${h2[1]}`,
    fill: "none",
    stroke: color,
    strokeWidth: width,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  return flow ? <FlowPath {...props} slow={flow === "flow-slow"} /> : <Path {...props} />;
}

/** Etichetta di testo dentro la scena (per orientarsi: «parete della vescica», «polmone»…) */
export function SceneLabel({ x, y, children, anchor = "middle" }: { x: number; y: number; children: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <SvgLabel x={x} y={y} anchor={anchor} size={7} bold halo fill={C.label}>
      {children}
    </SvgLabel>
  );
}
