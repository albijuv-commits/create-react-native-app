import { motion } from "../motion";
import { C } from "@/components/slide/palette";
import { FlowPath, Idle } from "../idle";
import { SvgLabel } from "../label";
import { SceneLabel, TriggerIcon } from "../primitives";
import { useScene } from "../scene-context";
import { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

/* ---------------------------------------------------------------- CICLO SONNO */

const LEVELS = { S: 62, R: 82, L: 102, P: 124 } as const;
type Level = keyof typeof LEVELS;

/**
 * Ipnogramma: segmenti [x di fine, fase]. L'asse va dalle 23 (x=54) alle 7 (x=166).
 * Con il tracciato serve anche la sua lunghezza, per disegnarlo un po' alla volta.
 */
function hypnogram(segments: [number, Level][]) {
  let d = `M54 ${LEVELS.S}`;
  let x = 54;
  let y: number = LEVELS.S;
  let length = 0;
  for (const [x2, level] of segments) {
    d += ` V${LEVELS[level]} H${x2}`;
    length += Math.abs(LEVELS[level] - y) + Math.abs(x2 - x);
    x = x2;
    y = LEVELS[level];
  }
  if (x < 166) {
    d += ` H166`;
    length += 166 - x;
  }
  return { d, length };
}

const NIGHTS = {
  normale: hypnogram([
    [58, "S"], [62, "L"], [78, "P"], [84, "L"], [89, "R"], [95, "L"], [106, "P"], [112, "L"], [119, "R"],
    [128, "L"], [137, "R"], [145, "L"], [156, "R"], [166, "S"],
  ]),
  lunga: hypnogram([
    [86, "S"], [92, "L"], [104, "P"], [110, "L"], [116, "R"], [126, "L"], [134, "P"], [140, "L"], [150, "R"], [160, "L"], [166, "S"],
  ]),
  interrotta: hypnogram([
    [84, "S"], [90, "L"], [100, "P"], [106, "L"], [110, "S"], [116, "L"], [122, "R"], [128, "S"], [136, "L"], [142, "R"], [148, "S"], [166, "S"],
  ]),
};

export function CicloSonno() {
  const { step, t, slow } = useScene();
  const draw = { ...slow, duration: slow.duration === 0 ? 0 : 2 };
  const active = step === 0 || step === 3 ? "normale" : step === 1 ? "lunga" : "interrotta";
  return (
    <G>
      <Rect x="0" y="0" width="200" height="200" fill="#f4eff9" />
      {(Object.keys(LEVELS) as Level[]).map((k) => (
        <G key={k}>
          <Line x1="54" x2="168" y1={LEVELS[k]} y2={LEVELS[k]} stroke="#d9d0ea" strokeWidth="1" strokeDasharray="2 3" />
          <SvgLabel x={50} y={LEVELS[k] + 2.2} anchor="end" size={6.4} bold fill={C.label}>
            {{ S: "sveglio", R: "REM", L: "leggero", P: "profondo" }[k]}
          </SvgLabel>
        </G>
      ))}
      {(
        [
          [54, "23"],
          [82, "1"],
          [110, "3"],
          [138, "5"],
          [166, "7"],
        ] as const
      ).map(([x, h]) => (
        <SvgLabel key={h} x={x} y={140} anchor="middle" size={6.4} fill={C.inkSoft}>
          {h}
        </SvgLabel>
      ))}
      <Rect x="54" y={LEVELS.P - 4} width="112" height="8" fill={C.calm} opacity="0.35" />

      {(Object.keys(NIGHTS) as (keyof typeof NIGHTS)[]).map((k) => (
        <motion.path
          key={k}
          d={NIGHTS[k].d}
          length={NIGHTS[k].length}
          fill="none"
          stroke={k === "normale" ? C.nucleus : C.eosinDark}
          strokeWidth="2.6"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: active === k ? 1 : 0, opacity: active === k ? 1 : 0 }}
          transition={active === k ? draw : { duration: 0 }}
        />
      ))}

      <TriggerIcon kind="luna" transform="translate(64 38)" />
      <motion.g initial={false} animate={{ opacity: step === 1 || step === 2 ? 1 : 0 }} transition={t}>
        <G transform="translate(100 36)">
          <Path d="M-12 4 C -16 -6 -4 -12 2 -8 C 8 -14 18 -6 14 2 C 18 10 6 14 0 10 C -6 14 -16 10 -12 4 Z" fill="#ffffff" stroke={C.inkSoft} strokeWidth="1" />
          <Circle cx="-10" cy="16" r="2" fill="#ffffff" stroke={C.inkSoft} strokeWidth="0.8" />
          <Path d="M-6 0 h12 M-6 4 h8" stroke={C.inkSoft} strokeWidth="1" strokeLinecap="round" />
        </G>
      </motion.g>
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <TriggerIcon kind="sole" transform="translate(150 40)" />
      </motion.g>
      <SceneLabel x={110} y={156}>ore della notte</SceneLabel>
    </G>
  );
}

/* -------------------------------------------------------------------- ALLARME */

const HEART = "M0 4 C -8 -2 -9 -9 -4 -10 C -1 -11 0 -8 0 -7 C 0 -8 1 -11 4 -10 C 9 -9 8 -2 0 4 Z";

export function Allarme() {
  const { step, t, slow } = useScene();
  const alarm = step === 1 || step === 2;
  const body = step === 2;
  return (
    <G>
      {/* Busto */}
      <Path d="M42 200 C 42 140 52 104 76 96 L 124 96 C 148 104 158 140 158 200 Z" fill={C.body} stroke={C.bodyLine} strokeWidth="1.5" />
      <Rect x="90" y="74" width="20" height="26" rx="8" fill={C.body} stroke={C.bodyLine} strokeWidth="1.5" />
      <Circle cx="100" cy="50" r="28" fill={C.body} stroke={C.bodyLine} strokeWidth="1.5" />
      {/* Cervello e amigdala */}
      <Path d="M80 46 C 80 30 120 30 120 46 C 122 56 112 62 100 60 C 88 62 78 56 80 46 Z" fill="#f1e8f7" stroke="#c9b8e3" strokeWidth="1.2" />
      <motion.ellipse cx="104" cy="50" rx="5" ry="3.4" initial={false} animate={{ fill: alarm ? C.highlight : C.nucleus }} transition={t} />
      <motion.g initial={false} animate={{ opacity: alarm ? 1 : 0 }} transition={t}>
        {[10, 16].map((r, i) => (
          <Idle key={r} kind="pulse" pivot={[104, 50]} delay={-i * 0.6}>
            <Circle cx="104" cy="50" r={r} fill="none" stroke={C.highlight} strokeWidth="1.2" />
          </Idle>
        ))}
      </motion.g>

      {/* Segnali verso il corpo */}
      <motion.g initial={false} animate={{ opacity: body ? 1 : 0 }} transition={t}>
        {["M104 60 C 112 80 116 96 112 112", "M100 60 C 88 86 84 110 86 120", "M106 60 C 130 78 140 94 146 110", "M98 62 C 98 100 98 130 98 150"].map((d, i) => (
          <FlowPath key={i} d={d} fill="none" stroke={C.highlight} strokeWidth="1.6" />
        ))}
      </motion.g>

      {/* Polmoni */}
      <motion.g initial={false} animate={{ opacity: body ? 1 : 0.55 }} transition={slow}>
        <Idle kind="breathe" active={body} duration={1.4} pivot={[100, 124]}>
          <Ellipse cx="84" cy="124" rx="12" ry="20" fill="#f5c9d6" stroke={C.eosin} strokeWidth="1" />
          <Ellipse cx="116" cy="124" rx="12" ry="20" fill="#f5c9d6" stroke={C.eosin} strokeWidth="1" />
        </Idle>
      </motion.g>
      {/* Cuore */}
      <G transform="translate(104 124) scale(1.4)">
        {/* Batte intorno al centro del suo riquadro */}
        <Idle kind="beat" active={body} duration={0.55} pivot={[0, -3.1]}>
          <Path d={HEART} fill={body ? C.highlight : C.rbc} />
        </Idle>
      </G>
      {/* Stomaco "a nodo" */}
      <motion.path d="M88 156 C 92 148 108 148 112 156 C 116 166 100 172 94 166" fill="none" initial={false} animate={{ stroke: body ? C.highlight : "#d9b8c6", strokeWidth: body ? 3 : 2 }} transition={t} strokeLinecap="round" />
      {/* Muscoli tesi */}
      <motion.g initial={false} animate={{ opacity: body ? 1 : 0 }} transition={t}>
        <Path d="M58 112 l4 -5 l4 5 l4 -5 M130 112 l4 -5 l4 5 l4 -5" fill="none" stroke={C.highlight} strokeWidth="1.6" strokeLinejoin="round" />
      </motion.g>
      {/* Respiro lento */}
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <Idle kind="breathe" pivot={[54, 70]}>
          <Path d="M30 70 q 8 -8 16 0 t 16 0 t 16 0" fill="none" stroke={C.calm} strokeWidth="2.4" strokeLinecap="round" />
        </Idle>
      </motion.g>
      <SceneLabel x={146} y={44}>amigdala</SceneLabel>
    </G>
  );
}

/* --------------------------------------------------------------- CIRCOLO UMORE */

const NODES = [
  { label: "umore", a: -90 },
  { label: "energia", a: -18 },
  { label: "sonno", a: 54 },
  { label: "attività", a: 126 },
  { label: "pensieri", a: 198 },
] as const;

/** Centro del riquadro delle frecce del circolo (misurato nella web app) */
const RING_CENTER = [-2.28, 2.2] as const;

function NodeIcon({ i, color }: { i: number; color: string }) {
  switch (i) {
    case 0:
      return <Path d="M-5 2 Q 0 6 5 2 M-4 -3 h0.1 M4 -3 h0.1" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />;
    case 1:
      return (
        <G fill="none" stroke={color} strokeWidth="1.6">
          <Rect x="-6" y="-4" width="11" height="8" rx="1.5" />
          <Path d="M5 -1.5 h2 v3 h-2" />
          <Rect x="-4.5" y="-2.5" width="5" height="5" fill={color} stroke="none" />
        </G>
      );
    case 2:
      return <Path d="M3 -5.2 A6 6 0 1 0 3 5.2 A5.3 5.3 0 0 1 3 -5.2 Z" fill={color} />;
    case 3:
      return (
        <G fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
          <Circle cx="1" cy="-6" r="1.8" fill={color} stroke="none" />
          <Path d="M1 -4 L -1 2 L 3 6 M-1 2 L -4 6 M0 -2 L 4 0 M0 -2 L -4 -1" />
        </G>
      );
    default:
      return <Path d="M-6 2 C -8 -4 -2 -7 1 -5 C 4 -8 9 -4 7 0 C 9 4 4 6 1 4 C -2 6 -7 5 -6 2 Z" fill="none" stroke={color} strokeWidth="1.6" />;
  }
}

export function CircoloUmore() {
  const { step, t } = useScene();
  const cx = 100;
  const cy = 94;
  const R = 52;
  const dim = step === 1 || step === 2;
  return (
    <G>
      <Rect x="0" y="0" width="200" height="200" fill="#f6f1fa" />
      {/* Frecce del circolo: in senso orario verso il basso, poi in senso inverso con la cura */}
      <G transform={`translate(${cx} ${cy})`}>
        {/* Il circolo si capovolge e gira intorno al centro del riquadro delle frecce */}
        <motion.g initial={false} animate={{ scaleX: step === 3 ? -1 : 1 }} pivot={RING_CENTER} transition={t}>
          <Idle kind="spin" active={step >= 2} pivot={RING_CENTER}>
            {NODES.map((n, i) => {
              const a1 = ((n.a + 16) * Math.PI) / 180;
              const a2 = ((n.a + 72 - 16) * Math.PI) / 180;
              const x1 = Math.cos(a1) * R;
              const y1 = Math.sin(a1) * R;
              const x2 = Math.cos(a2) * R;
              const y2 = Math.sin(a2) * R;
              const tip = a2 + 0.02;
              const hx = Math.cos(tip) * R;
              const hy = Math.sin(tip) * R;
              const back = a2 - 0.16;
              return (
                <G key={i}>
                  <Path d={`M${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`} fill="none" stroke={dim ? "#b9b2c6" : C.calm} strokeWidth="2.4" />
                  <Path
                    d={`M${hx.toFixed(1)} ${hy.toFixed(1)} L ${(Math.cos(back) * (R - 5)).toFixed(1)} ${(Math.sin(back) * (R - 5)).toFixed(1)} L ${(Math.cos(back) * (R + 5)).toFixed(1)} ${(Math.sin(back) * (R + 5)).toFixed(1)} Z`}
                    fill={dim ? "#b9b2c6" : C.nucleus}
                  />
                </G>
              );
            })}
          </Idle>
        </motion.g>
      </G>

      {/* Nodi */}
      {NODES.map((n, i) => {
        const a = (n.a * Math.PI) / 180;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R;
        return (
          <G key={n.label} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
            <motion.circle
              r="15"
              initial={false}
              animate={{ fill: dim ? "#e4e0ea" : "#ffffff", stroke: dim ? "#a7a0b6" : C.nucleus }}
              transition={{ ...t, delay: step === 3 ? i * 0.3 : 0 }}
              strokeWidth="2"
            />
            <NodeIcon i={i} color={dim ? "#8e879d" : C.eosinDark} />
            <SvgLabel x={0} y={25} anchor="middle" size={7} bold halo fill={C.label}>
              {n.label}
            </SvgLabel>
          </G>
        );
      })}

      {/* Stress: una nuvola che spegne i colori */}
      <motion.g initial={false} animate={{ opacity: step === 1 ? 1 : 0 }} transition={t}>
        <Path d="M84 98 C 78 88 90 80 98 84 C 104 76 118 82 116 92 C 124 96 120 106 110 104 L 88 104 C 80 104 78 100 84 98 Z" fill="#a7a0b6" />
      </motion.g>
      {/* Con la cura torna la luce */}
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <TriggerIcon kind="sole" transform={`translate(${cx} ${cy})`} />
      </motion.g>
    </G>
  );
}
