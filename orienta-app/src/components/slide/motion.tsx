import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Platform } from "react-native";
import Animated, { Easing, interpolateColor, useAnimatedProps, useSharedValue, withDelay, withTiming, type SharedValue } from "react-native-reanimated";
import { Circle, Ellipse, G, Path, Rect, type CircleProps, type EllipseProps, type GProps, type PathProps, type RectProps } from "react-native-svg";
import { STANDARD_EASE, useScene, type Transition } from "./scene-context";

export { STANDARD_EASE, type Transition };

/**
 * Un piccolo equivalente di `motion` (la libreria della web app) per react-native-svg con Reanimated:
 * stessi `animate`, `initial={false}` e `transition`, così le scene restano uguali a quelle della web app.
 * Le trasformazioni si animano come matrice: su iOS e Android con la proprietà `matrix`, sul web con
 * `transform`. Scala e rotazione girano intorno a `pivot` (per i gruppi disegnati intorno a 0,0 è il centro).
 */

export interface Target {
  x?: number;
  y?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: number;
  opacity?: number;
  strokeWidth?: number;
  r?: number;
  cx?: number;
  cy?: number;
  width?: number;
  height?: number;
  /** Frazione del tratto disegnata (0-1); serve la lunghezza totale del tratto in `length` */
  pathLength?: number;
  /** Da che frazione del tratto parte la parte disegnata (0-1), come in motion */
  pathOffset?: number;
  fill?: string;
  stroke?: string;
}

type Values = Record<string, number | string>;

const IS_WEB = Platform.OS === "web";
const TRANSFORM_KEYS = ["x", "y", "scale", "scaleX", "scaleY", "rotate"] as const;
const COLOR_KEYS = ["fill", "stroke"] as const;
const NUMBER_KEYS = ["opacity", "strokeWidth", "r", "cx", "cy", "width", "height"] as const;
const PATH_KEYS = ["pathLength", "pathOffset"] as const;
const DEFAULTS: Values = { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, rotate: 0, pathLength: 1, pathOffset: 0 };

function toValues(target: Target, keys: readonly string[]): Values {
  const out: Values = {};
  for (const k of keys) {
    const v = target[k as keyof Target];
    out[k] = v ?? DEFAULTS[k] ?? 0;
  }
  return out;
}

/** Matrice SVG [a b c d e f] per traslazione, scala e rotazione intorno a (ox, oy) */
export function transformMatrix(x: number, y: number, sx: number, sy: number, deg: number, ox: number, oy: number): number[] {
  "worklet";
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const a = sx * cos;
  const b = sy * sin;
  const c = -sx * sin;
  const d = sy * cos;
  const e = x + ox - (a * ox + c * oy);
  const f = y + oy - (b * ox + d * oy);
  return [a, b, c, d, e, f];
}

export interface MotionProps {
  animate: Target;
  /** Come in motion: `false` parte già dai valori di `animate`, senza animazione iniziale */
  initial?: false;
  transition?: Transition;
  /** Centro di scala e rotazione (in motion è il centro del riquadro dell'elemento) */
  pivot?: readonly [number, number];
  /** Lunghezza del tratto, per animare `pathLength` */
  length?: number;
  children?: ReactNode;
}

export interface MotionState {
  keys: { transform: string[]; colors: string[]; numbers: string[]; path: string[] };
  from: SharedValue<Values>;
  to: SharedValue<Values>;
  progress: SharedValue<number>;
}

/** Valori di partenza e di arrivo di un elemento animato: a ogni nuovo `animate` riparte una transizione */
export function useMotionState(animate: Target, transition?: Transition): MotionState {
  // Le chiavi animate di un elemento non cambiano tra un render e l'altro
  const [keys] = useState(() => {
    const present = Object.keys(animate);
    return {
      transform: TRANSFORM_KEYS.filter((k) => present.includes(k)),
      colors: COLOR_KEYS.filter((k) => present.includes(k)),
      numbers: NUMBER_KEYS.filter((k) => present.includes(k)),
      // Con pathLength o pathOffset si animano entrambi: il tratto è una sola lineetta lungo il percorso
      path: PATH_KEYS.some((k) => present.includes(k)) ? [...PATH_KEYS] : [],
    };
  });
  const all = [...keys.transform, ...keys.colors, ...keys.numbers, ...keys.path];
  const values = toValues(animate, all);
  const signature = JSON.stringify(values);
  const from = useSharedValue<Values>(values);
  const to = useSharedValue<Values>(values);
  const progress = useSharedValue(1);
  const duration = (transition?.duration ?? 0.3) * 1000;
  const delay = (transition?.delay ?? 0) * 1000;
  const easeKey = (transition?.ease ?? STANDARD_EASE).join(",");

  useEffect(() => {
    const next = JSON.parse(signature) as Values;
    // Si riparte da dove l'animazione è arrivata, senza salti
    const p = progress.value;
    const current: Values = {};
    for (const k of Object.keys(next)) {
      const a = from.value[k];
      const b = to.value[k];
      if (typeof a === "number" && typeof b === "number") current[k] = a + (b - a) * p;
      else current[k] = p >= 1 ? (b ?? next[k]!) : (a ?? next[k]!);
    }
    from.value = current;
    to.value = next;
    if (duration <= 0) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    const [x1, y1, x2, y2] = easeKey.split(",").map(Number) as [number, number, number, number];
    progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.bezier(x1, y1, x2, y2) }));
  }, [signature, duration, delay, easeKey, from, to, progress]);

  return { keys, from, to, progress };
}

/** Le proprietà dell'elemento in questo istante della transizione (gira sul thread dell'interfaccia) */
export function motionFrame({ keys, from, to, progress }: MotionState, ox: number, oy: number, length: number): Record<string, unknown> {
  "worklet";
  const p = progress.value;
  const a = from.value;
  const b = to.value;
  const lerp = (k: string) => {
    const va = a[k] as number;
    const vb = b[k] as number;
    return va + (vb - va) * p;
  };
  const out: Record<string, unknown> = {};
  for (const k of keys.numbers) out[k] = lerp(k);
  if (keys.path.length > 0) {
    // Come motion: una lineetta lunga pathLength seguita da un vuoto lungo quanto tutto il tratto
    const drawn = Math.max(0, Math.min(1, lerp("pathLength"))) * length;
    out.strokeDasharray = [drawn, length];
    out.strokeDashoffset = -lerp("pathOffset") * length;
  }
  if (keys.colors.length > 0) {
    const colors: Record<string, string | number> = {};
    for (const k of keys.colors) colors[k] = interpolateColor(p, [0, 1], [a[k] as string, b[k] as string]);
    // Sul web react-native-svg aggiorna i colori solo come stile CSS
    if (IS_WEB) out.style = colors;
    else Object.assign(out, colors);
  }
  if (keys.transform.length > 0) {
    const scale = keys.transform.includes("scale") ? lerp("scale") : 1;
    const m = transformMatrix(
      keys.transform.includes("x") ? lerp("x") : 0,
      keys.transform.includes("y") ? lerp("y") : 0,
      scale * (keys.transform.includes("scaleX") ? lerp("scaleX") : 1),
      scale * (keys.transform.includes("scaleY") ? lerp("scaleY") : 1),
      keys.transform.includes("rotate") ? lerp("rotate") : 0,
      ox,
      oy,
    );
    if (IS_WEB) out.transform = `matrix(${m.join(" ")})`;
    else out.matrix = m;
  }
  return out;
}

/** Le proprietà finali di `animate`, senza transizione: per le scene ferme */
export function stillFrame(animate: Target, pivot: readonly [number, number] | undefined, length: number): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of NUMBER_KEYS) if (animate[k] !== undefined) out[k] = animate[k];
  for (const k of COLOR_KEYS) if (animate[k] !== undefined) out[k] = animate[k];
  if (animate.pathLength !== undefined || animate.pathOffset !== undefined) {
    out.strokeDasharray = [Math.max(0, Math.min(1, animate.pathLength ?? 1)) * length, length];
    out.strokeDashoffset = -(animate.pathOffset ?? 0) * length;
  }
  if (TRANSFORM_KEYS.some((k) => animate[k] !== undefined)) {
    const scale = animate.scale ?? 1;
    const m = transformMatrix(animate.x ?? 0, animate.y ?? 0, scale * (animate.scaleX ?? 1), scale * (animate.scaleY ?? 1), animate.rotate ?? 0, pivot?.[0] ?? 0, pivot?.[1] ?? 0);
    out.transform = `matrix(${m.join(" ")})`;
  }
  return out;
}

function makeMotion<P extends object>(Base: ComponentType<P>) {
  const AnimatedBase = Animated.createAnimatedComponent(Base as ComponentType<object>);
  const StillBase = Base as ComponentType<object>;
  function AnimatedElement({ animate, transition, pivot, length, rest }: { animate: Target; transition?: Transition; pivot?: readonly [number, number]; length: number; rest: object }) {
    const state = useMotionState(animate, transition);
    const ox = pivot?.[0] ?? 0;
    const oy = pivot?.[1] ?? 0;
    const animatedProps = useAnimatedProps(() => motionFrame(state, ox, oy, length));
    return <AnimatedBase {...rest} animatedProps={animatedProps} />;
  }
  function MotionElement({ animate, initial: _initial, transition, pivot, length = 100, ...rest }: P & MotionProps) {
    const { still } = useScene();
    if (still) return <StillBase {...rest} {...stillFrame(animate, pivot, length)} />;
    return <AnimatedElement animate={animate} transition={transition} pivot={pivot} length={length} rest={rest} />;
  }
  MotionElement.displayName = `motion.${Base.displayName ?? Base.name ?? "svg"}`;
  return MotionElement;
}

export const motion = {
  g: makeMotion<GProps>(G),
  path: makeMotion<PathProps>(Path),
  circle: makeMotion<CircleProps>(Circle),
  rect: makeMotion<RectProps>(Rect),
  ellipse: makeMotion<EllipseProps>(Ellipse),
};
