"use client";

import { useId } from "react";
import { motion } from "motion/react";
import type { SceneParams } from "@/lib/slides/catalog";
import { C } from "../palette";
import { Arrow, Droplet, IconDisc, RedCell, SceneLabel, TissueCell, TriggerIcon, WhiteCell, rng } from "../primitives";
import { useScene } from "../scene-context";

/* ===================================================================== PELLE */

/** Superficie della pelle, fine dello strato corneo, giunzione media con il derma */
const SURFACE = 64;
const CORNEUM = 78;
const JUNCTION = 116;
const AMP = 6;
const EPI = "#fbe3ea";
const DERMIS = "#fbeef2";
const DERMIS_RED = "#f6c2d2";

/** Profilo della giunzione tra epidermide e derma: una papilla ogni 40 unità */
function junctionY(x: number) {
  return JUNCTION - AMP / 4 - ((3 * AMP) / 4) * Math.cos((2 * Math.PI * x) / 40);
}

const DERMIS_PATH = (() => {
  const pts: string[] = [];
  for (let x = -10; x <= 210; x += 2) pts.push(`${x} ${junctionY(x).toFixed(2)}`);
  return `M${pts.join(" L")} L210 210 L-10 210 Z`;
})();

const PAPILLAE = [40, 80, 120, 160];

const BRICKS = (() => {
  const out: { x: number; y: number }[] = [];
  for (let row = 0; row < 2; row++) {
    for (let x = row ? -20 : -8; x < 210; x += 25.6) out.push({ x, y: row ? 71.4 : 64.7 });
  }
  return out;
})();

const SPINOUS = (() => {
  const out: { x: number; y: number }[] = [];
  [89, 96.5].forEach((y, row) => {
    for (let x = row ? -2 : 4; x < 210; x += 12) out.push({ x, y });
  });
  for (const base of [0, 40, 80, 120, 160, 200]) {
    out.push({ x: base + 14, y: 104.5 }, { x: base + 26, y: 104.5 });
  }
  return out;
})();

const BASAL = (() => {
  const out: { x: number; y: number }[] = [];
  for (let x = -4; x <= 204; x += 8) out.push({ x, y: junctionY(x) - 4.6 });
  return out;
})();

const FIBROBLASTS = (() => {
  const rand = rng(77);
  return Array.from({ length: 12 }, () => ({ x: rand() * 200, y: 128 + rand() * 66, rot: (rand() - 0.5) * 30 }));
})();

/** Crepa nello strato corneo: zig-zag che si stringe verso il basso */
function crackPath(x: number) {
  const c: [number, number][] = [
    [x, SURFACE],
    [x + 2, SURFACE + 4],
    [x, SURFACE + 8],
    [x + 2, SURFACE + 12],
    [x + 1, CORNEUM + 3],
  ];
  const w = [2.4, 1.8, 1.6, 1.1, 0];
  const left = c.map(([cx, cy], i) => `${cx - w[i]} ${cy}`);
  const right = c.slice(0, -1).map(([cx, cy], i) => `${cx + w[i]} ${cy}`).reverse();
  return `M${[...left, ...right].join(" L")} Z`;
}

function Pill({ x, y, text, color = C.label }: { x: number; y: number; text: string; color?: string }) {
  const w = text.length * 3.5 + 10;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y="-6.5" width={w} height="13" rx="6.5" fill="#ffffff" stroke={color} strokeWidth="0.9" />
      <text y="2.4" textAnchor="middle" fontSize="6.6" fontWeight="700" fill={color} className="slide-label">
        {text}
      </text>
    </g>
  );
}

/** Uno strato di crema emolliente steso sulla superficie */
function Cream({ show }: { show: boolean }) {
  const { t } = useScene();
  return (
    <motion.path
      d={`M-10 ${SURFACE + 0.5} V${SURFACE - 6} ${"q 10 -2.6 20 0 ".repeat(11)}V${SURFACE + 0.5} Z`}
      fill="#ffffff"
      stroke="#d8cfe6"
      strokeWidth="0.8"
      initial={false}
      animate={{ opacity: show ? 0.9 : 0, y: show ? 0 : -8 }}
      transition={t}
    />
  );
}

function Itch({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 6} ${y} l 3 -3 l 3 3 l 3 -3 l 3 3`} fill="none" stroke={C.highlight} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="idle-blink" />;
}

function CreamTube() {
  return (
    <>
      <path d="M-6 -3 H3 L5.4 -1.6 V1.6 L3 3 H-6 Z" fill="#ffffff" stroke={C.label} strokeWidth="0.9" strokeLinejoin="round" />
      <rect x="5.4" y="-1.2" width="2" height="2.4" fill={C.label} />
      <path d="M-4.6 -3 V3" stroke={C.label} strokeWidth="0.7" />
    </>
  );
}

export function Pelle({ params }: { params: SceneParams<"pelle"> }) {
  const { step, t, slow } = useScene();
  const v = params.variante;
  const inflamed = v === "psoriasi" ? step === 1 || step === 2 : step === 2;
  const thick = v === "psoriasi" ? [1, 1.06, 1.55, 1.1][step] : 1;

  return (
    <g>
      {/* Epidermide: sotto uno sfondo fisso, sopra gli strati che possono ispessirsi */}
      <rect x="-10" y={SURFACE} width="220" height="64" fill={EPI} />
      <motion.g initial={false} animate={{ scaleY: thick }} style={{ originY: 1 }} transition={slow}>
        <rect x="-10" y={SURFACE} width="220" height="44" fill={EPI} />
        {SPINOUS.map((c, i) => (
          <TissueCell key={i} rx={5.4} ry={3.8} transform={`translate(${c.x} ${c.y})`} />
        ))}
        {/* Strato granuloso */}
        {Array.from({ length: 16 }, (_, i) => {
          const x = -4 + i * 14;
          return (
            <g key={i} transform={`translate(${x} 82)`}>
              <ellipse rx="6.6" ry="2.3" fill="#f5cfdb" stroke={C.eosin} strokeWidth="0.5" />
              <circle cx="-2.6" cy="-0.4" r="0.7" fill={C.nucleusDark} />
              <circle cx="0.4" cy="0.6" r="0.7" fill={C.nucleusDark} />
              <circle cx="3" cy="-0.3" r="0.7" fill={C.nucleusDark} />
            </g>
          );
        })}
        {/* Psoriasi: cellule che salgono verso la superficie, lente o velocissime */}
        {v === "psoriasi" &&
          [34, 74, 114, 154].map((x, i) => (
            <g key={i} transform={`translate(${x} 104)`}>
              <g className="idle-rise" style={{ animationDuration: `${[6, 1.6, 1.6, 4][step]}s`, animationDelay: `${-i * 1.3}s` }}>
                <ellipse rx="5" ry="3.6" fill="#f8c9d8" stroke={C.highlight} strokeWidth="1" />
                <ellipse rx="1.8" ry="1.5" fill={C.nucleus} />
              </g>
            </g>
          ))}
        {/* Strato corneo: mattoni (cellule) e malta (grassi) */}
        <rect x="-10" y={SURFACE} width="220" height={CORNEUM - SURFACE} fill={C.mucus} />
        {BRICKS.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width="24" height="5.9" rx="1.6" fill="#f8e3e9" stroke="#e1a6ba" strokeWidth="0.6" />
        ))}
      </motion.g>
      {BASAL.map((c, i) => (
        <TissueCell key={i} rx={3.2} ry={4.4} fill="#f3c6d5" transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)})`} />
      ))}

      {/* Derma: collagene, fibroblasti, capillari */}
      <motion.path d={DERMIS_PATH} stroke={C.eosin} strokeWidth="0.8" initial={false} animate={{ fill: inflamed ? DERMIS_RED : DERMIS }} transition={slow} />
      {[136, 166, 186].map((y) => (
        <path key={y} d={`M-10 ${y} ${"q 12 -4 24 0 t 24 0 ".repeat(5)}`} fill="none" stroke={C.collagenLine} strokeWidth="0.8" opacity="0.6" />
      ))}
      {FIBROBLASTS.map((f, i) => (
        <ellipse key={i} cx={f.x.toFixed(1)} cy={f.y.toFixed(1)} rx="3.2" ry="1" transform={`rotate(${f.rot.toFixed(0)} ${f.x.toFixed(1)} ${f.y.toFixed(1)})`} fill={C.nucleus} opacity="0.6" />
      ))}
      <motion.g initial={false} animate={{ strokeWidth: inflamed ? 3.2 : 1.8 }} transition={slow} stroke={C.artery} fill="none">
        {PAPILLAE.map((x) => (
          <path key={x} d={`M${x - 2.6} 152 C ${x - 3.4} 104 ${x + 3.4} 104 ${x + 2.6} 152`} strokeLinecap="round" />
        ))}
        <path d="M-10 152 C 40 148 60 156 100 152 S 160 148 210 152" />
      </motion.g>

      {v === "atopica" && <Atopica />}
      {v === "contatto" && <Contatto />}
      {v === "psoriasi" && <Psoriasi />}
      {v === "acne" && <Acne />}

      {v !== "acne" && (
        <motion.g initial={false} animate={{ opacity: step === 0 ? 1 : 0 }} transition={t}>
          <SceneLabel x={100} y={56}>strato corneo</SceneLabel>
          <SceneLabel x={52} y={162}>derma</SceneLabel>
        </motion.g>
      )}
    </g>
  );
}

/* ------------------------------------------------------- dermatite atopica */

const ATOPIC_CRACKS = [
  { x: 57, from: 1 },
  { x: 121, from: 1 },
  { x: 151, from: 1 },
  { x: 87, from: 2 },
];
const ATOPIC_WATER = [
  { x: 44, y: 95 },
  { x: 60, y: 90, out: [60, 54] },
  { x: 104, y: 97 },
  { x: 124, y: 91, out: [124, 51] },
  { x: 150, y: 96, out: [154, 56] },
  { x: 80, y: 101 },
];
const IRRITANTS = [
  { air: [46, 44], skin: [58, 86], from: 1, pollen: true },
  { air: [70, 32], skin: [88, 88], from: 2, pollen: false },
  { air: [136, 30], skin: [122, 88], from: 1, pollen: false },
  { air: [158, 46], skin: [152, 86], from: 1, pollen: true },
];

function Atopica() {
  const { step, t, slow } = useScene();
  return (
    <g>
      {ATOPIC_CRACKS.map((c) => (
        <motion.path key={c.x} d={crackPath(c.x)} fill="#6f5470" initial={false} animate={{ opacity: step >= c.from && step < 3 ? 0.85 : 0 }} transition={t} />
      ))}
      {/* L'acqua resta dentro, poi evapora dalle crepe */}
      {ATOPIC_WATER.map((w, i) => {
        const out = step === 1 || step === 2 ? w.out : undefined;
        return (
          <motion.g key={i} initial={false} animate={{ x: out ? out[0] : w.x, y: out ? out[1] : w.y, opacity: out ? 0.7 : 1 }} transition={slow}>
            <Droplet s={1.1} color={C.waterDeep} />
          </motion.g>
        );
      })}
      {/* Irritanti e allergeni: fuori, poi dentro attraverso le crepe */}
      {IRRITANTS.map((p, i) => {
        const inside = step >= p.from && step < 3;
        const [x, y] = inside ? p.skin : p.air;
        return (
          <motion.g key={i} initial={false} animate={{ x, y, opacity: step === 3 ? 0.5 : 1 }} transition={{ ...slow, delay: inside ? i * 0.1 : 0 }}>
            {p.pollen ? (
              <circle r="2.4" fill={C.pollen} stroke={C.pollenDark} strokeWidth="0.5" />
            ) : (
              <path d="M-2.4 -1 L-0.6 -2.6 L2.2 -1.8 L2.6 1 L0.4 2.6 L-2.2 1.6 Z" fill={C.hypha} stroke={C.spore} strokeWidth="0.5" />
            )}
          </motion.g>
        );
      })}
      {/* Il sistema immunitario reagisce, la pelle prude */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        {[
          [56, 128],
          [120, 126],
          [148, 133],
          [88, 134],
        ].map(([x, y], i) => (
          <WhiteCell key={i} r={6} lobeShift={-0.1} transform={`translate(${x} ${y})`} />
        ))}
        <Itch x={78} y={40} />
        <Itch x={124} y={36} />
        <IconDisc x={100} y={34}>
          <path d="M-5 -4 L1 5 M-1.6 -5.4 L4.4 3.6 M1.8 -6.4 L6.4 0.6" stroke={C.highlight} strokeWidth="1.3" strokeLinecap="round" />
        </IconDisc>
      </motion.g>
      <Cream show={step === 3} />
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <IconDisc x={100} y={34}>
          <CreamTube />
        </IconDisc>
      </motion.g>
    </g>
  );
}

/* ---------------------------------------------------- dermatite da contatto */

const IONS = [
  [90, 84],
  [104, 92],
  [114, 82],
  [96, 100],
  [110, 104],
];

function Contatto() {
  const { step, t, slow } = useScene();
  const button = step === 1 || step === 2;
  return (
    <g>
      {/* La barriera sana respinge le sostanze */}
      <motion.g initial={false} animate={{ opacity: step === 0 ? 1 : 0 }} transition={t}>
        <Arrow from={[48, 36]} via={[58, 66]} to={[70, 36]} color={C.inkSoft} width={1.1} />
        <Arrow from={[130, 36]} via={[142, 66]} to={[152, 38]} color={C.inkSoft} width={1.1} />
        <circle cx="48" cy="32" r="2.4" fill={C.hypha} />
        <circle cx="130" cy="32" r="2.4" fill={C.pollen} />
      </motion.g>
      {/* Il nichel di un bottone resta a contatto e penetra */}
      {IONS.map(([x, y], i) => (
        <motion.circle
          key={i}
          r="1.7"
          fill="#8d8aa1"
          stroke="#5f5b75"
          strokeWidth="0.4"
          initial={false}
          animate={{ cx: button ? x : 100, cy: button ? y : 60, opacity: button ? 1 : 0 }}
          transition={{ ...slow, delay: button ? 0.4 + i * 0.12 : 0 }}
        />
      ))}
      <motion.g initial={false} animate={{ opacity: button ? 1 : 0, y: button ? 0 : -10 }} transition={t}>
        <g transform={`translate(100 ${SURFACE - 6})`}>
          <ellipse rx="22" ry="5.6" fill="#b9b6c7" stroke="#76728b" strokeWidth="0.8" />
          <ellipse cy="-1.6" rx="18.6" ry="3.8" fill="#dad8e4" />
          {[
            [-3.6, -2.6],
            [3.6, -2.6],
            [-3.6, -0.4],
            [3.6, -0.4],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="1.4" ry="0.7" fill="#76728b" />
          ))}
        </g>
        <SceneLabel x={100} y={46}>nichel</SceneLabel>
      </motion.g>
      {/* Infiammazione: vescicole, cellule immunitarie, prurito. Arriva 1-2 giorni dopo */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        {[
          [76, 93, 6, 4.2],
          [128, 97, 5, 3.6],
          [146, 89, 4.2, 3],
        ].map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={C.water} stroke={C.waterDeep} strokeWidth="0.8" opacity="0.9" />
        ))}
        {[
          [88, 128],
          [112, 124],
          [132, 133],
        ].map(([x, y], i) => (
          <WhiteCell key={i} r={5.6} lobeShift={-0.1} transform={`translate(${x} ${y})`} />
        ))}
        <Itch x={60} y={40} />
        <Itch x={140} y={40} />
        <Pill x={100} y={26} text="1–2 giorni dopo" color={C.highlight} />
      </motion.g>
      <Cream show={step === 3} />
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <IconDisc x={100} y={34}>
          <path
            d="M-4.4 6 V-1 C-4.4 -2.4 -2.4 -2.4 -2.4 -1 V-4.6 C-2.4 -6 -0.4 -6 -0.4 -4.6 V-5.4 C-0.4 -6.8 1.6 -6.8 1.6 -5.4 V-4.2 C1.6 -5.6 3.6 -5.6 3.6 -4.2 V2 L5.6 -0.4 C6.6 -1.4 7.8 -0.4 7 0.8 L3.6 6 Z"
            fill={C.calm}
            stroke={C.label}
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </IconDisc>
      </motion.g>
    </g>
  );
}

/* ------------------------------------------------------------------ psoriasi */

const FLAKES = (() => {
  const rand = rng(9);
  return Array.from({ length: 10 }, (_, i) => ({ x: 6 + i * 20 + (rand() - 0.5) * 6, y: 39 + (rand() - 0.5) * 3, rot: (rand() - 0.5) * 18 }));
})();

function Psoriasi() {
  const { step, t } = useScene();
  return (
    <g>
      {/* Segnali sbagliati del sistema immunitario */}
      <motion.g initial={false} animate={{ opacity: step === 1 || step === 2 ? 1 : 0 }} transition={t}>
        {PAPILLAE.map((x) => (
          <g key={x}>
            <path d={`M${x - 8} 121 L${x - 8} 109`} stroke={C.highlight} strokeWidth="1.3" className="idle-flow" />
            <circle cx={x - 8} cy="126" r="4.4" fill={C.whiteCell} stroke={C.whiteCellEdge} strokeWidth="0.6" />
            <circle cx={x - 8} cy="126" r="2.8" fill={C.whiteNucleus} />
          </g>
        ))}
      </motion.g>
      {/* Placca: squame argentee in superficie */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        {FLAKES.map((f, i) => (
          <ellipse key={i} cx={f.x.toFixed(1)} cy={f.y.toFixed(1)} rx="9.5" ry="2.4" transform={`rotate(${f.rot.toFixed(0)} ${f.x.toFixed(1)} ${f.y.toFixed(1)})`} fill="#f4f3f9" stroke="#aaa5c2" strokeWidth="0.7" />
        ))}
      </motion.g>
      {(["ricambio: circa 1 mese", "ricambio: pochi giorni", "", "ricambio più lento"] as const).map((text, i) =>
        text ? (
          <motion.g key={i} initial={false} animate={{ opacity: step === i ? 1 : 0 }} transition={t}>
            <Pill x={100} y={30} text={text} color={i === 1 ? C.highlight : C.label} />
          </motion.g>
        ) : null,
      )}
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <IconDisc x={56} y={40}>
          <CreamTube />
        </IconDisc>
        <TriggerIcon kind="sole" transform="translate(144 40)" />
      </motion.g>
    </g>
  );
}

/* ---------------------------------------------------------------------- acne */

const SHEATH = "M82 60 C 88 66 90 74 90 86 L 91 150 C 91 166 109 166 109 150 L 110 86 C 110 74 112 66 118 60 Z";
const CANAL = "M93.5 60 C 96 66 97 74 97 86 L 97.6 146 C 97.6 152 102.4 152 102.4 146 L 103 86 C 103 74 104 66 106.5 60 Z";
const CANAL_TOP = "M93.5 60 C 96 66 97 74 97 86 L 97.2 100 H 102.8 L 103 86 C 103 74 104 66 106.5 60 Z";
const GLAND_LOBES: [number, number, number][] = [
  [121, 110, 9],
  [128, 123, 10],
  [118, 134, 8],
];
const ACNE_BACTERIA: [number, number, number][] = [
  [98.6, 88, 84],
  [101.4, 95, 98],
  [98.4, 103, 76],
  [101.6, 110, 92],
  [98.8, 117, 100],
  [101.2, 124, 82],
  [99.2, 131, 95],
  [101, 80, 88],
];

function Acne() {
  const { step, t, slow } = useScene();
  return (
    <g>
      {/* Infiammazione attorno al follicolo */}
      <motion.ellipse cx="100" cy="104" rx="40" ry="46" fill={C.tissueInflamed} initial={false} animate={{ opacity: step === 2 ? 0.55 : 0 }} transition={slow} />
      {/* Follicolo con il suo canale */}
      <motion.g initial={false} animate={{ scaleX: [1, 1.08, 1.4, 1][step] }} transition={slow}>
        <path d={SHEATH} fill={EPI} stroke={C.membrane} strokeWidth="0.9" />
        <path d={CANAL} fill="#fffaf2" stroke={C.eosin} strokeWidth="0.6" />
        {/* Tappo di sebo e cellule morte, poi pus */}
        <motion.path
          d={CANAL_TOP}
          initial={false}
          animate={{ fill: step === 2 ? C.pus : "#d6bb84", opacity: step === 1 || step === 2 ? 1 : 0 }}
          transition={slow}
        />
      </motion.g>
      {/* Pelo */}
      <ellipse cx="100" cy="155" rx="7" ry="6" fill="#e6a8b8" stroke={C.membrane} strokeWidth="0.8" />
      <path d="M100 152 C 100 120 100 90 100 64 C 101 48 104 34 108 22" fill="none" stroke="#5b4636" strokeWidth="2.2" strokeLinecap="round" />
      {/* Ghiandola sebacea */}
      <path d="M113 106 L103.4 98" stroke="#cfae5e" strokeWidth="3" strokeLinecap="round" />
      <motion.g initial={false} animate={{ scale: step === 1 || step === 2 ? 1.2 : 1 }} transition={slow}>
        {GLAND_LOBES.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#f5e1a4" stroke="#cfae5e" strokeWidth="0.9" />
        ))}
        {GLAND_LOBES.map(([x, y], i) => (
          <circle key={`n${i}`} cx={x + 1} cy={y - 1} r="1.6" fill={C.nucleus} opacity="0.7" />
        ))}
      </motion.g>
      {/* Il sebo sale verso la superficie */}
      <motion.path
        d="M112 105 L102 98 L100 88 L100 60"
        fill="none"
        stroke="#c79d32"
        strokeWidth="1.6"
        className="idle-flow-slow"
        initial={false}
        animate={{ opacity: step === 0 || step === 3 ? 1 : 0 }}
        transition={t}
      />
      {/* Batteri della pelle che si moltiplicano nel poro chiuso */}
      {ACNE_BACTERIA.map(([x, y, rot], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
          <motion.rect
            x="-3.2"
            y="-1.3"
            width="6.4"
            height="2.6"
            rx="1.3"
            fill={C.gramPos}
            stroke={C.gramPosDark}
            strokeWidth="0.4"
            initial={false}
            animate={{ opacity: step === 2 ? 1 : step === 3 && i < 2 ? 0.45 : 0 }}
            transition={{ ...t, delay: step === 2 ? i * 0.08 : 0 }}
          />
        </g>
      ))}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        {[
          [78, 112],
          [124, 92],
          [82, 138],
          [116, 146],
        ].map(([x, y], i) => (
          <WhiteCell key={i} r={5} lobeShift={-0.1} transform={`translate(${x} ${y})`} />
        ))}
        {/* Il brufolo: rilievo arrossato con una punta di pus */}
        <path d={`M68 ${SURFACE} C 80 46 120 46 132 ${SURFACE} Z`} fill="#f4bccd" stroke={C.membrane} strokeWidth="0.9" />
        <ellipse cx="100" cy="52" rx="8" ry="4.2" fill={C.pus} stroke="#c9b25a" strokeWidth="0.6" />
      </motion.g>
      {/* Punto nero */}
      <motion.g initial={false} animate={{ opacity: step === 1 ? 1 : 0 }} transition={t}>
        <ellipse cx="100" cy="61" rx="5.6" ry="2.4" fill="#3b3242" />
        <path d="M72 51 L94 60" stroke={C.label} strokeWidth="0.8" />
        <SceneLabel x={70} y={50} anchor="end">punto nero</SceneLabel>
      </motion.g>
      <motion.g initial={false} animate={{ opacity: step === 0 ? 1 : 0 }} transition={t}>
        <SceneLabel x={114} y={30} anchor="start">pelo</SceneLabel>
        <SceneLabel x={142} y={114} anchor="start">sebo</SceneLabel>
      </motion.g>
      {/* Non schiacciare */}
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <IconDisc x={148} y={40}>
          <rect x="-7.4" y="-2" width="6.4" height="3.6" rx="1.8" transform="rotate(-24)" fill={C.body} stroke={C.label} strokeWidth="0.7" />
          <rect x="1" y="-2" width="6.4" height="3.6" rx="1.8" transform="rotate(24)" fill={C.body} stroke={C.label} strokeWidth="0.7" />
          <path d="M-6 6 L6 -6" stroke={C.highlight} strokeWidth="1.6" strokeLinecap="round" />
        </IconDisc>
      </motion.g>
    </g>
  );
}

/* ===================================================================== FIBRE */

/** Fibra ondulata (il «crimp» del collagene a riposo) */
function crimp(x1: number, x2: number, y: number, amp = 1.5) {
  const n = Math.max(1, Math.round((x2 - x1) / 8));
  const p = (x2 - x1) / n;
  return `M${x1.toFixed(1)} ${y} ${`q ${(p / 4).toFixed(2)} ${-2 * amp} ${(p / 2).toFixed(2)} 0 q ${(p / 4).toFixed(2)} ${2 * amp} ${(p / 2).toFixed(2)} 0 `.repeat(n)}`;
}

/** Estremità sfilacciata di una fibra rotta: `dir` 1 verso destra, -1 verso sinistra */
function fray(x: number, y: number, dir: 1 | -1) {
  return `M${x} ${y} l ${3 * dir} -1.8 M${x} ${y} l ${3.4 * dir} 0.3 M${x} ${y} l ${2.6 * dir} 2`;
}

function boneDots(seed: number, x0: number, x1: number, y0: number, y1: number) {
  const rand = rng(seed);
  return Array.from({ length: 22 }, (_, i) => (
    <circle key={i} cx={(x0 + rand() * (x1 - x0)).toFixed(1)} cy={(y0 + rand() * (y1 - y0)).toFixed(1)} r={(0.8 + rand() * 1.4).toFixed(2)} fill={C.boneDark} opacity="0.35" />
  ));
}

export function Fibre({ params }: { params: SceneParams<"fibre"> }) {
  return params.tipo === "legamento" ? <Legamento /> : <Tendine />;
}

/* ---------------------------------------------------------------- legamento */

const LIG_FIBERS = [104.5, 108.7, 112.9, 117.1, 121.3, 125.5];
const LIG_BROKEN: Record<number, number> = { 1: 96, 2: 108, 4: 102 };
const LIG_VESSEL = "M44 94 C 64 88 84 98 100 93 S 136 88 156 95";

function Legamento() {
  const { step, t, slow } = useScene();
  const stretched = step === 1;
  return (
    <g>
      <rect x="0" y="0" width="200" height="200" fill="#fbf1f4" />
      {/* Due ossa e la loro cartilagine */}
      <path d="M-10 66 H 56 C 84 66 98 90 98 116 C 98 142 84 166 56 166 H -10 Z" fill={C.bone} stroke={C.boneDark} strokeWidth="1.2" />
      {boneDots(5, 0, 80, 72, 160)}
      <path d="M66 67.6 C 86 72 96.2 92 96.2 116 C 96.2 140 86 160 66 164.4" fill="none" stroke="#d9e6f3" strokeWidth="3" />
      <motion.g initial={false} animate={{ x: stretched ? 10 : 0, rotate: stretched ? 5 : 0 }} transition={slow}>
        <path d="M210 66 H 144 C 116 66 102 90 102 116 C 102 142 116 166 144 166 H 210 Z" fill={C.bone} stroke={C.boneDark} strokeWidth="1.2" />
        {boneDots(6, 120, 200, 72, 160)}
        <path d="M134 67.6 C 114 72 103.8 92 103.8 116 C 103.8 140 114 160 134 164.4" fill="none" stroke="#d9e6f3" strokeWidth="3" />
      </motion.g>

      {/* Gonfiore e livido */}
      <motion.g initial={false} animate={{ opacity: [0, 0, 1, 0.25][step] }} transition={slow}>
        <ellipse cx="100" cy="116" rx="70" ry="42" fill={C.water} opacity="0.35" stroke={C.waterDeep} strokeWidth="0.8" strokeDasharray="3 2.4" />
        <ellipse cx="106" cy="118" rx="28" ry="15" fill={C.bruise} opacity="0.5" />
      </motion.g>

      {/* Un piccolo vaso: nella lesione si rompe e perde sangue */}
      <motion.path d={LIG_VESSEL} fill="none" stroke={C.artery} strokeWidth="1.8" initial={false} animate={{ opacity: step < 2 ? 0.85 : 0 }} transition={t} />
      <motion.path d={LIG_VESSEL} fill="none" stroke={C.artery} strokeWidth="1.8" strokeDasharray="55 9 200" initial={false} animate={{ opacity: step < 2 ? 0 : 0.85 }} transition={t} />

      {/* Il legamento: si allunga nella storta */}
      <motion.rect x="40" y="101" height="30" rx="6" fill={C.collagen} stroke={C.collagenLine} strokeWidth="0.8" opacity="0.95" initial={false} animate={{ width: stretched ? 130 : 120 }} transition={slow} />
      {LIG_FIBERS.map((y, i) => {
        const gap = LIG_BROKEN[i];
        return (
          <g key={i} fill="none" strokeLinecap="round">
            {/* A riposo: fibre ondulate */}
            <motion.path d={crimp(42, 158, y)} stroke={C.collagenLine} strokeWidth="1.2" initial={false} animate={{ opacity: step === 0 || (gap === undefined && step !== 1) ? 1 : 0 }} transition={t} />
            {/* Stirate: diventano dritte; alcune si rompono */}
            <motion.path
              d={gap === undefined ? `M42 ${y} H168` : `M42 ${y} H${gap - 3} ${fray(gap - 3, y, 1)} M${gap + 6} ${y} H168 ${fray(gap + 6, y, -1)}`}
              stroke={C.collagenLine}
              strokeWidth="1.2"
              initial={false}
              animate={{ opacity: stretched ? 1 : 0 }}
              transition={t}
            />
            {gap !== undefined && (
              <>
                <motion.path
                  d={`${crimp(42, gap - 4, y)} ${fray(gap - 4, y, 1)} ${crimp(gap + 4, 158, y)} ${fray(gap + 4, y, -1)}`}
                  stroke={C.collagenLine}
                  strokeWidth="1.2"
                  initial={false}
                  animate={{ opacity: step >= 2 ? 1 : 0 }}
                  transition={t}
                />
                {/* Fibre nuove che ricuciono */}
                <motion.path d={crimp(gap - 8, gap + 8, y, 1.1)} stroke={C.nucleus} strokeWidth="1.1" initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={{ ...t, delay: step === 3 ? 0.3 : 0 }} />
              </>
            )}
          </g>
        );
      })}

      {/* Sangue uscito dal vaso */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : step === 3 ? 0.3 : 0 }} transition={t}>
        {[
          [102, 99],
          [108, 106],
          [98, 112],
          [114, 116],
          [104, 124],
        ].map(([x, y], i) => (
          <RedCell key={i} r={2.6} transform={`translate(${x} ${y})`} />
        ))}
      </motion.g>

      {/* La torsione */}
      <motion.g initial={false} animate={{ opacity: stretched ? 1 : 0 }} transition={t}>
        <Arrow from={[80, 58]} via={[100, 32]} to={[122, 56]} color={C.highlight} width={1.8} />
      </motion.g>
      {/* Dolore */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        <path d="M54 54 l 3 -4 l 3 4 l 3 -4 l 3 4" fill="none" stroke={C.highlight} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="idle-blink" />
        <path d="M134 50 l 3 -4 l 3 4 l 3 -4 l 3 4" fill="none" stroke={C.highlight} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="idle-blink" />
      </motion.g>
      {/* Ghiaccio, poi movimento graduale */}
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <TriggerIcon kind="freddo" transform="translate(58 46)" />
        <IconDisc x={142} y={46}>
          <Arrow from={[-5, 3]} via={[0, -8]} to={[5, 3]} color={C.label} width={1.3} head={2.4} />
        </IconDisc>
      </motion.g>
      <motion.g initial={false} animate={{ opacity: step === 0 ? 1 : 0 }} transition={t}>
        <SceneLabel x={100} y={84}>legamento</SceneLabel>
        <SceneLabel x={40} y={152}>osso</SceneLabel>
        <SceneLabel x={160} y={152}>osso</SceneLabel>
      </motion.g>
    </g>
  );
}

/* ------------------------------------------------------------------ tendine */

const TENDON_FIBERS = [95.5, 98.5, 101.5, 104.5];
const MUSCLE = "M-10 62 C 30 60 58 76 82 93 L 82 107 C 58 124 30 140 -10 138 Z";

function Tendine() {
  const { step, t, slow } = useScene();
  const clip = useId();
  return (
    <g>
      <rect x="0" y="0" width="200" height="200" fill="#fbf1f4" />
      <defs>
        <clipPath id={clip}>
          <path d={MUSCLE} />
        </clipPath>
      </defs>
      {/* Osso */}
      <path d="M210 56 H 168 C 154 56 146 70 146 100 C 146 130 154 144 168 144 H 210 Z" fill={C.bone} stroke={C.boneDark} strokeWidth="1.2" />
      {boneDots(8, 156, 200, 62, 138)}
      {/* Muscolo, con le sue fibre che convergono nel tendine */}
      <path d={MUSCLE} fill={C.muscle} stroke={C.muscleDark} strokeWidth="1" />
      <g clipPath={`url(#${clip})`} stroke={C.muscleDark} strokeWidth="0.8" opacity="0.55" fill="none">
        {Array.from({ length: 12 }, (_, i) => {
          const y = 64 + i * 6.4;
          return <path key={i} d={`M-10 ${y} Q 40 ${(y + 100) / 2} 84 ${(100 + (y - 100) * 0.16).toFixed(1)}`} />;
        })}
      </g>

      {/* Il tendine: si ispessisce quando si irrita */}
      <motion.g initial={false} animate={{ scaleY: [1, 1, 1.55, 1.12][step] }} transition={slow}>
        <motion.rect x="76" y="93" width="78" height="14" rx="5" stroke={C.collagenLine} strokeWidth="0.8" initial={false} animate={{ fill: step === 2 ? "#f7cfdb" : C.collagen }} transition={slow} />
        {TENDON_FIBERS.map((y) => (
          <path key={y} d={crimp(78, 152, y, 0.9)} fill="none" stroke={C.collagenLine} strokeWidth="1" />
        ))}
        {/* Microlesioni tra le fibre */}
        <motion.g initial={false} animate={{ opacity: step === 1 || step === 2 ? 1 : 0 }} transition={t} stroke={C.highlight} strokeWidth="1.1" strokeLinecap="round">
          {[
            [104, 97],
            [118, 103],
            [132, 99],
          ].map(([x, y]) => (
            <path key={x} d={`M${x - 2} ${y - 1.6} L${x + 2} ${y + 1.6} M${x + 2} ${y - 1.6} L${x - 2} ${y + 1.6}`} />
          ))}
        </motion.g>
        {/* Piccoli vasi nuovi nel tendine irritato */}
        <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t} stroke={C.artery} strokeWidth="0.8" fill="none">
          <path d="M96 107 q 2 -3 0 -6 t 1 -5" />
          <path d="M124 107 q -2 -3 0 -5 t -1 -5" />
          <path d="M140 93 q 2 3 0 5 t 1 5" />
        </motion.g>
      </motion.g>

      {/* Il muscolo tira, il tendine trasmette la forza all'osso */}
      <motion.g initial={false} animate={{ opacity: step === 0 ? 1 : 0 }} transition={t}>
        <Arrow from={[140, 82]} to={[100, 82]} color={C.label} width={1.6} />
        <SceneLabel x={36} y={102}>muscolo</SceneLabel>
        <SceneLabel x={115} y={120}>tendine</SceneLabel>
        <SceneLabel x={178} y={102}>osso</SceneLabel>
      </motion.g>
      {/* Movimenti ripetuti e sforzi */}
      <motion.g initial={false} animate={{ opacity: step === 1 ? 1 : 0 }} transition={t}>
        <g className="idle-blink">
          <Arrow from={[96, 78]} to={[134, 78]} color={C.highlight} width={1.5} />
          <Arrow from={[134, 85]} to={[96, 85]} color={C.highlight} width={1.5} />
        </g>
        <IconDisc x={100} y={52}>
          <path d="M-4 0 H4" stroke={C.inkSoft} strokeWidth="1.4" />
          <rect x="-7" y="-3.6" width="3" height="7.2" rx="1" fill={C.inkSoft} />
          <rect x="4" y="-3.6" width="3" height="7.2" rx="1" fill={C.inkSoft} />
        </IconDisc>
      </motion.g>
      {/* Dolore quando lo usi */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        <path d="M86 70 l 3 -4 l 3 4 l 3 -4 l 3 4" fill="none" stroke={C.highlight} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="idle-blink" />
        <path d="M128 70 l 3 -4 l 3 4 l 3 -4 l 3 4" fill="none" stroke={C.highlight} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="idle-blink" />
      </motion.g>
      {/* Carico graduale */}
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <IconDisc x={100} y={52}>
          <rect x="-6" y="2" width="3.2" height="3" fill={C.label} />
          <rect x="-1.6" y="-1" width="3.2" height="6" fill={C.label} />
          <rect x="2.8" y="-4" width="3.2" height="9" fill={C.label} />
        </IconDisc>
      </motion.g>
    </g>
  );
}
