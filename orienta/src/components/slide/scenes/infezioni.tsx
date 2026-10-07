"use client";

import { motion } from "motion/react";
import { VIRUS_SIZES, type SceneParams } from "@/lib/slides/catalog";
import { C } from "../palette";
import { Antibody, Bacillus, SceneLabel, Streptococcus, TriggerIcon, Virus, WhiteCell, rng } from "../primitives";
import { useScene } from "../scene-context";

/** Superficie di una cellula vista da molto vicino: linea ondulata con l'interno sotto */
const surfaceY = (x: number) => 140 + 3 * Math.sin((x / 200) * Math.PI * 3);

function surfacePath(base = 0) {
  const pts: string[] = [];
  for (let x = -10; x <= 210; x += 10) pts.push(`${x} ${(surfaceY(x) + base).toFixed(1)}`);
  return `M${pts.join(" L")} L210 215 L-10 215 Z`;
}

function surfaceLine() {
  const pts: string[] = [];
  for (let x = -10; x <= 210; x += 10) pts.push(`${x} ${surfaceY(x).toFixed(1)}`);
  return `M${pts.join(" L")}`;
}

const SITE_LABEL = {
  naso: "mucosa del naso",
  gola: "mucosa della gola",
  polmoni: "vie respiratorie",
  intestino: "intestino",
  vescica: "parete della vescica",
  orecchio: "orecchio medio",
} as const;

/* ------------------------------------------------------- INFEZIONE VIRALE */

export function InfezioneVirale({ params }: { params: SceneParams<"infezione-virale"> }) {
  const { step, t, slow } = useScene();
  const r = VIRUS_SIZES[params.virus].drawn / 2;
  const intestine = params.sede === "intestino";
  const villusH = intestine ? 26 : 0;
  const small = r < 9;

  const dockX = intestine ? 99 : 98;
  const dockY = surfaceY(dockX) - villusH - r * 0.95;

  const free: { p: [number, number][]; rot: number }[] = [
    { p: [[58, 58], [70, 96], [70, 96], [62, 90]], rot: 20 },
    { p: [[134, 44], [134, 84], [134, 84], [130, 78]], rot: -15 },
    { p: [[154, 96], [160, 108], [160, 108], [156, 100]], rot: 40 },
    ...(small
      ? ([
          { p: [[36, 96], [42, 110], [42, 110], [40, 104]], rot: 0 },
          { p: [[106, 30], [112, 56], [112, 56], [108, 52]], rot: 10 },
        ] as { p: [number, number][]; rot: number }[])
      : []),
  ];
  const progeny = [44, 128, 166].map((x) => ({ x, y: surfaceY(x) - villusH - r * 0.75 }));

  return (
    <g>
      {/* Muco sopra la cellula (vie respiratorie) */}
      {!intestine && (
        <g opacity="0.55">
          <path d={`${surfaceLine()} L210 112 C 150 104 120 118 80 110 S 20 104 -10 112 Z`} fill={C.mucus} />
          <path d="M10 124 C 40 116 70 128 100 120 S 160 118 196 126" fill="none" stroke={C.mucusDark} strokeWidth="0.8" />
        </g>
      )}

      {/* Cellula: si arrossa quando è infettata */}
      <motion.path
        d={surfacePath()}
        initial={false}
        animate={{ fill: step === 2 ? C.tissueInflamed : step === 3 ? C.tissueDeep : C.cytoplasm }}
        transition={slow}
        stroke={C.membrane}
        strokeWidth="2"
      />
      {intestine &&
        Array.from({ length: 15 }, (_, i) => {
          const x = -4 + i * 14.5;
          const y = surfaceY(x);
          return (
            <g key={i}>
              <rect x={x - 4.5} y={y - villusH} width="9" height={villusH + 3} rx="4.5" fill={C.cytoplasm} stroke={C.membrane} strokeWidth="1.2" />
              <path d={`M${x - 3} ${y - villusH - 1} l-1 -3 M${x} ${y - villusH - 1} l0 -3.5 M${x + 3} ${y - villusH - 1} l1 -3`} stroke={C.membrane} strokeWidth="0.6" />
            </g>
          );
        })}

      {/* Recettori sulla superficie */}
      {!intestine &&
        [16, 40, 64, 98, 122, 146, 172].map((x) => {
          const y = surfaceY(x);
          const docking = x === 98;
          return (
            <g key={x}>
              {docking && (
                <motion.circle cx={x} cy={y - 4} r="8" fill={C.highlightSoft} initial={false} animate={{ opacity: step === 1 ? 0.9 : 0 }} transition={t} />
              )}
              <path d={`M${x - 3} ${y - 7} v3 a3 3 0 0 0 6 0 v-3`} fill="none" stroke={C.eosinDark} strokeWidth="1.4" strokeLinecap="round" />
            </g>
          );
        })}

      {/* Organelli dentro la cellula */}
      <g opacity="0.55">
        <ellipse cx="40" cy="168" rx="9" ry="4" fill={C.eosin} />
        <ellipse cx="150" cy="166" rx="10" ry="4.5" fill={C.eosin} />
        <path d="M80 158 q 10 -4 20 0 t 20 0" fill="none" stroke={C.eosin} strokeWidth="1.2" />
      </g>
      <SceneLabel x={100} y={190 - 28}>{SITE_LABEL[params.sede]}</SceneLabel>

      {/* Il virus che entra */}
      <motion.g
        initial={false}
        animate={{
          x: step === 0 ? 92 : dockX,
          y: step === 0 ? 62 : step === 1 ? dockY : dockY + r * 2 + 10,
          opacity: step >= 2 ? 0 : 1,
        }}
        transition={t}
      >
        <g className="idle-drift">
          <Virus kind={params.virus} r={r} />
        </g>
      </motion.g>

      {/* Nuovi virus che escono dalla cellula */}
      {progeny.map((p, i) => (
        <motion.g
          key={i}
          initial={false}
          animate={{ x: p.x, y: step >= 2 ? p.y : p.y + r * 1.4, scale: step >= 2 ? 1 : 0.2, opacity: step >= 2 ? (step === 3 ? 0.55 : 1) : 0 }}
          transition={{ ...t, delay: step === 2 ? i * 0.25 : 0 }}
        >
          <Virus kind={params.virus} r={r} />
        </motion.g>
      ))}

      {/* Virus liberi */}
      {free.map((f, i) => (
        <motion.g
          key={i}
          initial={false}
          animate={{ x: f.p[step][0], y: f.p[step][1], opacity: step === 3 ? 0.55 : 1 }}
          transition={t}
        >
          <g className="idle-drift" style={{ animationDelay: `${-i * 1.7}s` }}>
            <g transform={`rotate(${f.rot})`}>
              <Virus kind={params.virus} r={r} />
            </g>
          </g>
        </motion.g>
      ))}

      {/* Anticorpi che si legano ai virus */}
      {[...free.map((f) => f.p[3]), ...progeny.map((p) => [p.x, p.y] as [number, number])].map(([x, y], i) => (
        <motion.g
          key={`ab${i}`}
          initial={false}
          animate={{ x: x + (i % 2 ? r + 3 : -r - 3), y: step === 3 ? y - r * 0.4 : y - 40, opacity: step === 3 ? 1 : 0 }}
          transition={{ ...t, delay: step === 3 ? 0.2 + i * 0.08 : 0 }}
        >
          <Antibody s={1} transform={`rotate(${i % 2 ? -70 : 70})`} />
        </motion.g>
      ))}

      {/* Un globulo bianco, molto più grande dei virus, arriva dal lato */}
      <motion.g initial={false} animate={{ x: step === 3 ? 226 : 300, y: 64 }} transition={slow}>
        <WhiteCell r={74} lobeShift={-0.42} />
      </motion.g>
    </g>
  );
}

/* ---------------------------------------------------- INFEZIONE BATTERICA */

export function InfezioneBatterica({ params }: { params: SceneParams<"infezione-batterica"> }) {
  const { step, t, slow } = useScene();
  const rod = params.batterio === "bacillo";

  const first = [
    { a: [56, 50], b: [64, surfaceY(64) - 12], rot: [30, -8] },
    { a: [118, 36], b: [112, surfaceY(112) - 12], rot: [-25, 6] },
    { a: [150, 70], b: [150, surfaceY(150) - 12], rot: [55, -4] },
  ];
  const offspring = [
    { x: 40, rot: 10 },
    { x: 86, rot: -12 },
    { x: 132, rot: 8 },
    { x: 172, rot: -6 },
    { x: 96, rot: 30, up: 18 },
    { x: 146, rot: -30, up: 18 },
  ];
  const engulfed = (x: number) => step === 3 && x < 100;

  return (
    <g>
      <motion.path
        d={surfacePath()}
        initial={false}
        animate={{ fill: step === 2 ? C.tissueInflamed : step === 3 ? C.tissueDeep : C.cytoplasm }}
        transition={slow}
        stroke={C.membrane}
        strokeWidth="2"
      />
      <path d={surfaceLine()} fill="none" stroke={C.eosin} strokeWidth="5" strokeDasharray="1 3" opacity="0.5" transform="translate(0 2)" />
      <SceneLabel x={100} y={162}>{SITE_LABEL[params.sede]}</SceneLabel>

      {/* Globulo bianco (neutrofilo) che arriva e ingloba i batteri */}
      <motion.g initial={false} animate={{ x: step === 2 ? -6 : step === 3 ? 34 : -80, y: 92 }} transition={slow}>
        <WhiteCell r={44} />
      </motion.g>

      {first.map((b, i) => {
        const [x, y] = step === 0 ? b.a : b.b;
        const gone = engulfed(b.b[0]);
        return (
          <motion.g
            key={i}
            initial={false}
            animate={{ x: gone ? 34 : x, y: gone ? 92 : y, rotate: step === 0 ? b.rot[0] : b.rot[1], scale: gone ? 0.4 : 1, opacity: gone ? 0 : 1 }}
            transition={t}
          >
            <g className="idle-wiggle" style={{ animationDelay: `${-i * 0.4}s` }}>
              {rod ? <Bacillus len={30} /> : <Streptococcus n={5} r={4.4} transform="translate(-16 0)" />}
            </g>
          </motion.g>
        );
      })}

      {offspring.map((o, i) => {
        const y = surfaceY(o.x) - 12 - (o.up ?? 0);
        const gone = engulfed(o.x);
        return (
          <motion.g
            key={`o${i}`}
            initial={false}
            animate={{
              x: gone ? 34 : o.x,
              y: gone ? 92 : y,
              rotate: o.rot,
              scale: step >= 1 && !gone ? 1 : 0.3,
              opacity: step >= 1 && !gone ? 1 : 0,
            }}
            transition={{ ...t, delay: step === 1 ? 0.3 + i * 0.15 : 0 }}
          >
            {rod ? <Bacillus len={28} /> : <Streptococcus n={4} r={4.2} transform="translate(-12 0)" />}
          </motion.g>
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------- HERPES LATENZA */

const NERVE = "M58 152 C 58 120 92 116 106 98 S 132 68 144 60";

export function HerpesLatenza({ params }: { params: SceneParams<"herpes-latenza"> }) {
  const { step, t, slow } = useScene();
  const varicella = params.variante === "varicella";
  const rand = rng(17);
  const rash = Array.from({ length: varicella ? 11 : 0 }, () => ({ x: 22 + rand() * 156, y: 158 + rand() * 18 }));
  const blisters = varicella
    ? [36, 48, 60, 72, 84].map((x, i) => ({ x, y: 156 + (i % 2) * 5 }))
    : [50, 58, 66].map((x, i) => ({ x, y: 154 + (i % 2) * 3 }));
  const showBlisters = step === 0 ? !varicella : step === 3;
  const upStep = varicella ? 2 : 1;
  const latent = step === 2;
  const travel = { ...slow, duration: slow.duration === 0 ? 0 : 2.4 };

  return (
    <g>
      {/* Pelle */}
      <path d="M-10 150 Q 60 144 100 150 T 210 150 L210 215 L-10 215 Z" fill={C.tissue} stroke={C.eosin} strokeWidth="1.5" />
      <path d="M-10 156 Q 60 150 100 156 T 210 156" fill="none" stroke={C.eosin} strokeWidth="0.8" opacity="0.6" />
      <SceneLabel x={150} y={168}>pelle</SceneLabel>
      {varicella && <rect x="174" y="-10" width="40" height="160" rx="14" fill="#efe6f7" stroke={C.nucleus} strokeWidth="1.2" />}
      {varicella && <SceneLabel x={170} y={128} anchor="end">midollo spinale</SceneLabel>}

      {/* Nervo e ganglio */}
      <path d={NERVE} fill="none" stroke={C.nerveDark} strokeWidth="5" strokeLinecap="round" />
      <path d={NERVE} fill="none" stroke={C.nerve} strokeWidth="3" strokeLinecap="round" />
      <motion.ellipse
        cx="148"
        cy="56"
        rx="30"
        ry="24"
        fill="none"
        stroke={C.nucleus}
        strokeWidth="1.5"
        strokeDasharray="3 3"
        initial={false}
        animate={{ opacity: latent ? 0.9 : 0 }}
        transition={{ ...t, delay: latent && varicella ? 2 : 0 }}
        className={latent ? "idle-blink" : undefined}
      />
      <ellipse cx="148" cy="56" rx="24" ry="19" fill="#fbeedc" stroke={C.nerveDark} strokeWidth="1.4" />
      {[
        [138, 50],
        [154, 46],
        [146, 62],
        [160, 60],
        [134, 63],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6.5" fill={C.cytoplasm} stroke={C.eosin} strokeWidth="0.8" />
          <circle cx={x} cy={y} r="2.4" fill={C.nucleus} />
        </g>
      ))}
      <SceneLabel x={146} y={varicella ? 96 : 92}>ganglio nervoso</SceneLabel>

      {/* Virus addormentato nel ganglio */}
      <motion.g initial={false} animate={{ opacity: latent ? 0.75 : 0 }} transition={{ ...t, delay: latent && varicella ? 2 : 0 }}>
        <Virus kind="herpesvirus" r={5} transform="translate(146 55)" />
      </motion.g>

      {/* Il virus che viaggia lungo il nervo */}
      <motion.path
        d={NERVE}
        fill="none"
        stroke={C.virus}
        strokeWidth="5.5"
        strokeLinecap="round"
        initial={false}
        animate={{
          pathLength: 0.14,
          pathOffset: step >= upStep && step <= 2 ? 0.86 : 0,
          opacity: step === upStep || step === 3 ? 1 : 0,
        }}
        transition={travel}
      />

      {/* Puntini della varicella su tutta la pelle */}
      {rash.map((s, i) => (
        <motion.g key={i} initial={false} animate={{ opacity: step === 1 ? 1 : 0 }} transition={{ ...t, delay: step === 1 ? i * 0.08 : 0 }}>
          <circle cx={s.x} cy={s.y} r="3.4" fill={C.tissueInflamed} />
          <circle cx={s.x} cy={s.y - 0.6} r="1.8" fill="#fff6f8" />
        </motion.g>
      ))}

      {/* Vescicole */}
      {blisters.map((b, i) => (
        <motion.g
          key={`b${i}`}
          initial={false}
          animate={{ opacity: showBlisters ? 1 : 0, scale: showBlisters ? 1 : 0.4 }}
          transition={{ ...t, delay: showBlisters ? 0.2 + i * 0.12 : 0 }}
        >
          <ellipse cx={b.x} cy={b.y} rx="6" ry="4.6" fill="#fff6f8" stroke={C.tissueInflamed} strokeWidth="1.6" />
          <ellipse cx={b.x - 1.5} cy={b.y - 1.5} rx="1.6" ry="1" fill="#ffffff" />
        </motion.g>
      ))}

      {/* Virus al primo contatto: sulla pelle (labiale) o nell'aria respirata (varicella) */}
      <motion.g initial={false} animate={{ opacity: step === 0 ? 1 : 0 }} transition={t}>
        {(varicella
          ? [
              [40, 70],
              [62, 52],
              [84, 76],
              [58, 98],
            ]
          : [
              [44, 136],
              [58, 128],
              [72, 138],
            ]
        ).map(([x, y], i) => (
          <g key={i} className="idle-float" style={{ animationDelay: `${-i}s` }}>
            <Virus kind="herpesvirus" r={5} transform={`translate(${x} ${y})`} />
          </g>
        ))}
      </motion.g>

      {/* Fattori che risvegliano il virus */}
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        {varicella ? (
          <SceneLabel x={70} y={40}>anni dopo</SceneLabel>
        ) : (
          <>
            <TriggerIcon kind="sole" transform="translate(28 70)" />
            <TriggerIcon kind="stress" transform="translate(50 46)" />
          </>
        )}
      </motion.g>
    </g>
  );
}
