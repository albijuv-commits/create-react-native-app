"use client";

import { useId } from "react";
import { motion } from "motion/react";
import type { SceneParams } from "@/lib/slides/catalog";
import { BodyFigure, ZONE_CENTERS, ZoneShape, silhouetteShapes, zonesShapes } from "@/components/body-map/body-figure";
import { C } from "../palette";
import { Arrow, Droplet, IconDisc, SceneLabel, TriggerIcon } from "../primitives";
import { useScene } from "../scene-context";

/** La sagoma (riquadro 100×200) dentro l'oculare: spostamento e scala */
const FIG = { x: 62, y: 16, s: 0.76 };
const FIG_TRANSFORM = `translate(${FIG.x} ${FIG.y}) scale(${FIG.s})`;
const sx = (x: number) => FIG.x + x * FIG.s;
const sy = (y: number) => FIG.y + y * FIG.s;

function Silhouette({ id }: { id: string }) {
  return (
    <defs>
      <clipPath id={id}>
        {silhouetteShapes("fronte").map((s, i) => (
          <ZoneShape key={i} shape={s} />
        ))}
      </clipPath>
    </defs>
  );
}

/* ---------------------------------------------------------------------- CORPO */

export function Corpo({ params }: { params: SceneParams<"corpo"> }) {
  const { step, t, slow } = useScene();
  const view = params.vista;
  const shapes = zonesShapes(view, params.zone);
  const center = params.zone.map((z) => ZONE_CENTERS[z]).find((c) => c !== undefined) ?? [50, 100];
  const cx = sx(center[0]);
  const cy = sy(center[1]);
  const back = view === "retro" && params.zone.some((z) => z === "schiena-bassa" || z === "schiena-alta");
  const sciatica = view === "retro" && params.zone.includes("schiena-bassa");

  return (
    <g>
      <g transform={FIG_TRANSFORM}>
        <BodyFigure view={view} />
        {/* La zona: tranquilla, poi dolente, poi di nuovo calma */}
        <motion.g
          initial={false}
          animate={{ fill: [C.calm, C.highlightSoft, C.tissueInflamed, C.calm][step], opacity: [0.8, 0.9, 0.95, 0.6][step] }}
          transition={slow}
        >
          {shapes.map((s, i) => (
            <ZoneShape key={i} shape={s} stroke={C.label} strokeWidth="0.9" />
          ))}
        </motion.g>
        {back && (
          <>
            {/* Muscoli ai lati della colonna: si contraggono per proteggerla */}
            <motion.g
              initial={false}
              animate={{ fill: step === 2 ? C.muscleDark : C.muscle, opacity: [0.35, 0.55, 0.95, 0.4][step], scaleX: step === 2 ? 0.86 : 1 }}
              transition={slow}
            >
              <ellipse cx="45" cy="95" rx="3.8" ry="17" />
              <ellipse cx="55" cy="95" rx="3.8" ry="17" />
            </motion.g>
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x="48.3" y={47 + i * 5.6} width="3.4" height="4.4" rx="1.1" fill={C.bone} stroke={C.boneDark} strokeWidth="0.5" />
            ))}
          </>
        )}
        {/* Nervo sciatico irritato: il dolore scende lungo la gamba */}
        {sciatica && (
          <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
            <path d="M47 110 C 45 122 43.5 132 43 144 L 42.6 168 L 42.2 184" fill="none" stroke={C.nerve} strokeWidth="3.2" strokeLinecap="round" />
            <path d="M47 110 C 45 122 43.5 132 43 144 L 42.6 168 L 42.2 184" fill="none" stroke={C.nerveDark} strokeWidth="1.4" className="idle-flow" />
          </motion.g>
        )}
      </g>

      {/* Il peso del corpo che grava sulla schiena */}
      <motion.g initial={false} animate={{ opacity: back && step === 0 ? 1 : 0 }} transition={t}>
        <Arrow from={[sx(29), sy(30)]} to={[sx(29), sy(44)]} color={C.label} width={1.6} />
        <Arrow from={[sx(71), sy(30)]} to={[sx(71), sy(44)]} color={C.label} width={1.6} />
      </motion.g>

      {/* Cause: movimento brusco, sollevamento sbagliato, postura mantenuta a lungo */}
      <motion.g initial={false} animate={{ opacity: step === 1 ? 1 : 0 }} transition={t}>
        <g transform={`translate(${cx} ${cy})`} className="idle-pulse">
          <path d="M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z" fill={C.pollen} stroke={C.pollenDark} strokeWidth="0.8" />
        </g>
        {back && (
          <>
            <IconDisc x={38} y={80}>
              <rect x="-4.6" y="-1" width="9.2" height="6.4" rx="0.8" fill={C.bone} stroke={C.boneDark} strokeWidth="0.9" />
              <path d="M-4.6 1.6 H4.6" stroke={C.boneDark} strokeWidth="0.7" />
              <Arrow from={[0, -2.6]} to={[0, -7.4]} color={C.highlight} width={1.2} head={2.2} />
            </IconDisc>
            <IconDisc x={162} y={80}>
              <path d="M-3 -6 V2 H3.6 V6.6 M-3 2 V6.6 M-3 -1 H2.4" fill="none" stroke={C.inkSoft} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="5" cy="-5" r="2.6" fill="none" stroke={C.highlight} strokeWidth="0.9" />
              <path d="M5 -6.4 V-5 L6 -4.4" stroke={C.highlight} strokeWidth="0.8" fill="none" strokeLinecap="round" />
            </IconDisc>
          </>
        )}
      </motion.g>

      {/* Dolore che si accende */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        <g className="idle-pulse">
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
            return (
              <line
                key={i}
                x1={(cx + Math.cos(a) * 15).toFixed(1)}
                y1={(cy + Math.sin(a) * 15).toFixed(1)}
                x2={(cx + Math.cos(a) * 21).toFixed(1)}
                y2={(cy + Math.sin(a) * 21).toFixed(1)}
                stroke={C.highlight}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            );
          })}
        </g>
        {sciatica && <SceneLabel x={86} y={152} anchor="end">nervo sciatico</SceneLabel>}
      </motion.g>

      {/* Muoversi con gradualità */}
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <Arrow from={[64, cy - 18]} via={[50, cy]} to={[64, cy + 18]} color={C.label} width={1.5} />
        <Arrow from={[136, cy + 18]} via={[150, cy]} to={[136, cy - 18]} color={C.label} width={1.5} />
        <IconDisc x={160} y={52}>
          <circle cx="0.8" cy="-5.2" r="1.7" fill={C.label} />
          <path d="M0.4 -3 L-0.6 1.6 L-3 6 M-0.6 1.6 L2.4 6 M0.2 -2.2 L-3.2 0.4 M0.2 -2.2 L3.2 0" stroke={C.label} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </IconDisc>
      </motion.g>
    </g>
  );
}

/* ------------------------------------------------------------ BILANCIO ACQUA */

/** Livello dell'acqua nella sagoma (coordinate della sagoma, 0 in alto) */
const WATER_LEVEL = [76, 104, 108, 78];
/** Superficie dell'acqua: onde di periodo 26, così lo scorrimento continuo non si vede ripartire */
const WAVE = `M-52 0 ${"q 6.5 -2.2 13 0 q 6.5 2.2 13 0 ".repeat(8)}L156 130 L-52 130 Z`;

function Glass({ full = true }: { full?: boolean }) {
  return (
    <>
      {full && <path d="M-3.2 -1.2 L-2.5 5 H2.5 L3.2 -1.2 Z" fill={C.water} />}
      <path d="M-3.8 -5.4 L-2.6 5.2 H2.6 L3.8 -5.4" fill="none" stroke={C.waterDeep} strokeWidth="1" strokeLinejoin="round" />
    </>
  );
}

export function BilancioAcqua() {
  const { step, t, slow } = useScene();
  const clip = useId();
  const losing = step === 1 || step === 2;
  const outflow = losing ? { color: C.highlight, width: 2.4 } : { color: C.inkSoft, width: 1.3 };
  const inflow = step === 3 ? { color: C.waterDeep, width: 2.4 } : { color: C.inkSoft, width: 1.3 };

  return (
    <g>
      <g transform={FIG_TRANSFORM}>
        <Silhouette id={clip} />
        <BodyFigure view="fronte" />
        <g clipPath={`url(#${clip})`}>
          <motion.g initial={false} animate={{ y: WATER_LEVEL[step] }} transition={slow}>
            <g className="idle-stream">
              <path d={WAVE} fill={C.water} stroke={C.waterDeep} strokeWidth="1" opacity="0.85" />
            </g>
          </motion.g>
          {/* Livello normale, per confronto */}
          <motion.path
            d="M0 76 H100"
            stroke={C.waterDeep}
            strokeWidth="1"
            strokeDasharray="3 2.4"
            initial={false}
            animate={{ opacity: step === 0 ? 0 : 0.9 }}
            transition={t}
          />
        </g>
      </g>

      {/* Entrate: bevande e cibi */}
      <motion.g initial={false} animate={{ opacity: losing ? 0.35 : 1 }} transition={t}>
        <IconDisc x={40} y={100}>
          <Glass />
        </IconDisc>
        <IconDisc x={40} y={126}>
          <motion.g initial={false} animate={{ opacity: step === 3 ? 0 : 1 }} transition={t}>
            <path d="M0 -2.6 C 3 -4.8 6 -2 5 2 C 4 5 1.4 6 0 5 C -1.4 6 -4 5 -5 2 C -6 -2 -3 -4.8 0 -2.6 Z" fill={C.rbc} />
            <path d="M0 -2.6 C 0 -4 0.6 -5.4 1.6 -6" stroke={C.miteDark} strokeWidth="0.9" fill="none" strokeLinecap="round" />
          </motion.g>
          {/* Soluzione reidratante */}
          <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
            <path d="M-4.4 -5 L-3.2 -6 L-2 -5 L-0.8 -6 L0.4 -5 L1.6 -6 L2.8 -5 L4.4 -6 V5.6 H-4.4 Z" fill={C.air} stroke={C.waterDeep} strokeWidth="0.9" strokeLinejoin="round" />
            <path d="M0 -2 V3.4 M-2.7 0.7 H2.7" stroke={C.waterDeep} strokeWidth="1.3" strokeLinecap="round" />
          </motion.g>
        </IconDisc>
      </motion.g>
      <Arrow from={[51, 100]} to={[68, 100]} color={inflow.color} width={inflow.width} />
      <Arrow from={[51, 126]} to={[68, 124]} color={inflow.color} width={inflow.width} />

      {/* Uscite: sudore, respiro, urina */}
      <IconDisc x={160} y={74}>
        <Droplet s={0.9} color={C.waterDeep} transform="translate(-2.6 -1.4)" />
        <Droplet s={0.9} color={C.waterDeep} transform="translate(2.8 1.8)" />
      </IconDisc>
      <IconDisc x={160} y={100}>
        <path d="M-5 -3 q 2.5 -2 5 0 t 5 0 M-5 1 q 2.5 -2 5 0 t 5 0 M-5 5 q 2.5 -2 5 0 t 5 0" fill="none" stroke={C.inkSoft} strokeWidth="1.1" strokeLinecap="round" />
      </IconDisc>
      <IconDisc x={160} y={126}>
        <motion.path
          d="M0 -5.6 C 3.6 -0.8 4.2 2 0 4.8 C -4.2 2 -3.6 -0.8 0 -5.6 Z"
          initial={false}
          animate={{ fill: step === 2 ? "#b77a12" : "#f0d36a" }}
          transition={slow}
        />
      </IconDisc>
      <Arrow from={[132, 74]} to={[149, 74]} color={outflow.color} width={outflow.width} />
      <Arrow from={[132, 100]} to={[149, 100]} color={outflow.color} width={outflow.width} />
      <Arrow from={[132, 126]} to={[149, 126]} color={outflow.color} width={outflow.width} />

      {/* Caldo e malattie aumentano le perdite */}
      <motion.g initial={false} animate={{ opacity: losing ? 1 : 0 }} transition={t}>
        <TriggerIcon kind="sole" transform="translate(148 46)" />
      </motion.g>

      {/* Segnali: sete e capogiri */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        <IconDisc x={68} y={34}>
          <Glass full={false} />
        </IconDisc>
        <circle cx="78.5" cy="41" r="1.8" fill="#ffffff" stroke={C.inkSoft} strokeWidth="0.6" />
        <circle cx="83.5" cy="44" r="1.2" fill="#ffffff" stroke={C.inkSoft} strokeWidth="0.6" />
        <g transform="translate(124 28)">
          <path d="M0 0 m -1 0 a 1 1 0 1 1 2 0 a 2.2 2.2 0 1 1 -4.4 0 a 3.4 3.4 0 1 1 6.8 0" fill="none" stroke={C.label} strokeWidth="1.1" strokeLinecap="round" className="idle-spin" style={{ animationDuration: "3s" }} />
        </g>
      </motion.g>

      {/* Piccoli sorsi */}
      <motion.path
        d="M44 92 C 44 62 70 42 92 40"
        fill="none"
        stroke={C.waterDeep}
        strokeWidth="1.6"
        className="idle-flow"
        initial={false}
        animate={{ opacity: step === 3 ? 1 : 0 }}
        transition={t}
      />
    </g>
  );
}

/* ---------------------------------------------------------- TERMOREGOLAZIONE */

const TEMPS = ["37 °C", "39 °C", "oltre 40 °C", "in discesa"];
const MERCURY = [0.4, 0.62, 0.88, 0.5];
const SWEAT: [number, number][] = [
  [42, 11],
  [60, 13],
  [22, 76],
  [79, 82],
  [37, 60],
  [63, 66],
  [44, 101],
  [57, 93],
  [19, 98],
  [81, 102],
];
const COOL: [number, number][] = [
  [40, 58],
  [60, 62],
  [48, 84],
  [26, 80],
  [74, 86],
  [44, 150],
  [58, 164],
];
const VESSELS = [
  "M26 64 C 23 80 21 94 19 108",
  "M74 64 C 77 80 79 94 81 108",
  "M42.5 136 C 42.5 150 42.5 166 42.5 182",
  "M57.5 136 C 57.5 150 57.5 166 57.5 182",
];
const HEAT_WAVES: [number, number][] = [
  [70, 46],
  [130, 46],
  [64, 90],
  [136, 90],
];

export function Termoregolazione() {
  const { step, t, slow } = useScene();
  const clip = useId();
  const hot = step === 1 || step === 2;

  return (
    <g>
      <g transform={FIG_TRANSFORM}>
        <Silhouette id={clip} />
        <BodyFigure view="fronte" />
        {/* La pelle si scalda */}
        <motion.rect
          x="0"
          y="0"
          width="100"
          height="200"
          fill={C.heat}
          clipPath={`url(#${clip})`}
          initial={false}
          animate={{ opacity: [0, 0.28, 0.55, 0.12][step] }}
          transition={slow}
        />
        {/* Vasi della pelle che si dilatano */}
        {VESSELS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke={C.artery}
            strokeLinecap="round"
            initial={false}
            animate={{ strokeWidth: [0.9, 2.4, 2.6, 1.3][step], opacity: [0.5, 0.9, 0.9, 0.6][step] }}
            transition={slow}
          />
        ))}
        {/* Il cervello soffre */}
        <motion.ellipse cx="50" cy="16" rx="10" ry="8" fill={C.highlight} initial={false} animate={{ opacity: step === 2 ? 0.5 : 0 }} transition={t} className="idle-pulse" />
        {/* Sudore */}
        {SWEAT.map(([x, y], i) => (
          <motion.g key={i} initial={false} animate={{ opacity: step === 0 ? (i < 3 ? 1 : 0) : hot ? 1 : 0 }} transition={t}>
            <g className="idle-float" style={{ animationDelay: `${-i * 0.6}s` }}>
              <Droplet s={1.3} color={C.waterDeep} transform={`translate(${x} ${y})`} />
            </g>
          </motion.g>
        ))}
        {/* Acqua fresca sulla pelle */}
        {COOL.map(([x, y], i) => (
          <motion.g key={`c${i}`} initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={{ ...t, delay: step === 3 ? i * 0.08 : 0 }}>
            <Droplet s={1.8} color={C.water} transform={`translate(${x} ${y})`} />
          </motion.g>
        ))}
      </g>

      {/* Calore che lascia il corpo */}
      {HEAT_WAVES.map(([x, y], i) => (
        <motion.g key={i} initial={false} animate={{ opacity: step === 0 ? (i < 2 ? 0.6 : 0) : hot ? 1 : 0 }} transition={t}>
          <g className="idle-float" style={{ animationDelay: `${-i * 1.2}s` }}>
            <path d={`M${x} ${y} q -3 -4 0 -8 t 0 -8`} fill="none" stroke={C.heat} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </motion.g>
      ))}

      {/* Termometro */}
      <g transform="translate(154 92)">
        <rect x="-4.6" y="-42" width="9.2" height="66" rx="4.6" fill="#ffffff" stroke={C.inkSoft} strokeWidth="1" />
        <circle cy="28" r="7.4" fill={step === 3 ? C.waterDeep : C.heat} stroke={C.inkSoft} strokeWidth="1" />
        <motion.rect
          x="-2.2"
          width="4.4"
          rx="2.2"
          initial={false}
          animate={{ y: 24 - 62 * MERCURY[step], height: 62 * MERCURY[step] + 2, fill: step === 3 ? C.waterDeep : C.heat }}
          transition={slow}
        />
        {/* Soglia dei 40 °C */}
        <path d="M-7 -28 H-4.6 M4.6 -28 H7" stroke={C.highlight} strokeWidth="1.4" strokeLinecap="round" />
        <text x="-9" y="-26" textAnchor="end" fontSize="6" fontWeight="700" fill={C.highlight} className="slide-label slide-halo">
          40
        </text>
      </g>
      {TEMPS.map((label, i) => (
        <motion.text
          key={label}
          x="154"
          y="144"
          textAnchor="middle"
          fontSize="7"
          fontWeight="700"
          fill={i === 2 ? C.highlight : C.label}
          className="slide-label slide-halo"
          initial={false}
          animate={{ opacity: step === i ? 1 : 0 }}
          transition={t}
        >
          {label}
        </motion.text>
      ))}

      {/* Sole e caldo, poi ombra */}
      <motion.g initial={false} animate={{ opacity: hot ? 1 : 0 }} transition={t}>
        <TriggerIcon kind="sole" transform="translate(50 54)" />
      </motion.g>
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <IconDisc x={50} y={54}>
          <path d="M-7 0.5 A7 6 0 0 1 7 0.5 Z" fill={C.calm} stroke={C.label} strokeWidth="0.8" />
          <path d="M0 0.5 V6.4 Q 0 7.6 -1.6 7" fill="none" stroke={C.label} strokeWidth="1" strokeLinecap="round" />
        </IconDisc>
        {/* Aria fresca */}
        {[100, 116, 132].map((y, i) => (
          <path key={y} d={`M30 ${y} q 8 -4 16 0 t 14 0`} fill="none" stroke={C.waterDeep} strokeWidth="1.5" strokeLinecap="round" className="idle-flow" style={{ animationDelay: `${-i * 0.4}s` }} />
        ))}
      </motion.g>

      {/* Colpo di calore: confusione e numero di emergenza */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        <g transform="translate(78 24)">
          <path d="M0 0 m -1 0 a 1 1 0 1 1 2 0 a 2.2 2.2 0 1 1 -4.4 0 a 3.4 3.4 0 1 1 6.8 0" fill="none" stroke={C.highlight} strokeWidth="1.1" strokeLinecap="round" className="idle-spin" style={{ animationDuration: "3s" }} />
        </g>
        <g transform="translate(134 34)">
          <rect x="-13" y="-7.5" width="26" height="15" rx="4" fill={C.highlight} />
          <text y="3" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff" className="slide-label">
            112
          </text>
        </g>
      </motion.g>
    </g>
  );
}
