"use client";

import { motion } from "motion/react";
import type { SceneParams } from "@/lib/slides/catalog";
import { C } from "../palette";
import { SceneLabel, TriggerIcon, Virus } from "../primitives";
import { useScene } from "../scene-context";

/* -------------------------------------------------------------------- BRONCHI */

export function Bronchi({ params }: { params: SceneParams<"bronchi"> }) {
  const { step, t, slow } = useScene();
  const asma = params.variante === "asma";
  const cx = 100;
  const cy = 94;
  const inflamed = step === 1 || step === 2;
  const lumen = asma ? [46, 42, 22, 44][step] : [46, 42, 38, 44][step];
  const muscle = asma ? [69, 68, 52, 68][step] : 69;
  const mucosa = lumen + (inflamed ? 13 : 9);
  const mucus = asma
    ? [
        [-8, -6, 6],
        [7, 5, 5],
      ]
    : [
        [-20, -14, 7],
        [16, -18, 6],
        [-6, 22, 8],
        [22, 12, 5],
      ];

  return (
    <g>
      <rect x="0" y="0" width="200" height="200" fill="#f8e9ee" />
      {/* Tessuto attorno al bronco */}
      <circle cx={cx} cy={cy} r="82" fill="#f3dbe4" stroke={C.eosin} strokeWidth="1" opacity="0.9" />
      {/* Anello di muscolo */}
      <motion.circle
        cx={cx}
        cy={cy}
        fill="none"
        initial={false}
        animate={{ r: muscle, stroke: asma && step === 2 ? C.muscleDark : C.muscle }}
        strokeWidth="9"
        transition={slow}
      />
      {/* Strato sotto la mucosa */}
      <motion.circle cx={cx} cy={cy} fill={C.tissue} initial={false} animate={{ r: muscle - 4 }} transition={slow} />
      {/* Mucosa: si arrossa e si gonfia con l'infiammazione */}
      <motion.circle
        cx={cx}
        cy={cy}
        initial={false}
        animate={{ r: mucosa, fill: inflamed ? C.tissueInflamed : C.tissueDeep }}
        transition={slow}
      />
      {/* Ciglia, che seguono il bordo del lume */}
      <motion.g initial={false} animate={{ scale: lumen / 46 }} transition={slow}>
        {Array.from({ length: 28 }, (_, i) => {
          const a = (i / 28) * Math.PI * 2;
          const x = cx + Math.cos(a) * 46;
          const y = cy + Math.sin(a) * 46;
          const deg = (a * 180) / Math.PI + 90;
          return (
            <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(0)})`}>
              <g className="idle-sway" style={{ animationDelay: `${-i * 0.12}s` }}>
                <path d="M0 0 V 8" stroke={C.eosinDark} strokeWidth="1.3" strokeLinecap="round" />
              </g>
            </g>
          );
        })}
      </motion.g>
      {/* Lume, dove passa l'aria */}
      <motion.circle cx={cx} cy={cy} fill={C.air} initial={false} animate={{ r: lumen }} transition={slow} />

      {/* Fattori scatenanti o virus nel lume */}
      {[
        [-14, -10],
        [12, 8],
        [6, -18],
      ].map(([dx, dy], i) => (
        <motion.g key={i} initial={false} animate={{ opacity: step === 1 ? 1 : 0, x: cx + dx, y: cy + dy }} transition={{ ...t, delay: step === 1 ? i * 0.15 : 0 }}>
          {asma ? <circle r="3" fill={C.pollen} stroke={C.pollenDark} strokeWidth="0.6" /> : <Virus kind="rinovirus" r={4} />}
        </motion.g>
      ))}

      {/* Muco */}
      {mucus.map(([dx, dy, r], i) => (
        <motion.g key={`m${i}`} initial={false} animate={{ opacity: step === 2 ? 1 : step === 3 && !asma ? 0.5 : 0, x: cx + dx * (lumen / 46), y: cy + dy * (lumen / 46) }} transition={slow}>
          <g className="idle-float" style={{ animationDelay: `${-i}s` }}>
            <ellipse rx={r} ry={r * 0.8} fill={C.mucus} stroke={C.mucusDark} strokeWidth="0.8" />
          </g>
        </motion.g>
      ))}

      {/* Fischio (asma) o colpo di tosse (bronchite) */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        {asma ? (
          <path d="M146 146 q 5 -5 10 0 t 10 0 M144 158 q 5 -5 10 0 t 10 0" fill="none" stroke={C.waterDeep} strokeWidth="1.8" strokeLinecap="round" className="idle-blink" />
        ) : (
          <path d="M146 140 l 10 -6 M150 150 l 12 -2 M146 160 l 10 4" stroke={C.eosinDark} strokeWidth="1.8" strokeLinecap="round" className="idle-blink" />
        )}
      </motion.g>
      <motion.g initial={false} animate={{ opacity: asma && step === 1 ? 1 : 0 }} transition={t}>
        <TriggerIcon kind="fumo" transform="translate(52 50)" />
        <TriggerIcon kind="freddo" transform="translate(148 142)" />
      </motion.g>
      <SceneLabel x={100} y={166}>bronco in sezione</SceneLabel>
    </g>
  );
}

/* ---------------------------------------------------------- VIE AEREE NEL SONNO */

const HEAD =
  "M154 16 C 104 8 62 26 54 60 C 52 70 44 80 41 88 C 39 94 46 96 49 98 C 47 104 49 108 53 110 C 51 116 55 121 62 123 C 72 126 78 132 78 144 L 76 210 L 214 210 L 214 8 C 190 10 172 12 154 16 Z";
const AIRWAY = "M50 96 C 70 90 96 84 120 86 C 128 98 128 126 126 150 L 124 196";

export function VieAereeSonno() {
  const { step, t, slow } = useScene();
  const asleep = step >= 1;
  const shift = [0, 6, 12, 0][step];
  const flow = step === 2 ? 0 : step === 1 ? 0.5 : 1;
  const oxygen = [1, 0.9, 0.55, 0.95][step];
  return (
    <g>
      <path d={HEAD} fill={C.body} stroke={C.bodyLine} strokeWidth="1.6" />
      {/* Via aerea: naso, gola */}
      <path d={AIRWAY} fill="none" stroke={C.air} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <motion.path d={AIRWAY} fill="none" stroke={C.waterDeep} strokeWidth="1.8" className="idle-flow" initial={false} animate={{ opacity: flow }} transition={t} />
      {/* Parete posteriore della gola */}
      <path d="M136 84 C 140 110 138 150 136 196" fill="none" stroke={C.tissueDeep} strokeWidth="6" />

      {/* Lingua e palato molle: nel sonno scivolano indietro */}
      <motion.g initial={false} animate={{ x: shift }} transition={slow}>
        <path d="M62 116 C 70 104 96 100 112 108 C 120 112 124 124 122 136 C 108 140 82 136 62 128 Z" fill={C.tissueInflamed} stroke={C.membrane} strokeWidth="1.2" />
        <path d="M96 94 C 108 94 118 98 122 108 C 118 112 112 108 106 104" fill={C.tissueDeep} stroke={C.membrane} strokeWidth="1.2" />
      </motion.g>
      {/* Vibrazioni del russare */}
      <motion.g initial={false} animate={{ opacity: step === 1 ? 1 : 0 }} transition={t}>
        <path d="M146 96 q 4 -3 8 0 t 8 0 M146 106 q 4 -3 8 0 t 8 0" fill="none" stroke={C.eosinDark} strokeWidth="1.6" strokeLinecap="round" className="idle-blink" />
      </motion.g>

      {/* Occhio aperto o chiuso */}
      <motion.circle cx="84" cy="62" r="3.6" fill={C.nucleus} initial={false} animate={{ opacity: asleep ? 0 : 1 }} transition={t} />
      <motion.path d="M79 62 Q 84 66 89 62" fill="none" stroke={C.nucleus} strokeWidth="1.8" strokeLinecap="round" initial={false} animate={{ opacity: asleep ? 1 : 0 }} transition={t} />
      <motion.g initial={false} animate={{ opacity: step === 1 || step === 2 ? 1 : 0 }} transition={t}>
        <text x="58" y="40" fontSize="11" fontWeight="700" fill={C.nucleus} className="slide-label">z</text>
        <text x="66" y="32" fontSize="8" fontWeight="700" fill={C.nucleus} className="slide-label">z</text>
      </motion.g>

      {/* Ossigeno nel sangue */}
      <g transform="translate(166 38)">
        <rect x="-5" y="-22" width="10" height="44" rx="3" fill="#ffffff" stroke={C.inkSoft} strokeWidth="1" />
        <motion.rect x="-3" width="6" rx="2" initial={false} animate={{ y: 20 - 40 * oxygen, height: 40 * oxygen, fill: step === 2 ? C.highlight : C.oxygen }} transition={slow} />
        <text x="0" y="32" textAnchor="middle" fontSize="7" fontWeight="700" fill={C.label} className="slide-label slide-halo">O₂</text>
      </g>
      {/* Micro-risveglio del cervello */}
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <g transform="translate(112 32)" className="idle-pulse">
          <path d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill={C.pollen} stroke={C.pollenDark} strokeWidth="0.8" />
        </g>
      </motion.g>
      <SceneLabel x={100} y={164}>gola</SceneLabel>
    </g>
  );
}
