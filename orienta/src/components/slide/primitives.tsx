/**
 * Elementi grafici riutilizzabili delle scene: agenti (virus, batteri, acari, pollini, funghi),
 * cellule e molecole. Disegni stilizzati e originali, coordinate nel viewBox 200×200.
 */
import type { ReactNode, SVGProps } from "react";
import type { VirusKind } from "@/lib/slides/catalog";
import { C } from "./palette";

const TAU = Math.PI * 2;

/** Generatore pseudo-casuale deterministico: stesse posizioni a ogni render (niente hydration mismatch) */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function polar(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function fmt(n: number) {
  return Math.round(n * 100) / 100;
}

function polygon(cx: number, cy: number, r: number, n: number, rot = 0) {
  return Array.from({ length: n }, (_, i) => polar(cx, cy, r, rot + (i * TAU) / n).map(fmt).join(",")).join(" ");
}

type G = SVGProps<SVGGElement>;

/* ------------------------------------------------------------------ VIRUS */

export function Virus({ kind, r, ...g }: { kind: VirusKind; r: number } & G) {
  return (
    <g {...g}>
      {kind === "influenza" && <Influenza r={r} />}
      {kind === "coronavirus" && <Coronavirus r={r} />}
      {kind === "rinovirus" && <Icosahedral r={r} cups={false} />}
      {kind === "norovirus" && <Icosahedral r={r} cups />}
      {kind === "herpesvirus" && <Herpesvirus r={r} />}
    </g>
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
          <g key={i}>
            <line x1={fmt(x1)} y1={fmt(y1)} x2={fmt(x2)} y2={fmt(y2)} stroke={ha ? C.spike : C.spikeSoft} strokeWidth={r * (ha ? 0.13 : 0.08)} strokeLinecap="round" />
            {ha ? (
              <circle cx={fmt(x2)} cy={fmt(y2)} r={r * 0.09} fill={C.spike} />
            ) : (
              <rect x={fmt(x2 - r * 0.08)} y={fmt(y2 - r * 0.08)} width={r * 0.16} height={r * 0.16} rx={r * 0.03} fill={C.spikeSoft} />
            )}
          </g>
        );
      })}
      <circle r={env} fill={C.virus} stroke={C.virusDark} strokeWidth={r * 0.08} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const [x, y] = polar(0, 0, env * 0.45, (i * TAU) / 8 + 0.3);
        return <ellipse key={i} cx={fmt(x)} cy={fmt(y)} rx={r * 0.14} ry={r * 0.06} transform={`rotate(${i * 45} ${fmt(x)} ${fmt(y)})`} fill={C.capsid} opacity="0.85" />;
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
          <g key={i}>
            <line x1={fmt(x1)} y1={fmt(y1)} x2={fmt(x2)} y2={fmt(y2)} stroke={C.spike} strokeWidth={r * 0.07} />
            <ellipse cx={fmt(x2)} cy={fmt(y2)} rx={r * 0.13} ry={r * 0.09} transform={`rotate(${fmt(deg)} ${fmt(x2)} ${fmt(y2)})`} fill={C.spike} />
          </g>
        );
      })}
      <circle r={env} fill={C.virus} stroke={C.virusDark} strokeWidth={r * 0.07} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const [x, y] = polar(0, 0, env * 0.62, (i * TAU) / 6);
        return <circle key={i} cx={fmt(x)} cy={fmt(y)} r={r * 0.07} fill={C.spikeSoft} />;
      })}
      <circle r={r * 0.2} fill={C.capsid} opacity="0.7" />
    </>
  );
}

function Icosahedral({ r, cups }: { r: number; cups: boolean }) {
  const pts = polygon(0, 0, r, 6, Math.PI / 6);
  return (
    <>
      <polygon points={pts} fill={cups ? C.virus : C.virusDark} stroke={C.virusDark} strokeWidth={r * 0.1} strokeLinejoin="round" />
      {Array.from({ length: 6 }, (_, i) => {
        const [x, y] = polar(0, 0, r, Math.PI / 6 + (i * TAU) / 6);
        return <line key={i} x1="0" y1="0" x2={fmt(x)} y2={fmt(y)} stroke={C.capsid} strokeWidth={r * 0.07} opacity="0.8" />;
      })}
      {cups
        ? Array.from({ length: 6 }, (_, i) => {
            const [x, y] = polar(0, 0, r * 0.62, (i * TAU) / 6);
            return <circle key={i} cx={fmt(x)} cy={fmt(y)} r={r * 0.17} fill={C.capsid} stroke={C.virusDark} strokeWidth={r * 0.05} />;
          })
        : <polygon points={polygon(0, 0, r * 0.38, 5, -Math.PI / 2)} fill={C.spikeSoft} opacity="0.9" />}
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
        return <line key={i} x1={fmt(x1)} y1={fmt(y1)} x2={fmt(x2)} y2={fmt(y2)} stroke={C.spike} strokeWidth={r * 0.07} strokeLinecap="round" />;
      })}
      <circle r={r * 0.9} fill={C.capsid} stroke={C.virusDark} strokeWidth={r * 0.06} />
      <circle r={r * 0.72} fill="none" stroke={C.spikeSoft} strokeWidth={r * 0.1} strokeDasharray={`${r * 0.08} ${r * 0.08}`} />
      <polygon points={polygon(0, 0, r * 0.55, 6, Math.PI / 6)} fill={C.virus} stroke={C.virusDark} strokeWidth={r * 0.06} />
      <path
        d={`M${fmt(-r * 0.3)} 0 C ${fmt(-r * 0.3)} ${fmt(-r * 0.32)} ${fmt(r * 0.3)} ${fmt(-r * 0.32)} ${fmt(r * 0.3)} 0 S ${fmt(-r * 0.18)} ${fmt(r * 0.3)} ${fmt(-r * 0.1)} ${fmt(r * 0.05)}`}
        fill="none"
        stroke={C.capsid}
        strokeWidth={r * 0.06}
      />
    </>
  );
}

/* --------------------------------------------------------------- BATTERI */

export function Bacillus({ len = 32, ...g }: { len?: number } & G) {
  const h = len * 0.42;
  return (
    <g {...g}>
      <path d={`M${len / 2} 0 c 6 -4 8 4 14 0 s 8 4 14 0`} fill="none" stroke={C.gramNegDark} strokeWidth="0.8" opacity="0.8" />
      <path d={`M${len / 2 - 2} 3 c 6 3 9 -3 15 1 s 8 -3 13 1`} fill="none" stroke={C.gramNegDark} strokeWidth="0.8" opacity="0.6" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = -len / 2 + 4 + (i * (len - 8)) / 8;
        return <line key={i} x1={x} y1={-h / 2} x2={x + (i % 2 ? 1 : -1)} y2={-h / 2 - 2.6} stroke={C.gramNegDark} strokeWidth="0.6" />;
      })}
      <rect x={-len / 2} y={-h / 2} width={len} height={h} rx={h / 2} fill={C.gramNeg} stroke={C.gramNegDark} strokeWidth="1" />
      <path d={`M${-len / 4} 0 q 3 -3 6 0 t 6 0 t 6 0`} fill="none" stroke="#f3b3c6" strokeWidth="1" />
    </g>
  );
}

export function Streptococcus({ n = 6, r = 4.6, ...g }: { n?: number; r?: number } & G) {
  return (
    <g {...g}>
      {Array.from({ length: n }, (_, i) => {
        const x = i * r * 1.85;
        const y = Math.sin(i * 0.9) * r * 0.6;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={C.gramPos} stroke={C.gramPosDark} strokeWidth="0.8" />
            <line x1={x} y1={y - r * 0.8} x2={x} y2={y + r * 0.8} stroke={C.gramPosDark} strokeWidth="0.5" opacity="0.6" />
          </g>
        );
      })}
    </g>
  );
}

/* ----------------------------------------------- ACARO, POLLINE, MUFFA */

export function Mite({ ...g }: G) {
  const legs = [
    { y: -9, a: -1 },
    { y: -3, a: -0.4 },
    { y: 4, a: 0.4 },
    { y: 9, a: 1 },
  ];
  return (
    <g {...g}>
      {legs.flatMap((l, i) =>
        [-1, 1].map((side) => {
          const x0 = side * 15;
          const x1 = side * 27;
          const y1 = l.y + l.a * 7;
          const x2 = side * 34;
          const y2 = l.y + l.a * 14 + 3;
          return (
            <g key={`${i}${side}`} className="idle-wiggle" style={{ animationDelay: `${-i * 0.3}s` }}>
              <path d={`M${x0} ${l.y} L${x1} ${y1} L${x2} ${y2}`} fill="none" stroke={C.miteDark} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={x1} cy={y1} r="1.2" fill={C.miteDark} />
            </g>
          );
        }),
      )}
      <path d="M-5 -19 L0 -27 L5 -19 Z" fill={C.miteDark} />
      <ellipse cx="0" cy="0" rx="19" ry="21" fill={C.mite} stroke={C.miteDark} strokeWidth="1.4" />
      {[-12, -6, 0, 6, 12].map((y) => (
        <path key={y} d={`M-14 ${y} Q0 ${y + 4} 14 ${y}`} fill="none" stroke={C.miteDark} strokeWidth="0.6" opacity="0.55" />
      ))}
      {[-8, 8].map((x) =>
        [-14, 15].map((y) => <line key={`${x}${y}`} x1={x} y1={y} x2={x * 1.5} y2={y + (y > 0 ? 6 : -6)} stroke={C.miteDark} strokeWidth="0.6" />),
      )}
    </g>
  );
}

export function Pollen({ r = 20, ...g }: { r?: number } & G) {
  const n = 26;
  return (
    <g {...g}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i * TAU) / n;
        const [x1, y1] = polar(0, 0, r * 0.98, a - 0.07);
        const [x2, y2] = polar(0, 0, r * 1.22, a);
        const [x3, y3] = polar(0, 0, r * 0.98, a + 0.07);
        return <polygon key={i} points={`${fmt(x1)},${fmt(y1)} ${fmt(x2)},${fmt(y2)} ${fmt(x3)},${fmt(y3)}`} fill={C.pollenDark} />;
      })}
      <circle r={r} fill={C.pollen} stroke={C.pollenDark} strokeWidth={r * 0.06} />
      {[0, 1, 2].map((i) => {
        const [x, y] = polar(0, 0, r * 0.55, (i * TAU) / 3 - 0.4);
        return <ellipse key={i} cx={fmt(x)} cy={fmt(y)} rx={r * 0.16} ry={r * 0.11} fill="#f3d58f" stroke={C.pollenDark} strokeWidth={r * 0.03} />;
      })}
      {(() => {
        const rand = rng(7);
        return Array.from({ length: 14 }, (_, i) => {
          const [x, y] = polar(0, 0, r * 0.82 * Math.sqrt(rand()), rand() * TAU);
          return <circle key={`d${i}`} cx={fmt(x)} cy={fmt(y)} r={r * 0.035} fill={C.pollenDark} opacity="0.5" />;
        });
      })()}
    </g>
  );
}

export function Mould({ ...g }: G) {
  return (
    <g {...g}>
      <path d="M-60 30 C-40 20 -20 28 0 18 S 40 0 62 6" fill="none" stroke={C.hypha} strokeWidth="3" strokeLinecap="round" />
      <path d="M-20 25 C-18 10 -8 0 -4 -14" fill="none" stroke={C.hypha} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M22 10 C26 -2 34 -10 40 -22" fill="none" stroke={C.hypha} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M-44 24 C-48 12 -46 2 -40 -8" fill="none" stroke={C.hypha} strokeWidth="2.2" strokeLinecap="round" />
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
            <g key={`${ci}${k}`} transform={`translate(${fmt(x)} ${fmt(y)}) rotate(${c.a + 90})`}>
              <ellipse rx="4.4" ry="6.2" fill={C.spore} stroke="#4d3f5a" strokeWidth="0.7" />
              <line x1="-4" y1="-1.5" x2="4" y2="-1.5" stroke="#4d3f5a" strokeWidth="0.5" />
              <line x1="-4" y1="2" x2="4" y2="2" stroke="#4d3f5a" strokeWidth="0.5" />
              <line x1="0" y1="-5.5" x2="0" y2="5.5" stroke="#4d3f5a" strokeWidth="0.5" />
            </g>
          );
        }),
      )}
    </g>
  );
}

/* ------------------------------------------------ CELLULE E MOLECOLE */

export function Antibody({ s = 1, color = C.antibody, ...g }: { s?: number; color?: string } & G) {
  return (
    <g {...g}>
      <path
        d={`M0 ${6 * s} V0 M0 0 L${-4.5 * s} ${-5 * s} M0 0 L${4.5 * s} ${-5 * s}`}
        fill="none"
        stroke={color}
        strokeWidth={1.8 * s}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

export function RedCell({ r = 14, pale = false, ...g }: { r?: number; pale?: boolean } & G) {
  return (
    <g {...g}>
      <circle r={r} fill={pale ? C.rbcPale : C.rbc} stroke={pale ? "#e48c95" : C.rbcRim} strokeWidth={r * 0.08} />
      <circle r={r * (pale ? 0.62 : 0.45)} fill={pale ? "#fbe1e3" : C.rbcCenter} opacity="0.9" />
    </g>
  );
}

export function WhiteCell({ r = 26, lobeShift = 0, ...g }: { r?: number; lobeShift?: number } & G) {
  const lobes: [number, number][] = [
    [-0.32, -0.12],
    [0.02, -0.3],
    [0.3, -0.05],
    [0.05, 0.25],
  ];
  const shifted = lobes.map(([x, y]) => [x + lobeShift, y] as [number, number]);
  return (
    <g {...g}>
      <circle r={r} fill={C.whiteCell} stroke={C.whiteCellEdge} strokeWidth={r * 0.06} />
      {(() => {
        const rand = rng(31);
        return Array.from({ length: 18 }, (_, i) => {
          const [x, y] = polar(0, 0, r * 0.85 * Math.sqrt(rand()), rand() * TAU);
          return <circle key={i} cx={fmt(x)} cy={fmt(y)} r={r * 0.035} fill={C.whiteCellEdge} />;
        });
      })()}
      <path
        d={shifted.map(([x, y], i) => `${i ? "L" : "M"}${fmt(x * r)} ${fmt(y * r)}`).join(" ")}
        stroke={C.whiteNucleus}
        strokeWidth={r * 0.1}
        fill="none"
        strokeLinejoin="round"
      />
      {shifted.map(([x, y], i) => (
        <circle key={i} cx={fmt(x * r)} cy={fmt(y * r)} r={r * 0.2} fill={C.whiteNucleus} />
      ))}
    </g>
  );
}

export function MastCell({ r = 38, ...g }: { r?: number } & G) {
  return (
    <g {...g}>
      <circle r={r} fill={C.mast} stroke={C.eosin} strokeWidth={r * 0.04} />
      <ellipse cx={r * -0.1} cy={r * 0.05} rx={r * 0.32} ry={r * 0.26} fill={C.nucleus} opacity="0.9" />
      {(() => {
        const rand = rng(101);
        return Array.from({ length: 44 }, (_, i) => {
          const rr = r * (0.42 + 0.48 * Math.sqrt(rand()));
          const [x, y] = polar(0, 0, rr, rand() * TAU);
          return <circle key={i} cx={fmt(x)} cy={fmt(y)} r={r * 0.06} fill={C.granule} opacity="0.85" />;
        });
      })()}
    </g>
  );
}

/** Cellula di tessuto vista al microscopio (citoplasma rosa, nucleo viola) */
export function TissueCell({ rx = 12, ry = 8, rot = 0, fill = C.cytoplasm, ...g }: { rx?: number; ry?: number; rot?: number; fill?: string } & G) {
  return (
    <g {...g}>
      <ellipse rx={rx} ry={ry} transform={`rotate(${rot})`} fill={fill} stroke={C.eosin} strokeWidth="0.7" />
      <ellipse rx={rx * 0.36} ry={ry * 0.42} transform={`rotate(${rot})`} fill={C.nucleus} opacity="0.85" />
    </g>
  );
}

export function Droplet({ s = 1, color = C.water, ...g }: { s?: number; color?: string } & G) {
  return (
    <g {...g}>
      <path d={`M0 ${-4 * s} C ${2.6 * s} ${-0.6 * s} ${3 * s} ${1.4 * s} 0 ${3.4 * s} C ${-3 * s} ${1.4 * s} ${-2.6 * s} ${-0.6 * s} 0 ${-4 * s} Z`} fill={color} />
    </g>
  );
}

/** Piccola icona di un fattore scatenante (sole, fulmine dello stress, fumo, freddo) */
export function TriggerIcon({ kind, ...g }: { kind: "sole" | "stress" | "fumo" | "freddo" | "luna" } & G) {
  return (
    <g {...g}>
      <circle r="9" fill="#ffffff" stroke={C.inkSoft} strokeWidth="0.8" opacity="0.95" />
      {kind === "sole" && (
        <g stroke={C.pollenDark} strokeWidth="1.2" strokeLinecap="round">
          <circle r="3.4" fill={C.pollen} stroke="none" />
          {Array.from({ length: 8 }, (_, i) => {
            const [x1, y1] = polar(0, 0, 5, (i * TAU) / 8);
            const [x2, y2] = polar(0, 0, 6.8, (i * TAU) / 8);
            return <line key={i} x1={fmt(x1)} y1={fmt(y1)} x2={fmt(x2)} y2={fmt(y2)} />;
          })}
        </g>
      )}
      {kind === "stress" && <path d="M1.5 -6 L-3 0.5 H0.5 L-1.5 6 L3.5 -1 H0 Z" fill={C.eosinDark} />}
      {kind === "fumo" && <path d="M-4 4 C-6 1 -2 -1 -3 -4 M1 4 C-1 1 3 -1 2 -4 M5 4 C3 1 7 -1 6 -4" fill="none" stroke={C.inkSoft} strokeWidth="1.2" strokeLinecap="round" />}
      {kind === "freddo" && (
        <g stroke={C.waterDeep} strokeWidth="1.1" strokeLinecap="round">
          <line x1="0" y1="-6" x2="0" y2="6" />
          <line x1="-5.2" y1="-3" x2="5.2" y2="3" />
          <line x1="-5.2" y1="3" x2="5.2" y2="-3" />
        </g>
      )}
      {kind === "luna" && <path d="M3 -5.2 A6 6 0 1 0 3 5.2 A5.3 5.3 0 0 1 3 -5.2 Z" fill={C.nucleus} />}
    </g>
  );
}

/** Disco bianco che fa da sfondo a una piccola icona (fattore scatenante, consiglio, segnale) */
export function IconDisc({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="9" fill="#ffffff" stroke={C.inkSoft} strokeWidth="0.8" opacity="0.95" />
      {children}
    </g>
  );
}

/** Freccia dritta con punta, da `from` a `to` */
export function Arrow({
  from,
  to,
  via,
  color = C.inkSoft,
  width = 1.4,
  head = 3.2,
  className,
}: {
  from: [number, number];
  to: [number, number];
  /** Punto di controllo: se c'è, la freccia è curva */
  via?: [number, number];
  color?: string;
  width?: number;
  head?: number;
  className?: string;
}) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const [bx, by] = via ?? from;
  const a = Math.atan2(y2 - by, x2 - bx);
  const h1 = [x2 - head * Math.cos(a - 0.5), y2 - head * Math.sin(a - 0.5)].map(fmt);
  const h2 = [x2 - head * Math.cos(a + 0.5), y2 - head * Math.sin(a + 0.5)].map(fmt);
  const line = via ? `M${x1} ${y1} Q ${via[0]} ${via[1]} ${x2} ${y2}` : `M${x1} ${y1} L${x2} ${y2}`;
  return (
    <path
      d={`${line} M${h1[0]} ${h1[1]} L${x2} ${y2} L${h2[0]} ${h2[1]}`}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    />
  );
}

/** Etichetta di testo dentro la scena (per orientarsi: «parete della vescica», «polmone»…) */
export function SceneLabel({ x, y, children, anchor = "middle" }: { x: number; y: number; children: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize="7" fontWeight="700" className="slide-label slide-halo" fill={C.label}>
      {children}
    </text>
  );
}
