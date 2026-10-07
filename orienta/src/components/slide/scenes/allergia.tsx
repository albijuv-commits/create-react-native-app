"use client";

import { motion } from "motion/react";
import type { SceneParams } from "@/lib/slides/catalog";
import { C } from "../palette";
import { Antibody, Droplet, MastCell, Mite, Mould, Pollen, RedCell, SceneLabel, TissueCell, WhiteCell, rng } from "../primitives";
import { useScene } from "../scene-context";

const ALLERGY_SITE = {
  naso: "mucosa del naso",
  occhi: "congiuntiva",
  pelle: "pelle",
  bronchi: "parete dei bronchi",
} as const;

const PARTICLE = {
  polline: C.pollen,
  acaro: C.miteDark,
  muffa: C.spore,
  generico: "#7d6bb0",
} as const;

/* -------------------------------------------------------- REAZIONE ALLERGICA */

export function ReazioneAllergica({ params }: { params: SceneParams<"reazione-allergica"> }) {
  const { step, t, slow } = useScene();
  const zoom = params.allergene !== "generico";
  const agent = zoom && step === 0;
  const mast = { x: 80, y: 100, r: 36 };
  const ige = [-150, -110, -70, -30, 10, 50, 150, 190];
  const targets = [-110, -30, 50];
  const rand = rng(5);
  const histamine = Array.from({ length: 16 }, () => {
    const a = rand() * Math.PI * 2;
    const d = 46 + rand() * 34;
    return { x: mast.x + Math.cos(a) * d, y: mast.y + Math.sin(a) * d };
  });

  return (
    <g>
      {/* Vista del tessuto con il mastocita */}
      <motion.g initial={false} animate={{ opacity: agent ? 0 : 1 }} transition={t}>
        <rect x="0" y="0" width="200" height="200" fill={C.tissue} />
        <motion.rect x="0" y="0" width="200" height="200" fill={C.tissueInflamed} initial={false} animate={{ opacity: step === 3 ? 0.4 : 0 }} transition={slow} />
        {/* Superficie in alto */}
        {params.sede === "pelle" ? (
          <path d="M-10 30 Q 50 24 100 30 T 210 30 V-10 H-10 Z" fill="#fbeef0" stroke={C.eosin} strokeWidth="1.2" />
        ) : (
          Array.from({ length: 11 }, (_, i) => (
            <TissueCell key={i} rx={9} ry={11} transform={`translate(${-2 + i * 20} 22)`} />
          ))
        )}
        {/* Bolla di orticaria sulla pelle */}
        {params.sede === "pelle" && (
          <motion.path
            d="M50 31 Q 100 2 150 31"
            fill="#fde3ea"
            stroke={C.tissueInflamed}
            strokeWidth="1.5"
            initial={false}
            animate={{ opacity: step === 3 ? 1 : 0 }}
            transition={slow}
          />
        )}
        {/* Nervo che dà prurito */}
        <path d="M-10 168 C 30 150 50 176 90 160 S 150 150 210 168" fill="none" stroke={C.nerveDark} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M-10 168 C 30 150 50 176 90 160 S 150 150 210 168" fill="none" stroke={C.nerve} strokeWidth="2" strokeLinecap="round" />
        <motion.path
          d="M96 150 l4 -6 l4 6 l4 -6 M118 148 l4 -6 l4 6 l4 -6"
          fill="none"
          stroke={C.nerveDark}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ opacity: step === 3 ? 1 : 0 }}
          transition={t}
          className={step === 3 ? "idle-blink" : undefined}
        />
        {/* Piccolo vaso sanguigno */}
        <motion.g initial={false} animate={{ scaleX: step === 3 ? 1.45 : 1 }} transition={slow}>
          <rect x="146" y="-10" width="24" height="220" fill="#f7c2cb" stroke={C.arteryWall} strokeWidth="2" />
          {[30, 62, 94, 126].map((y, i) => (
            <RedCell key={i} r={6} transform={`translate(158 ${y})`} />
          ))}
        </motion.g>
        {[
          [136, 54],
          [184, 80],
          [136, 112],
          [184, 140],
          [132, 150],
        ].map(([x, y], i) => (
          <motion.g key={i} initial={false} animate={{ opacity: step === 3 ? 0.9 : 0, y: step === 3 ? 0 : -6 }} transition={{ ...t, delay: step === 3 ? 0.5 + i * 0.12 : 0 }}>
            <Droplet s={1.4} transform={`translate(${x} ${y})`} />
          </motion.g>
        ))}

        {/* Mastocita con gli anticorpi IgE sulla superficie */}
        <MastCell r={mast.r} transform={`translate(${mast.x} ${mast.y})`} />
        <motion.circle
          cx={mast.x}
          cy={mast.y}
          r={mast.r - 2}
          fill={C.mast}
          initial={false}
          animate={{ opacity: step >= 2 ? 0.45 : 0 }}
          transition={t}
        />
        {ige.map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          const x = mast.x + Math.cos(a) * (mast.r + 5);
          const y = mast.y + Math.sin(a) * (mast.r + 5);
          return <Antibody key={i} s={1.05} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg + 90})`} />;
        })}

        {/* Allergene che si lega agli anticorpi */}
        {targets.map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          const x = mast.x + Math.cos(a) * (mast.r + 14);
          const y = mast.y + Math.sin(a) * (mast.r + 14);
          return (
            <motion.g
              key={i}
              initial={false}
              animate={{ x: step >= 1 ? x : x + Math.cos(a) * 40, y: step >= 1 ? y : y + Math.sin(a) * 40 - 20, opacity: step >= 1 ? 1 : 0 }}
              transition={{ ...t, delay: step === 1 ? i * 0.2 : 0 }}
            >
              {params.allergene === "generico" ? (
                <rect x="-4" y="-4" width="8" height="8" rx="1.5" transform="rotate(45)" fill={PARTICLE.generico} />
              ) : (
                <g className="idle-drift">
                  <circle r="5" fill={PARTICLE[params.allergene]} stroke={C.ink} strokeWidth="0.6" />
                  <circle r="1.6" cx="-1.4" cy="-1.4" fill="#ffffff" opacity="0.5" />
                </g>
              )}
            </motion.g>
          );
        })}

        {/* Istamina liberata */}
        {histamine.map((h, i) => (
          <motion.circle
            key={i}
            r="2.4"
            fill={C.histamine}
            initial={false}
            animate={{
              cx: step >= 2 ? h.x : mast.x + (h.x - mast.x) * 0.3,
              cy: step >= 2 ? h.y : mast.y + (h.y - mast.y) * 0.3,
              opacity: step === 2 ? 1 : step === 3 ? 0.55 : 0,
            }}
            transition={{ ...t, delay: step === 2 ? i * 0.04 : 0 }}
          />
        ))}
        <SceneLabel x={84} y={186 - 26}>{ALLERGY_SITE[params.sede]}</SceneLabel>
      </motion.g>

      {/* Primo piano dell'allergene */}
      {zoom && (
        <motion.g initial={false} animate={{ opacity: agent ? 1 : 0, scale: agent ? 1 : 0.4 }} transition={t}>
          {params.allergene === "polline" && (
            <g transform="translate(100 92)">
              <g className="idle-spin">
                <Pollen r={34} />
              </g>
            </g>
          )}
          {params.allergene === "acaro" && (
            <g transform="translate(100 96) scale(1.9)">
              <g className="idle-float">
                <Mite />
              </g>
            </g>
          )}
          {params.allergene === "muffa" && (
            <g transform="translate(100 104) scale(1.6)">
              <Mould />
            </g>
          )}
        </motion.g>
      )}
    </g>
  );
}

/* ---------------------------------------------------------- INFIAMMAZIONE */

const TISSUE_LABEL = { occhio: "congiuntiva", gola: "mucosa della gola", pelle: "pelle" } as const;

export function Infiammazione({ params }: { params: SceneParams<"infiammazione"> }) {
  const { step, t, slow } = useScene();
  const rand = rng(23);
  const stroma = Array.from({ length: 7 }, (_, i) => ({
    x: 18 + i * 27 + rand() * 6,
    y: i % 2 ? 84 : 152 + rand() * 6,
    rot: rand() * 50 - 25,
  }));
  const triggers = [36, 66, 98, 128, 160].map((x, i) => ({ x, y: 40 + (i % 2) * 4 }));
  const exits = [
    { x0: 70, x1: 66, y1: 60 },
    { x0: 120, x1: 128, y1: 58 },
  ];

  return (
    <g>
      <rect x="0" y="0" width="200" height="200" fill={C.tissue} />
      <motion.rect x="0" y="0" width="200" height="200" fill={C.tissueInflamed} initial={false} animate={{ opacity: step === 2 ? 0.45 : step === 3 ? 0.12 : 0 }} transition={slow} />

      {/* Superficie */}
      {params.tessuto === "occhio" && <path d="M-10 26 H210" stroke={C.water} strokeWidth="4" opacity="0.8" />}
      {params.tessuto === "pelle" && <path d="M-10 24 Q 50 19 100 24 T 210 24 V-10 H-10 Z" fill="#fbeef0" stroke={C.eosin} strokeWidth="1" />}
      {Array.from({ length: 11 }, (_, i) => (
        <TissueCell key={i} rx={params.tessuto === "gola" ? 11 : 9} ry={params.tessuto === "gola" ? 6 : 8} transform={`translate(${-2 + i * 20} 36)`} />
      ))}

      {/* Cellule del tessuto */}
      <motion.g initial={false} animate={{ scale: step === 2 ? 1.04 : 1 }} transition={slow}>
        {stroma.map((s, i) => (
          <TissueCell key={i} rx={10} ry={5} rot={s.rot} fill="#fbe6ec" transform={`translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})`} />
        ))}
      </motion.g>

      {/* Capillare che si dilata */}
      <motion.g initial={false} animate={{ scaleY: step === 2 ? 1.7 : 1 }} transition={slow}>
        <rect x="-10" y="110" width="220" height="16" fill="#f7c2cb" stroke={C.arteryWall} strokeWidth="2" />
        {[10, 40, 70, 100, 130, 160, 190].map((x, i) => (
          <RedCell key={i} r={5.5} transform={`translate(${x} 118)`} />
        ))}
      </motion.g>
      {[
        [32, 96],
        [88, 98],
        [150, 96],
        [56, 140],
        [118, 142],
        [176, 140],
      ].map(([x, y], i) => (
        <motion.g key={i} initial={false} animate={{ opacity: step === 2 ? 0.9 : 0 }} transition={{ ...t, delay: step === 2 ? 0.4 + i * 0.1 : 0 }}>
          <Droplet s={1.3} transform={`translate(${x} ${y})`} />
        </motion.g>
      ))}

      {/* Causa: microbi o allergeni sulla superficie */}
      {triggers.map((p, i) => (
        <motion.g
          key={i}
          initial={false}
          animate={{ x: p.x, y: step >= 1 ? p.y : p.y - 30, opacity: step === 1 || step === 2 ? 1 : 0 }}
          transition={{ ...t, delay: step === 1 ? i * 0.1 : 0 }}
        >
          {i % 2 ? (
            <rect x="-5" y="-2.2" width="10" height="4.4" rx="2.2" fill={C.gramNeg} />
          ) : (
            <circle r="3" fill="#8e7cc2" stroke={C.virusDark} strokeWidth="0.6" />
          )}
        </motion.g>
      ))}

      {/* Globuli bianchi che escono dal vaso */}
      {exits.map((e, i) => (
        <motion.g
          key={i}
          initial={false}
          animate={{ x: step >= 2 ? e.x1 : e.x0, y: step >= 2 ? e.y1 : 118, opacity: step >= 2 ? 1 : 0, scale: step >= 2 ? 1 : 0.5 }}
          transition={{ ...slow, delay: step === 2 ? 0.6 + i * 0.3 : 0 }}
        >
          <WhiteCell r={11} />
        </motion.g>
      ))}

      <SceneLabel x={100} y={162}>{TISSUE_LABEL[params.tessuto]}</SceneLabel>
    </g>
  );
}
