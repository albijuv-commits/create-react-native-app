import { useId } from "react";
import { motion } from "../motion";
import type { SceneParams } from "@/lib/slides/catalog";
import { C } from "@/components/slide/palette";
import { Idle, MotionFlowPath } from "../idle";
import { SceneLabel, TriggerIcon } from "../primitives";
import { useScene } from "../scene-context";
import { Circle, ClipPath, Defs, Ellipse, G, Line, LinearGradient, Path, Rect, Stop } from "react-native-svg";

/* --------------------------------------------------------------- SENI NASALI */

/** `base`: centro del fondo di ogni seno, da cui il muco si alza (misurato nella web app) */
const SINUSES = [
  { d: "M78 50 C 78 40 96 38 97 50 C 97 58 86 62 78 50 Z", ostium: "M92 58 L97 70", base: [87.5, 57.57] },
  { d: "M122 50 C 122 40 104 38 103 50 C 103 58 114 62 122 50 Z", ostium: "M108 58 L103 70", base: [112.5, 57.57] },
  { d: "M58 104 C 56 90 82 88 88 100 C 92 112 86 126 72 126 C 62 126 59 116 58 104 Z", ostium: "M86 102 L94 98", base: [73.55, 126] },
  { d: "M142 104 C 144 90 118 88 112 100 C 108 112 114 126 128 126 C 138 126 141 116 142 104 Z", ostium: "M114 102 L106 98", base: [126.45, 126] },
] as const;

export function SeniNasali() {
  const { step, t, slow } = useScene();
  const swollen = step === 1 || step === 2;
  return (
    <G>
      {/* Viso */}
      <Path d="M100 18 C 146 18 168 56 166 100 C 164 146 136 182 100 182 C 64 182 36 146 34 100 C 32 56 54 18 100 18 Z" fill={C.body} stroke={C.bodyLine} strokeWidth="1.6" />
      {[72, 128].map((x) => (
        <G key={x}>
          <Path d={`M${x - 13} 80 Q ${x} 70 ${x + 13} 80 Q ${x} 88 ${x - 13} 80 Z`} fill="#ffffff" stroke={C.bodyLine} strokeWidth="1.2" />
          <Circle cx={x} cy="80" r="4" fill={C.nucleus} />
        </G>
      ))}
      {/* Cavità nasale */}
      <Path d="M94 66 C 92 90 88 116 90 138 L110 138 C 112 116 108 90 106 66 Z" fill={C.air} stroke={C.bodyLine} strokeWidth="1.2" />
      <Line x1="100" y1="70" x2="100" y2="136" stroke={C.bodyLine} strokeWidth="1" opacity="0.6" />

      {SINUSES.map((s, i) => (
        <G key={i}>
          <Path d={s.d} fill={C.air} />
          <motion.path
            d={s.d}
            fill={C.mucus}
            initial={false}
            animate={{ opacity: step === 2 ? 1 : step === 3 ? 0.35 : 0, scaleY: step === 2 ? 1 : 0.35 }}
            pivot={s.base}
            transition={slow}
          />
          <motion.path
            d={s.d}
            fill="none"
            initial={false}
            animate={{ strokeWidth: swollen ? 5 : 1.8, stroke: swollen ? C.tissueInflamed : C.eosin }}
            transition={slow}
          />
          {/* Canale di drenaggio */}
          <MotionFlowPath
            d={s.ostium}
            fill="none"
            stroke={C.waterDeep}
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={false}
            animate={{ opacity: step === 0 || step === 3 ? 1 : 0.1 }}
            transition={t}
          />
        </G>
      ))}

      {/* Pressione e dolore */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        {[
          [30, 108, 0],
          [170, 108, 180],
          [100, 14, 90],
        ].map(([x, y, rot], i) => (
          <G key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
            <Idle kind="pulse" pivot={[-10, 0]}>
              <Path d="M-6 -6 L-12 -9 M-7 0 H-14 M-6 6 L-12 9" stroke={C.eosinDark} strokeWidth="1.8" strokeLinecap="round" />
            </Idle>
          </G>
        ))}
      </motion.g>
      <SceneLabel x={100} y={158}>seni paranasali</SceneLabel>
    </G>
  );
}

/* ------------------------------------------------------------ ORECCHIO MEDIO */

const DRUM_FLAT = "M82 80 Q 86 98 82 116";
const DRUM_BULGED = "M82 80 Q 70 98 82 116";
const MIDDLE = "M84 76 C 96 66 122 66 128 80 C 132 96 128 116 118 122 C 106 128 90 124 84 116 Z";
const TUBE = "M112 122 C 118 140 136 152 160 166 S 186 182 196 190";
/** Centro del fondo dell'orecchio medio, da cui il pus si alza (misurato nella web app) */
const MIDDLE_BASE = [106.77, 124.89] as const;

export function OrecchioMedio() {
  const { step, t, slow } = useScene();
  const closed = step === 1 || step === 2;
  return (
    <G>
      <Rect x="0" y="0" width="200" height="200" fill={C.body} />
      {/* Condotto uditivo esterno */}
      <Path d="M-10 86 L82 82 L82 114 L-10 112 Z" fill={C.air} stroke={C.bodyLine} strokeWidth="1.4" />
      <Path d="M-10 74 C 10 70 30 76 50 74" fill="none" stroke={C.bodyLine} strokeWidth="1" opacity="0.5" />
      <SceneLabel x={36} y={128}>condotto</SceneLabel>

      {/* Orecchio medio */}
      <Path d={MIDDLE} fill={C.air} stroke={C.bodyLine} strokeWidth="1.4" />
      <motion.path
        d={MIDDLE}
        fill={C.pus}
        initial={false}
        animate={{ opacity: step === 2 ? 0.95 : step === 3 ? 0.3 : 0, scaleY: step === 2 ? 1 : 0.3 }}
        pivot={MIDDLE_BASE}
        transition={slow}
      />
      {/* Ossicini */}
      <Path d="M86 92 L98 88 L108 92 L118 90 L126 96" fill="none" stroke={C.boneDark} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="98" cy="88" r="3.2" fill={C.bone} stroke={C.boneDark} strokeWidth="1" />
      <Circle cx="118" cy="90" r="2.8" fill={C.bone} stroke={C.boneDark} strokeWidth="1" />

      {/* Orecchio interno */}
      <Path d="M142 92 m 0 -12 a 12 12 0 1 1 -1 0 a 8 8 0 1 1 1 16 a 4 4 0 1 1 -1 -8" fill="none" stroke={C.nucleus} strokeWidth="3" opacity="0.7" />
      <Path d="M136 62 a 10 10 0 1 1 18 6" fill="none" stroke={C.nucleus} strokeWidth="3" opacity="0.5" />

      {/* Timpano */}
      <motion.path d={DRUM_FLAT} fill="none" stroke={C.eosinDark} strokeWidth="2.6" initial={false} animate={{ opacity: step === 2 ? 0 : 1 }} transition={t} />
      <motion.path d={DRUM_BULGED} fill="none" stroke={C.eosinDark} strokeWidth="2.6" initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t} />
      <SceneLabel x={82} y={70}>timpano</SceneLabel>

      {/* Tromba di Eustachio */}
      <Path d={TUBE} fill="none" stroke={C.tissueDeep} strokeWidth="13" strokeLinecap="round" />
      <motion.path
        d={TUBE}
        fill="none"
        strokeLinecap="round"
        initial={false}
        animate={{ strokeWidth: closed ? 1.2 : 6, stroke: closed ? C.tissueInflamed : C.air }}
        transition={slow}
      />
      <MotionFlowPath
        d={TUBE}
        fill="none"
        stroke={C.waterDeep}
        strokeWidth="1.6"
        initial={false}
        animate={{ opacity: closed ? 0 : 1 }}
        transition={t}
      />
      <SceneLabel x={134} y={152}>tromba di Eustachio</SceneLabel>

      {/* Dolore */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        <G transform="translate(66 98)">
          <Idle kind="pulse" pivot={[-9, 0]}>
            <Path d="M-4 -10 L-10 -16 M-6 0 H-14 M-4 10 L-10 16" stroke={C.eosinDark} strokeWidth="1.8" strokeLinecap="round" />
          </Idle>
        </G>
      </motion.g>
    </G>
  );
}

/* ----------------------------------------------------------- ONDA EMICRANIA */

const BRAIN =
  "M44 96 C 40 60 72 34 112 36 C 150 38 172 62 170 96 C 168 118 154 130 132 132 L 74 134 C 54 132 46 118 44 96 Z";

export function OndaEmicrania() {
  const { step, t, slow } = useScene();
  const clip = `brain-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const wave = { ...slow, duration: slow.duration === 0 ? 0 : 2.8 };
  return (
    <G>
      <Defs>
        <ClipPath id={clip}>
          <Path d={BRAIN} />
        </ClipPath>
        <LinearGradient id={`${clip}-g`} x1="0" x2="1">
          <Stop offset="0" stopColor={C.spikeSoft} stopOpacity="0" />
          <Stop offset="0.5" stopColor={C.nucleus} stopOpacity="0.75" />
          <Stop offset="1" stopColor={C.spikeSoft} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {/* Cervelletto e tronco */}
      <Ellipse cx="148" cy="134" rx="24" ry="15" fill="#e7dcf3" stroke={C.bodyLine} strokeWidth="1.3" />
      <Path d="M118 132 C 120 150 122 166 126 184 L 138 184 C 136 166 136 150 138 132 Z" fill="#e7dcf3" stroke={C.bodyLine} strokeWidth="1.3" />
      {/* Cervello */}
      <motion.path d={BRAIN} initial={false} animate={{ fill: step === 3 ? "#e9e3ef" : "#f1e8f7" }} transition={slow} stroke={C.bodyLine} strokeWidth="1.6" />
      <G clipPath={`url(#${clip})`}>
        {[
          "M60 70 C 74 62 80 76 94 66 S 116 58 126 66",
          "M56 96 C 70 86 82 102 98 90 S 128 82 150 92",
          "M66 118 C 80 108 94 122 112 112 S 140 106 160 112",
          "M104 42 C 100 58 112 70 106 86",
          "M136 50 C 128 62 140 76 132 90",
        ].map((d, i) => (
          <Path key={i} d={d} fill="none" stroke="#c9b8e3" strokeWidth="2" strokeLinecap="round" />
        ))}
        {/* Onda dell'aura: dalla nuca verso la fronte */}
        <motion.rect
          y="20"
          width="46"
          height="130"
          fill={`url(#${clip}-g)`}
          initial={false}
          animate={{ x: step === 1 ? 26 : 176, opacity: step === 1 ? 1 : 0 }}
          transition={step === 1 ? wave : { duration: 0 }}
        />
      </G>
      {/* Vaso delle meningi */}
      <motion.path
        d="M58 64 C 76 46 104 40 128 44"
        fill="none"
        stroke={C.artery}
        strokeLinecap="round"
        initial={false}
        animate={{ strokeWidth: step === 2 ? 6 : 2.6 }}
        transition={slow}
      />
      {/* Nervo trigemino */}
      <motion.path
        d="M122 140 C 104 142 88 134 76 120 S 60 86 62 66"
        fill="none"
        strokeLinecap="round"
        initial={false}
        animate={{ stroke: step === 2 ? C.nerve : "#e9d49a", strokeWidth: step === 2 ? 4.5 : 2.4 }}
        transition={t}
      />
      {/* Dolore pulsante */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        <G transform="translate(64 60)">
          <Idle kind="beat">
            <Circle r="16" fill={C.highlightSoft} opacity="0.55" />
            <Circle r="9" fill={C.eosinDark} opacity="0.35" />
          </Idle>
        </G>
      </motion.g>
      {/* Disturbi della vista dell'aura */}
      <motion.g initial={false} animate={{ opacity: step === 1 ? 1 : 0 }} transition={t}>
        <G transform="translate(30 132)">
          <Idle kind="blink">
            <Path d="M-12 0 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6" fill="none" stroke={C.eosinDark} strokeWidth="1.8" strokeLinejoin="round" />
          </Idle>
        </G>
      </motion.g>
      <SceneLabel x={88} y={160}>nervo trigemino</SceneLabel>
    </G>
  );
}

/* --------------------------------------------------------- TENSIONE MUSCOLARE */

export function TensioneMuscolare({ params }: { params: SceneParams<"tensione-muscolare"> }) {
  return params.zona === "testa" ? <TensioneTesta /> : <TensioneMandibola />;
}

function TensioneTesta() {
  const { step, t, slow } = useScene();
  const tense = step === 1 || step === 2;
  return (
    <G>
      {/* Spalle e collo */}
      <motion.g initial={false} animate={{ y: tense ? -7 : 0 }} transition={slow}>
        <Path d="M24 196 C 26 160 52 150 80 146 L 120 146 C 148 150 174 160 176 196 Z" fill={C.body} stroke={C.bodyLine} strokeWidth="1.5" />
        <motion.path
          d="M80 146 C 70 150 50 154 40 166 M120 146 C 130 150 150 154 160 166"
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          initial={false}
          animate={{ stroke: tense ? C.muscle : "#efcfd6" }}
          transition={slow}
        />
      </motion.g>
      <Rect x="84" y="112" width="32" height="40" rx="10" fill={C.body} stroke={C.bodyLine} strokeWidth="1.5" />
      {/* Testa */}
      <Ellipse cx="100" cy="76" rx="38" ry="46" fill={C.body} stroke={C.bodyLine} strokeWidth="1.6" />
      <motion.g initial={false} animate={{ opacity: tense ? 0.9 : 0.35 }} transition={slow}>
        <Path d="M70 52 C 84 42 116 42 130 52 L 128 62 C 116 56 84 56 72 62 Z" fill={C.muscle} />
        <Ellipse cx="66" cy="76" rx="8" ry="16" fill={C.muscle} />
        <Ellipse cx="134" cy="76" rx="8" ry="16" fill={C.muscle} />
      </motion.g>
      {[86, 114].map((x) => (
        <Path key={x} d={`M${x - 7} 80 Q ${x} 76 ${x + 7} 80`} fill="none" stroke={C.bodyLine} strokeWidth="1.6" strokeLinecap="round" />
      ))}
      <motion.path d="M80 66 L92 70 M120 66 L108 70" stroke={C.bodyLine} strokeWidth="1.6" strokeLinecap="round" initial={false} animate={{ opacity: tense ? 1 : 0 }} transition={t} />
      <Path d="M92 100 Q 100 104 108 100" fill="none" stroke={C.bodyLine} strokeWidth="1.4" strokeLinecap="round" />

      {/* Fascia che stringe */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        <Idle kind="pulse" pivot={[100, 62]}>
          <Ellipse cx="100" cy="62" rx="42" ry="14" fill="none" stroke={C.eosinDark} strokeWidth="4" opacity="0.85" />
        </Idle>
      </motion.g>
      {/* Cause */}
      <motion.g initial={false} animate={{ opacity: step === 1 ? 1 : 0 }} transition={t}>
        <TriggerIcon kind="stress" transform="translate(52 46)" />
        <G transform="translate(148 46)">
          <Circle r="9" fill="#ffffff" stroke={C.inkSoft} strokeWidth="0.8" />
          <Rect x="-5.5" y="-4" width="11" height="7" rx="1" fill="none" stroke={C.inkSoft} strokeWidth="1.2" />
          <Path d="M-7 4.5 H7" stroke={C.inkSoft} strokeWidth="1.2" strokeLinecap="round" />
        </G>
      </motion.g>
      {/* Rilassamento */}
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        {[52, 64].map((r, i) => (
          <Idle key={i} kind="breathe" pivot={[100, 76]} delay={-i}>
            <Circle cx="100" cy="76" r={r} fill="none" stroke={C.calm} strokeWidth="1.5" />
          </Idle>
        ))}
      </motion.g>
    </G>
  );
}

function TensioneMandibola() {
  const { step, t, slow } = useScene();
  const clench = step === 1 || step === 2;
  const muscleFill = step === 2 ? C.muscle : "#efcfd6";
  return (
    <G>
      {/* Collo */}
      <Path d="M96 150 L 92 210 L 176 210 L 160 118 Z" fill={C.body} stroke={C.bodyLine} strokeWidth="1.5" />
      {/* Cranio e parte alta del viso, rivolto a sinistra */}
      <Path
        d="M128 18 C 160 20 182 50 180 86 C 178 104 168 116 152 122 L 140 112 L 62 112 C 56 112 52 108 52 104 C 50 100 54 96 56 94 C 50 92 42 88 44 84 C 50 74 58 66 62 58 C 66 40 92 18 128 18 Z"
        fill={C.body}
        stroke={C.bodyLine}
        strokeWidth="1.5"
      />
      <Path d="M78 56 Q 84 52 90 56" fill="none" stroke={C.bodyLine} strokeWidth="1.4" strokeLinecap="round" />
      <Circle cx="84" cy="62" r="3.4" fill={C.nucleus} />
      <Path d="M152 86 C 162 84 164 104 152 106" fill="none" stroke={C.bodyLine} strokeWidth="1.6" strokeLinecap="round" />
      {/* Muscolo temporale */}
      <motion.path d="M100 44 C 116 30 148 34 152 58 C 144 72 124 80 108 84 C 104 70 100 58 100 44 Z" initial={false} animate={{ fill: muscleFill, opacity: step === 2 ? 0.95 : 0.6 }} transition={slow} />
      {/* Articolazione della mandibola */}
      <motion.circle cx="140" cy="108" r="6" initial={false} animate={{ fill: step === 2 ? C.highlightSoft : C.bone }} transition={t} stroke={C.boneDark} strokeWidth="1.4" />
      {/* Denti superiori */}
      {[60, 70, 80, 90, 100].map((x) => (
        <Rect key={x} x={x} y="104" width="8" height="9" rx="2" fill="#ffffff" stroke={C.boneDark} strokeWidth="1" />
      ))}
      {/* Mandibola con i denti inferiori */}
      <motion.g initial={false} animate={{ y: clench ? 0 : 6 }} transition={t}>
        <Idle kind="grind" active={clench}>
          <Path d="M56 118 L 136 116 C 144 132 140 150 128 158 C 112 166 80 166 66 158 C 56 150 52 132 56 118 Z" fill={C.body} stroke={C.bodyLine} strokeWidth="1.5" />
          {[60, 70, 80, 90, 100].map((x) => (
            <Rect key={x} x={x} y="114" width="8" height="9" rx="2" fill="#ffffff" stroke={C.boneDark} strokeWidth="1" />
          ))}
          <motion.ellipse cx="122" cy="134" rx="12" ry="19" initial={false} animate={{ fill: muscleFill, opacity: step === 2 ? 0.95 : 0.6 }} transition={slow} />
        </Idle>
      </motion.g>
      {/* Smalto consumato */}
      <motion.g initial={false} animate={{ opacity: step >= 2 ? 1 : 0 }} transition={t}>
        {[64, 84].map((x) => (
          <Path key={x} d={`M${x - 3} 113.5 H ${x + 3}`} stroke={C.eosinDark} strokeWidth="1.6" strokeLinecap="round" />
        ))}
      </motion.g>
      {/* Bite notturno */}
      <motion.rect x="56" y="111" width="56" height="6" rx="3" fill={C.water} initial={false} animate={{ opacity: step === 3 ? 0.85 : 0 }} transition={t} />
      <motion.g initial={false} animate={{ opacity: step <= 1 ? 1 : 0 }} transition={t}>
        <TriggerIcon kind="luna" transform="translate(54 34)" />
      </motion.g>
      <SceneLabel x={150} y={168}>massetere</SceneLabel>
    </G>
  );
}
