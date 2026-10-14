import { motion } from "../motion";
import type { SceneParams } from "@/lib/slides/catalog";
import { C } from "@/components/slide/palette";
import { Idle, MotionFlowPath } from "../idle";
import { SvgLabel } from "../label";
import { Antibody, RedCell, SceneLabel, rng } from "../primitives";
import { useScene } from "../scene-context";
import { Circle, Ellipse, G, Line, Path, Polygon, Rect } from "react-native-svg";

const HEART = "M0 4 C -8 -2 -9 -9 -4 -10 C -1 -11 0 -8 0 -7 C 0 -8 1 -11 4 -10 C 9 -9 8 -2 0 4 Z";
/** Centro del riquadro del cuore, intorno a cui batte (misurato nella web app) */
const HEART_CENTER = [0, -3.1] as const;

/* --------------------------------------------------------------- GLOBULI ROSSI */

function Oxygen({ x, y }: { x: number; y: number }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Circle cx="-2" r="2.4" fill={C.oxygen} />
      <Circle cx="2" r="2.4" fill={C.oxygen} />
    </G>
  );
}

function CarbonMonoxide({ x, y }: { x: number; y: number }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Circle cx="-2.2" r="2.8" fill={C.carbon} />
      <Circle cx="2.2" r="2.4" fill={C.oxygen} />
    </G>
  );
}

const CELLS = (() => {
  const rand = rng(41);
  const cells: { x: number; y: number }[] = [];
  for (let gy = 0; gy < 4; gy++) {
    for (let gx = 0; gx < 4; gx++) {
      const x = 40 + gx * 40 + (rand() - 0.5) * 14 + (gy % 2) * 10;
      const y = 40 + gy * 34 + (rand() - 0.5) * 10;
      const inField = (x - 100) ** 2 + (y - 96) ** 2 < 78 ** 2;
      const underHeart = (x - 152) ** 2 + (y - 58) ** 2 < 30 ** 2;
      if (inField && !underHeart) cells.push({ x, y });
    }
  }
  return cells;
})();

export function GlobuliRossi({ params }: { params: SceneParams<"globuli-rossi"> }) {
  const { step, t, slow } = useScene();
  const co = params.variante === "monossido";
  const lowO2 = step === 2 || (!co && step === 1);

  return (
    <G>
      <Rect x="0" y="0" width="200" height="200" fill={C.plasma} />
      {/* Cellula di un tessuto che riceve l'ossigeno */}
      <motion.g initial={false} animate={{ opacity: lowO2 ? 0.45 : 1 }} transition={slow}>
        <Ellipse cx="100" cy="196" rx="84" ry="30" fill="#f6cbd8" stroke={C.eosin} strokeWidth="1.2" />
        <Ellipse cx="100" cy="186" rx="16" ry="8" fill={C.nucleus} opacity="0.8" />
      </motion.g>
      <SceneLabel x={100} y={162}>tessuto</SceneLabel>

      {CELLS.map((c, i) => {
        const fewer = !co && (step === 1 || step === 2) && i % 3 === 0;
        const pale = !co && (step === 1 || step === 2);
        return (
          <motion.g
            key={i}
            initial={false}
            animate={{ x: c.x, y: c.y, scale: pale ? 0.72 : 1, opacity: fewer ? 0 : 1 }}
            transition={{ ...slow, delay: i * 0.03 }}
          >
            <Idle kind="drift" delay={-i * 0.6}>
              <RedCell r={14} pale={pale} />
              {/* Ossigeno legato all'emoglobina */}
              <motion.g initial={false} animate={{ opacity: co ? (step === 2 ? 0 : 1) : pale ? 0.35 : 1 }} transition={t}>
                <Oxygen x={6} y={-6} />
              </motion.g>
              {co && (
                <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={{ ...t, delay: step === 2 ? i * 0.05 : 0 }}>
                  <CarbonMonoxide x={-5} y={5} />
                </motion.g>
              )}
            </Idle>
          </motion.g>
        );
      })}

      {/* Monossido che arriva con il respiro / ossigeno dei soccorsi */}
      {co &&
        [
          [30, 60],
          [26, 100],
          [40, 136],
          [52, 30],
          [20, 80],
        ].map(([x, y], i) => (
          <motion.g
            key={`co${i}`}
            initial={false}
            animate={{ x: step === 1 ? x + 14 : step === 3 ? x - 30 : x - 40, y, opacity: step === 1 ? 1 : 0 }}
            transition={{ ...t, delay: step === 1 ? i * 0.15 : 0 }}
          >
            <Idle kind="drift" pivot={[-0.2, 0]}>
              <CarbonMonoxide x={0} y={0} />
            </Idle>
          </motion.g>
        ))}
      {co &&
        [
          [150, 40],
          [168, 80],
          [160, 124],
          [140, 150],
        ].map(([x, y], i) => (
          <motion.g key={`ox${i}`} initial={false} animate={{ opacity: step === 3 ? 1 : 0, x: step === 3 ? x : x + 30, y }} transition={{ ...t, delay: step === 3 ? i * 0.15 : 0 }}>
            <Oxygen x={0} y={0} />
          </motion.g>
        ))}

      {/* Cuore che accelera quando manca ossigeno */}
      <G transform="translate(152 50) scale(1.2)">
        <Idle kind="beat" active={lowO2} duration={0.6} pivot={HEART_CENTER}>
          <Path d={HEART} fill={C.rbc} />
        </Idle>
      </G>
      <motion.g initial={false} animate={{ opacity: lowO2 ? 1 : 0 }} transition={t}>
        <SvgLabel x={152} y={68} anchor="middle" size={6.5} bold halo fill={C.label}>
          più veloce
        </SvgLabel>
      </motion.g>
    </G>
  );
}

/* --------------------------------------------------------------------- TIROIDE */

const ORGANS = [
  { x: 44, y: 70, kind: "cuore" },
  { x: 36, y: 104, kind: "energia" },
  { x: 46, y: 138, kind: "muscolo" },
] as const;

export function Tiroide() {
  const { step, t, slow } = useScene();
  const low = step === 1 || step === 2;
  const hormoneOpacity = step === 2 ? 0.15 : step === 1 ? 0.5 : 1;
  const organDim = step === 2;
  return (
    <G>
      <Rect x="0" y="0" width="200" height="200" fill="#f6f0f8" />
      {/* Collo e spalle */}
      <Path d="M66 -10 L 70 140 C 50 150 30 160 20 200 L 180 200 C 170 160 150 150 130 140 L 134 -10 Z" fill={C.body} stroke={C.bodyLine} strokeWidth="1.4" />
      {/* Trachea */}
      <Rect x="90" y="30" width="20" height="170" rx="8" fill="#e8f1f8" stroke={C.inkSoft} strokeWidth="1" />
      {[44, 56, 68, 80, 92, 104, 116, 128, 140, 152].map((y) => (
        <Line key={y} x1="91" x2="109" y1={y} y2={y} stroke={C.inkSoft} strokeWidth="1" opacity="0.5" />
      ))}

      {/* Ipofisi e segnale TSH */}
      <Circle cx="152" cy="34" r="8" fill="#f1e8f7" stroke={C.bodyLine} strokeWidth="1.2" />
      <SvgLabel x={152} y={52} anchor="middle" size={6.5} bold halo fill={C.label}>
        ipofisi
      </SvgLabel>
      <MotionFlowPath
        d="M150 42 C 148 70 140 92 124 108"
        fill="none"
        initial={false}
        animate={{ stroke: step === 2 ? C.eosinDark : C.nucleus, strokeWidth: step === 2 ? 3.2 : 1.8 }}
        transition={t}
      />

      {/* Tiroide a farfalla */}
      <motion.g initial={false} animate={{ scale: low ? 0.86 : 1, opacity: low ? 0.75 : 1 }} pivot={[100, 124]} transition={slow}>
        <Ellipse cx="82" cy="124" rx="14" ry="24" transform="rotate(-12 82 124)" fill={C.tissueInflamed} stroke={C.membrane} strokeWidth="1.4" />
        <Ellipse cx="118" cy="124" rx="14" ry="24" transform="rotate(12 118 124)" fill={C.tissueInflamed} stroke={C.membrane} strokeWidth="1.4" />
        <Rect x="88" y="126" width="24" height="12" rx="5" fill={C.tissueInflamed} stroke={C.membrane} strokeWidth="1.2" />
      </motion.g>
      <SceneLabel x={100} y={159}>tiroide</SceneLabel>

      {/* Anticorpi che attaccano la tiroide (tiroidite di Hashimoto) */}
      {[
        [64, 104, 40],
        [66, 144, 140],
        [136, 104, -40],
        [134, 144, -140],
      ].map(([x, y, rot], i) => (
        <motion.g key={i} initial={false} animate={{ opacity: step === 1 || step === 2 ? 1 : 0 }} transition={{ ...t, delay: step === 1 ? i * 0.15 : 0 }}>
          <Antibody s={1.3} transform={`translate(${x} ${y}) rotate(${rot})`} />
        </motion.g>
      ))}

      {/* Ormoni verso gli organi */}
      {ORGANS.map((o, i) => (
        <G key={o.kind}>
          <MotionFlowPath
            d={`M74 ${118 + i * 6} C 62 ${110 + i * 4} 58 ${o.y + 6} ${o.x + 10} ${o.y}`}
            fill="none"
            stroke={C.nucleus}
            strokeWidth="2"
            initial={false}
            animate={{ opacity: hormoneOpacity }}
            transition={slow}
          />
          <motion.g initial={false} animate={{ opacity: organDim ? 0.35 : 1 }} transition={slow}>
            <Circle cx={o.x} cy={o.y} r="9" fill="#ffffff" stroke={C.inkSoft} strokeWidth="0.8" />
            {o.kind === "cuore" && <Path d={HEART} transform={`translate(${o.x} ${o.y + 2}) scale(0.7)`} fill={C.rbc} />}
            {o.kind === "energia" && <Path d={`M${o.x + 1.5} ${o.y - 6} L ${o.x - 3} ${o.y + 0.5} H ${o.x + 0.5} L ${o.x - 1.5} ${o.y + 6} L ${o.x + 3.5} ${o.y - 1} H ${o.x} Z`} fill={C.pollen} stroke={C.pollenDark} strokeWidth="0.6" />}
            {o.kind === "muscolo" && <Ellipse cx={o.x} cy={o.y} rx="6" ry="3.4" fill={C.muscle} />}
          </motion.g>
        </G>
      ))}

      {/* Terapia sostitutiva */}
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <G transform="translate(150 150) rotate(-30)">
          <Rect x="-9" y="-4" width="18" height="8" rx="4" fill="#ffffff" stroke={C.nucleus} strokeWidth="1.2" />
          <Rect x="0" y="-4" width="9" height="8" rx="4" fill={C.calm} />
        </G>
      </motion.g>
    </G>
  );
}

/* --------------------------------------------------------------- VASO PRESSIONE */

export function VasoPressione() {
  const { step, t, slow } = useScene();
  const stiff = step === 1 || step === 2;
  const wall = stiff ? 9 : 0;
  const arrow = stiff ? 1.7 : 1;
  return (
    <G>
      <Rect x="0" y="0" width="200" height="200" fill="#f8eef3" />
      {/* Pareti dell'arteria */}
      <motion.rect x="-10" width="220" initial={false} animate={{ y: 54, height: 18 + wall, fill: stiff ? "#d98c99" : C.arteryWall }} transition={slow} />
      <motion.rect x="-10" width="220" initial={false} animate={{ y: 120 - wall, height: 18 + wall, fill: stiff ? "#d98c99" : C.arteryWall }} transition={slow} />
      <motion.rect x="-10" width="220" fill="#f6b8c0" initial={false} animate={{ y: 72 + wall, height: 48 - wall * 2 }} transition={slow} />

      {/* Sangue che scorre */}
      <Idle kind="stream">
        {[-16, 10, 36, 62, 88, 114, 140, 166, 192].map((x, i) => (
          <RedCell key={x} r={6.5} transform={`translate(${x} ${96 + (i % 2 ? -7 : 7)})`} />
        ))}
      </Idle>

      {/* Pressione sulle pareti */}
      {[40, 80, 120, 160].map((x) => (
        <G key={x}>
          <motion.g initial={false} animate={{ y: 72 + wall, scale: arrow }} pivot={[x, 1.5]} transition={slow}>
            <Path d={`M${x} 6 V -2 M${x - 3} 1 L ${x} -3 L ${x + 3} 1`} fill="none" stroke={C.eosinDark} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
          <motion.g initial={false} animate={{ y: 120 - wall, scale: arrow }} pivot={[x, -1.5]} transition={slow}>
            <Path d={`M${x} -6 V 2 M${x - 3} -1 L ${x} 3 L ${x + 3} -1`} fill="none" stroke={C.eosinDark} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
        </G>
      ))}
      <SceneLabel x={100} y={46}>arteria</SceneLabel>

      {/* Fattori di rischio */}
      <motion.g initial={false} animate={{ opacity: step === 1 ? 1 : 0 }} transition={t}>
        <G transform="translate(52 40)">
          <Circle r="9" fill="#ffffff" stroke={C.inkSoft} strokeWidth="0.8" />
          <Path d="M-3 -4 h6 l1 10 h-8 Z" fill="#ffffff" stroke={C.inkSoft} strokeWidth="1" />
          <Circle cx="-1" cy="-6" r="0.8" fill={C.inkSoft} />
          <Circle cx="1.6" cy="-6.4" r="0.8" fill={C.inkSoft} />
        </G>
      </motion.g>

      {/* Organi a rischio */}
      <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : 0 }} transition={t}>
        {[
          [56, 154, "cuore"],
          [86, 156, "cervello"],
          [116, 156, "reni"],
          [146, 154, "occhi"],
        ].map(([x, y, k], i) => (
          <G key={k as string} transform={`translate(${x} ${y})`}>
            <Idle kind="pulse" delay={-i * 0.3}>
              <Circle r="10" fill="#ffffff" stroke={C.highlight} strokeWidth="1.8" />
            </Idle>
            {k === "cuore" && <Path d={HEART} transform="translate(0 2) scale(0.75)" fill={C.rbc} />}
            {k === "cervello" && <Path d="M-6 1 C -7 -5 -1 -7 1 -5 C 4 -7 8 -3 6 1 C 7 5 1 6 0 4 C -3 6 -7 4 -6 1 Z" fill="#e6dcf2" stroke={C.bodyLine} strokeWidth="0.8" />}
            {k === "reni" && <Path d="M-2 -6 C -8 -6 -8 6 -2 6 C 0 6 1 3 -1 2 C -2 1 -2 -1 -1 -2 C 1 -3 0 -6 -2 -6 Z M2 -6 C 8 -6 8 6 2 6 C 0 6 -1 3 1 2 C 2 1 2 -1 1 -2 C -1 -3 0 -6 2 -6 Z" fill={C.muscle} />}
            {k === "occhi" && (
              <G>
                <Path d="M-7 0 Q 0 -6 7 0 Q 0 6 -7 0 Z" fill="#ffffff" stroke={C.bodyLine} strokeWidth="0.9" />
                <Circle r="2.2" fill={C.nucleus} />
              </G>
            )}
          </G>
        ))}
      </motion.g>
      {/* Pressione tornata nei valori giusti */}
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <G transform="translate(100 154)">
          <Circle r="11" fill="#ffffff" stroke={C.nucleus} strokeWidth="1.6" />
          <Path d="M-6 3 A 7 7 0 0 1 6 3" fill="none" stroke={C.calm} strokeWidth="2" />
          <Path d="M0 3 L -3 -3" stroke={C.nucleus} strokeWidth="1.6" strokeLinecap="round" />
        </G>
      </motion.g>
    </G>
  );
}

/* --------------------------------------------------------------------- GLICEMIA */

function Glucose({ x, y }: { x: number; y: number }) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3 + Math.PI / 6;
    return `${(x + Math.cos(a) * 4).toFixed(1)},${(y + Math.sin(a) * 4).toFixed(1)}`;
  }).join(" ");
  return <Polygon points={pts} fill={C.glucose} stroke="#b97a1e" strokeWidth="0.7" />;
}

function Key({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${rot})`}>
      <Circle r="3.2" fill="none" stroke={C.insulin} strokeWidth="1.8" />
      <Path d="M3 0 H 11 M8 0 V 3 M10.5 0 V 2.5" stroke={C.insulin} strokeWidth="1.8" strokeLinecap="round" />
    </G>
  );
}

/** Centro del riquadro del pancreas (misurato nella web app) */
const PANCREAS_CENTER = [-0.86, -0.27] as const;

const DOORS = [
  { x: 52, cell: 0 },
  { x: 78, cell: 0 },
  { x: 122, cell: 1 },
  { x: 148, cell: 1 },
];

export function Glicemia() {
  const { step, t, slow } = useScene();
  const openDoors = step === 1 ? [0, 1, 2, 3] : step === 2 ? [1] : step === 3 ? [0, 1, 2] : [];
  const vesselGlucose = [
    [36, 58], [58, 48], [70, 66], [92, 52], [110, 62], [128, 50], [146, 64], [164, 54],
    [48, 70], [84, 44], [120, 70], [156, 44],
  ];
  const shown = step === 0 ? 8 : step === 1 ? 3 : step === 2 ? 12 : 5;
  const inCell = [
    [44, 138], [64, 150], [86, 136], [116, 146], [136, 136], [156, 150],
  ];
  const cellCount = step === 1 ? 6 : step === 2 ? 1 : step === 3 ? 5 : 0;

  return (
    <G>
      <Rect x="0" y="0" width="200" height="200" fill="#f6f0f8" />
      {/* Vaso sanguigno */}
      <Rect x="-10" y="36" width="220" height="44" fill="#f8c9cf" stroke={C.arteryWall} strokeWidth="2" />
      <SceneLabel x={100} y={30}>sangue</SceneLabel>
      {/* Pancreas */}
      <G transform="translate(32 92)">
        <Idle kind="pulse" active={step === 2} pivot={PANCREAS_CENTER}>
          <motion.path
            d="M-14 0 C -14 -8 0 -10 8 -6 C 14 -3 14 6 6 7 C -2 8 -14 8 -14 0 Z"
            fill="#f2c6a7"
            stroke="#c48c63"
            strokeWidth="1"
            initial={false}
            animate={{ scale: step === 2 ? 1.12 : 1 }}
            pivot={PANCREAS_CENTER}
            transition={t}
          />
        </Idle>
      </G>

      {/* Cellule con le porte */}
      {[0, 1].map((c) => (
        <G key={c}>
          <motion.rect
            x={c === 0 ? 30 : 106}
            y="112"
            width="64"
            height="58"
            rx="14"
            initial={false}
            animate={{ fill: step === 1 || step === 3 ? "#fbe3ea" : C.cytoplasm }}
            transition={slow}
            stroke={C.membrane}
            strokeWidth="2"
          />
          <Ellipse cx={c === 0 ? 62 : 138} cy="152" rx="10" ry="7" fill={C.nucleus} opacity="0.8" />
        </G>
      ))}
      <SceneLabel x={100} y={104}>cellule</SceneLabel>
      <SceneLabel x={32} y={108}>pancreas</SceneLabel>
      {DOORS.map((d, i) => {
        const open = openDoors.includes(i);
        return (
          <G key={i}>
            <motion.rect y="108" width="5" height="8" rx="1.5" fill={C.membrane} initial={false} animate={{ x: open ? d.x - 9 : d.x - 5 }} transition={t} />
            <motion.rect y="108" width="5" height="8" rx="1.5" fill={C.membrane} initial={false} animate={{ x: open ? d.x + 4 : d.x }} transition={t} />
            {/* Chiave di insulina */}
            <motion.g initial={false} animate={{ x: step === 0 ? 34 : d.x - 4, y: step === 0 ? 72 : 96, opacity: step === 0 && i > 1 ? 0 : 1 }} transition={{ ...t, delay: step >= 1 ? i * 0.15 : 0 }}>
              <Key x={0} y={0} rot={90} />
            </motion.g>
          </G>
        );
      })}

      {/* Glucosio nel sangue */}
      {vesselGlucose.map(([x, y], i) => (
        <motion.g key={i} initial={false} animate={{ opacity: i < shown ? 1 : 0 }} transition={{ ...t, delay: i * 0.05 }}>
          <Idle kind="drift" pivot={[x!, y!]} delay={-i * 0.7}>
            <Glucose x={x!} y={y!} />
          </Idle>
        </motion.g>
      ))}
      {/* Glucosio entrato nelle cellule */}
      {inCell.map(([x, y], i) => (
        <motion.g key={`c${i}`} initial={false} animate={{ opacity: i < cellCount ? 1 : 0, y: i < cellCount ? 0 : -40 }} transition={{ ...t, delay: i * 0.1 }}>
          <Glucose x={x} y={y} />
        </motion.g>
      ))}

      {/* Movimento */}
      <motion.g initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t}>
        <G transform="translate(176 104)">
          <Circle r="10" fill="#ffffff" stroke={C.nucleus} strokeWidth="1.2" />
          <Circle cx="1" cy="-5" r="1.8" fill={C.nucleus} />
          <Path d="M1 -3 L -1 2 L 3 6 M-1 2 L -4 6 M0 -1 L 4 1 M0 -1 L -4 -2" fill="none" stroke={C.nucleus} strokeWidth="1.5" strokeLinecap="round" />
        </G>
      </motion.g>
    </G>
  );
}
