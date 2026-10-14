import { useEffect, type ReactNode } from "react";
import { Platform } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedProps, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { G, Path, type PathProps } from "react-native-svg";
import { motionFrame, stillFrame, transformMatrix, useMotionState, type MotionProps } from "./motion";
import { useScene } from "./scene-context";

/**
 * I movimenti continui leggeri delle scene (nella web app sono le classi CSS idle-*): partono solo
 * mentre la scena è in riproduzione, in pausa restano fermi dove sono arrivati, con «riduci
 * movimento» non esistono. Stessi tempi e fotogrammi chiave della web app.
 */
export type IdleKind = "float" | "drift" | "spin" | "pulse" | "beat" | "wiggle" | "sway" | "blink" | "breathe" | "grind" | "stream" | "rise";

interface Frame {
  at: number;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
}

const f = (at: number, v: Partial<Omit<Frame, "at">>): Frame => ({ at, x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, ...v });

const SPEC: Record<IdleKind, { duration: number; linear?: boolean; frames: Frame[] }> = {
  float: { duration: 5000, frames: [f(0, {}), f(0.5, { y: -3 }), f(1, {})] },
  drift: { duration: 8000, frames: [f(0, {}), f(0.33, { x: 3, y: -2, rotate: 8 }), f(0.66, { x: -2, y: 2, rotate: -6 }), f(1, {})] },
  spin: { duration: 28000, linear: true, frames: [f(0, {}), f(1, { rotate: 360 })] },
  pulse: { duration: 2400, frames: [f(0, {}), f(0.5, { scale: 1.08 }), f(1, {})] },
  beat: { duration: 900, frames: [f(0, {}), f(0.2, { scale: 1.14 }), f(0.4, {}), f(1, {})] },
  wiggle: { duration: 1400, frames: [f(0, { rotate: -4 }), f(0.5, { rotate: 4 }), f(1, { rotate: -4 })] },
  sway: { duration: 1800, frames: [f(0, { rotate: -9 }), f(0.5, { rotate: 9 }), f(1, { rotate: -9 })] },
  blink: { duration: 2200, frames: [f(0, { opacity: 0.35 }), f(0.5, {}), f(1, { opacity: 0.35 })] },
  breathe: { duration: 4000, frames: [f(0, {}), f(0.5, { scale: 1.05 }), f(1, {})] },
  grind: { duration: 500, frames: [f(0, { x: -1 }), f(0.5, { x: 1.5 }), f(1, { x: -1 })] },
  stream: { duration: 2200, linear: true, frames: [f(0, {}), f(1, { x: 26 })] },
  rise: { duration: 6000, linear: true, frames: [f(0, { opacity: 0 }), f(0.15, { y: -5.1 }), f(0.85, { y: -28.9 }), f(1, { y: -34, opacity: 0 })] },
};

const IS_WEB = Platform.OS === "web";
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/** La fase (0-1) di un movimento continuo: gira solo in riproduzione e senza «riduci movimento» */
function usePhase(duration: number, startAt = 0, active = true) {
  const scene = useScene();
  const playing = scene.playing && active;
  const reduced = scene.reduced || !active;
  // Un ritardo negativo nella web app (animation-delay) sfasa il movimento: qui è la fase di partenza
  const phase = useSharedValue(startAt);
  useEffect(() => {
    cancelAnimation(phase);
    if (reduced) {
      phase.value = startAt;
      return;
    }
    if (!playing) return;
    const start = phase.value % 1;
    phase.value = start;
    phase.value = withRepeat(withTiming(start + 1, { duration, easing: Easing.linear }), -1, false);
  }, [playing, reduced, duration, phase, startAt]);
  return { phase, reduced };
}

/** Un gruppo che si muove con uno dei movimenti continui; scala e rotazione girano intorno a `pivot` */
export function Idle({
  kind,
  pivot = [0, 0],
  delay = 0,
  duration,
  active = true,
  children,
}: {
  kind: IdleKind;
  /** Centro di scala e rotazione: nella web app è il centro del riquadro (transform-box: fill-box) */
  pivot?: readonly [number, number];
  /** Secondi, come animation-delay: un valore negativo fa partire il movimento già avanti */
  delay?: number;
  /** Secondi, per cambiare la durata standard del movimento (animation-duration) */
  duration?: number;
  /** Con `false` il gruppo resta fermo, come un elemento senza la classe idle-* */
  active?: boolean;
  children: ReactNode;
}) {
  const spec = SPEC[kind];
  const ms = duration !== undefined ? duration * 1000 : spec.duration;
  const startAt = delay < 0 ? ((-delay * 1000) / ms) % 1 : 0;
  const { phase, reduced } = usePhase(ms, startAt, active);
  const [ox, oy] = pivot;
  const frames = spec.frames;
  const linear = spec.linear ?? false;
  const animatedProps = useAnimatedProps((): { transform?: string; matrix?: number[]; opacity: number } => {
    if (reduced) return IS_WEB ? { transform: "matrix(1 0 0 1 0 0)", opacity: 1 } : { matrix: [1, 0, 0, 1, 0, 0], opacity: 1 };
    const t = phase.value % 1;
    let i = 0;
    while (i < frames.length - 2 && t > frames[i + 1]!.at) i++;
    const a = frames[i]!;
    const b = frames[i + 1]!;
    let u = (t - a.at) / (b.at - a.at || 1);
    // ease-in-out come nella web app, tranne i movimenti lineari
    if (!linear) u = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    const mix = (va: number, vb: number) => va + (vb - va) * u;
    const s = mix(a.scale, b.scale);
    const m = transformMatrix(mix(a.x, b.x), mix(a.y, b.y), s, s, mix(a.rotate, b.rotate), ox, oy);
    const opacity = mix(a.opacity, b.opacity);
    return IS_WEB ? { transform: `matrix(${m.join(" ")})`, opacity } : { matrix: m, opacity };
  });
  return <AnimatedG animatedProps={animatedProps}>{children}</AnimatedG>;
}

/** Un tratto tratteggiato che scorre (idle-flow e idle-flow-slow): il flusso del sangue, dell'aria, dei segnali */
export function FlowPath({ slow = false, delay = 0, ...props }: PathProps & { slow?: boolean; /** Secondi, come animation-delay */ delay?: number }) {
  const duration = slow ? 3000 : 1400;
  const { phase, reduced } = usePhase(duration, delay < 0 ? ((-delay * 1000) / duration) % 1 : 0);
  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: reduced ? 0 : -20 * (phase.value % 1) }));
  return <AnimatedPath {...props} strokeDasharray={slow ? [2, 10] : [3, 7]} animatedProps={animatedProps} />;
}

/** Un tratto che scorre e intanto cambia colore o spessore tra un passo e l'altro (motion.path con idle-flow) */
export function MotionFlowPath({
  slow = false,
  animate,
  initial: _initial,
  transition,
  ...props
}: Omit<PathProps, "strokeDasharray" | "strokeDashoffset"> & Omit<MotionProps, "pivot" | "length"> & { slow?: boolean }) {
  const { still } = useScene();
  if (still) return <FlowPath {...props} {...(stillFrame(animate, undefined, 100) as PathProps)} slow={slow} />;
  return <AnimatedFlowPath slow={slow} animate={animate} transition={transition} {...props} />;
}

function AnimatedFlowPath({ slow, animate, transition, ...props }: Omit<PathProps, "strokeDasharray" | "strokeDashoffset"> & Omit<MotionProps, "pivot" | "length" | "initial"> & { slow: boolean }) {
  const state = useMotionState(animate, transition);
  const { phase, reduced } = usePhase(slow ? 3000 : 1400);
  const animatedProps = useAnimatedProps(() => ({ ...motionFrame(state, 0, 0, 100), strokeDashoffset: reduced ? 0 : -20 * (phase.value % 1) }));
  return <AnimatedPath {...props} strokeDasharray={slow ? [2, 10] : [3, 7]} animatedProps={animatedProps} />;
}
