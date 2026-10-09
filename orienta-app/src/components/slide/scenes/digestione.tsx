import { useId } from "react";
import { motion } from "../motion";
import { C } from "@/components/slide/palette";
import { Idle, MotionFlowPath } from "../idle";
import { SceneLabel } from "../primitives";
import { useScene } from "../scene-context";
import { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from "react-native-svg";

/* ------------------------------------------------------------------- REFLUSSO */

const STOMACH =
  "M92 128 C 88 152 100 182 132 184 C 164 186 180 158 172 132 C 166 110 140 102 122 112 C 112 118 106 124 104 128 Z";

export function Reflusso() {
  const { step, t, slow } = useScene();
  const open = step === 1 || step === 2;
  const clip = `stomach-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <G>
      <Rect x="0" y="0" width="200" height="200" fill="#f6eef7" />
      {/* Diaframma */}
      <Path d="M10 126 C 50 104 150 100 192 122" fill="none" stroke={C.muscle} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      <SceneLabel x={44} y={102}>diaframma</SceneLabel>
      {/* Esofago */}
      <Path d="M98 -10 V 128" stroke={C.tissueDeep} strokeWidth="20" />
      <Path d="M98 -10 V 128" stroke={C.cytoplasm} strokeWidth="11" />
      <SceneLabel x={132} y={50}>esofago</SceneLabel>
      {/* Stomaco con l'acido */}
      <Defs>
        <ClipPath id={clip}>
          <Path d={STOMACH} />
        </ClipPath>
      </Defs>
      <Path d={STOMACH} fill={C.tissue} />
      <Rect x="80" y="152" width="110" height="50" fill={C.acid} opacity="0.85" clipPath={`url(#${clip})`} />
      <Path d={STOMACH} fill="none" stroke={C.membrane} strokeWidth="2" />
      <SceneLabel x={136} y={140}>stomaco</SceneLabel>

      {/* Acido che risale */}
      <motion.rect
        width="9"
        rx="4"
        fill={C.acid}
        initial={false}
        animate={{ x: 93.5, y: step === 2 ? 64 : 126, height: step === 2 ? 66 : 4, opacity: step === 2 ? 0.95 : 0 }}
        transition={slow}
      />
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        <G transform="translate(98 92)">
          <Idle kind="pulse">
            <Ellipse rx="20" ry="30" fill={C.highlightSoft} opacity="0.45" />
          </Idle>
        </G>
      </motion.g>

      {/* Valvola tra esofago e stomaco */}
      <motion.rect y="124" width="12" height="6" rx="3" fill={C.muscleDark} initial={false} animate={{ x: open ? 74 : 82 }} transition={t} />
      <motion.rect y="124" width="12" height="6" rx="3" fill={C.muscleDark} initial={false} animate={{ x: open ? 110 : 102 }} transition={t} />

      {/* Boccone che scende */}
      <motion.ellipse
        cx="98"
        rx="4.5"
        ry="7"
        fill="#b98a6a"
        initial={false}
        animate={{ cy: step === 0 ? 70 : 160, opacity: step === 0 ? 1 : 0 }}
        transition={slow}
      />

      {/* Testata del letto rialzata */}
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <G transform="translate(40 52) rotate(-12)">
          <Rect x="-22" y="-3" width="44" height="6" rx="2" fill={C.calm} stroke={C.nucleus} strokeWidth="1" />
          <Rect x="-24" y="-9" width="10" height="7" rx="3" fill="#ffffff" stroke={C.nucleus} strokeWidth="1" />
          <Path d="M-20 3 V 9 M20 3 V 14" stroke={C.nucleus} strokeWidth="1.6" strokeLinecap="round" />
        </G>
      </motion.g>
    </G>
  );
}

/* --------------------------------------------------------- INTESTINO SENSIBILE */

const GUT = "M-10 112 C 26 80 56 140 96 110 S 166 80 210 112";
const RINGS = [
  { x: 14, y: 98 },
  { x: 44, y: 112 },
  { x: 74, y: 120 },
  { x: 104, y: 106 },
  { x: 134, y: 94 },
  { x: 164, y: 98 },
  { x: 192, y: 108 },
];

export function IntestinoSensibile() {
  const { step, t, slow } = useScene();
  const irregular = step === 1 || step === 2;
  return (
    <G>
      <Rect x="0" y="0" width="200" height="200" fill="#f6eef7" />
      {/* Nervo verso il cervello */}
      <Path d="M104 104 C 112 78 128 62 146 48" fill="none" stroke={C.nerveDark} strokeWidth="3.4" strokeLinecap="round" />
      <MotionFlowPath
        d="M104 104 C 112 78 128 62 146 48"
        fill="none"
        strokeLinecap="round"
        initial={false}
        animate={{ stroke: step === 2 ? C.eosinDark : C.nerve, strokeWidth: step === 2 ? 3.4 : 2 }}
        transition={t}
      />
      <G transform="translate(156 40)">
        <Path d="M-14 4 C -18 -8 -6 -16 2 -12 C 8 -18 20 -10 16 0 C 20 8 10 14 2 10 C -4 16 -16 12 -14 4 Z" fill="#f1e8f7" stroke={C.bodyLine} strokeWidth="1.2" />
        <Path d="M-6 -4 q 4 -4 8 0 M0 4 q 4 -4 8 0" fill="none" stroke="#c9b8e3" strokeWidth="1.2" />
      </G>
      <SceneLabel x={156} y={66}>cervello</SceneLabel>

      {/* Intestino */}
      <Path d={GUT} fill="none" stroke={C.tissueDeep} strokeWidth="36" strokeLinecap="round" />
      <motion.path d={GUT} fill="none" initial={false} animate={{ stroke: step === 2 ? C.tissueInflamed : C.tissue }} strokeWidth="28" transition={slow} />
      <Path d={GUT} fill="none" stroke={C.cytoplasm} strokeWidth="16" opacity="0.8" />
      {/* Onde di contrazione */}
      {RINGS.map((r, i) => (
        <G key={i} transform={`translate(${r.x} ${r.y})`}>
          <Idle kind="pulse" duration={irregular ? 0.7 + ((i * 7) % 5) * 0.45 : 2.4} delay={-i * 0.34}>
            <Ellipse rx="4" ry="17" fill="none" stroke={C.muscleDark} strokeWidth="2" opacity="0.6" />
          </Idle>
        </G>
      ))}
      {/* Gas */}
      {[
        [40, 110, 5],
        [70, 118, 7],
        [124, 98, 6],
        [150, 96, 4],
      ].map(([x, y, r], i) => (
        <motion.g key={i} initial={false} animate={{ opacity: step === 2 ? 1 : 0, scale: step === 2 ? 1 : 0.3 }} pivot={[x!, y!]} transition={{ ...t, delay: step === 2 ? i * 0.15 : 0 }}>
          <Idle kind="float" delay={-i}>
            <Circle cx={x} cy={y} r={r} fill="#ffffff" stroke={C.inkSoft} strokeWidth="0.8" opacity="0.9" />
          </Idle>
        </motion.g>
      ))}
      {/* Dolore */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        {[
          [60, 150],
          [118, 140],
        ].map(([x, y], i) => (
          <G key={i} transform={`translate(${x} ${y})`}>
            <Idle kind="blink">
              <Path d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" fill={C.eosinDark} />
            </Idle>
          </G>
        ))}
      </motion.g>
      <SceneLabel x={70} y={162}>intestino</SceneLabel>
    </G>
  );
}
