import { useId, type ReactNode } from "react";
import type { FormFamily } from "@/lib/medicines/forms";
import { cn } from "@/lib/cn";

/**
 * Illustrazioni originali per forma farmaceutica, nello stile «argilla» dell'app: volumi morbidi,
 * luce dall'alto a sinistra, palette dei vetrini (eosina, ematossilina, vetro). Nessuna confezione
 * reale, nessun testo, nessun marchio: le foto delle confezioni sono protette da copyright.
 */
const PINK = ["#fff8f2", "#f6d3df", "#e98aa8", "#c2185b"] as const;
const INDIGO = ["#eef0f7", "#b9b0f0", "#6556c9", "#3b2c85"] as const;

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <radialGradient id={`${id}-pink`} cx="35%" cy="30%" r="80%">
        <stop offset="0" stopColor={PINK[0]} />
        <stop offset="0.45" stopColor={PINK[1]} />
        <stop offset="1" stopColor={PINK[2]} />
      </radialGradient>
      <radialGradient id={`${id}-indigo`} cx="35%" cy="30%" r="85%">
        <stop offset="0" stopColor={INDIGO[1]} />
        <stop offset="0.55" stopColor={INDIGO[2]} />
        <stop offset="1" stopColor={INDIGO[3]} />
      </radialGradient>
      <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.6" stopColor={INDIGO[0]} />
        <stop offset="1" stopColor={INDIGO[1]} />
      </linearGradient>
      <linearGradient id={`${id}-cream`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor={PINK[1]} />
      </linearGradient>
      <radialGradient id={`${id}-shadow`} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor={INDIGO[3]} stopOpacity="0.22" />
        <stop offset="1" stopColor={INDIGO[3]} stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

const Shine = ({ d }: { d: string }) => <path d={d} fill="#ffffff" opacity="0.55" />;

function Tablet({ cx, cy, r, id }: { cx: number; cy: number; r: number; id: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy + r * 0.12} r={r} fill={PINK[2]} opacity="0.5" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-pink)`} />
      <ellipse cx={cx - r * 0.32} cy={cy - r * 0.38} rx={r * 0.38} ry={r * 0.22} fill="#ffffff" opacity="0.6" />
    </g>
  );
}

function scene(family: FormFamily, id: string): ReactNode {
  const u = (name: string) => `url(#${id}-${name})`;
  switch (family) {
    case "compresse":
      return (
        <>
          <g transform="rotate(-10 56 54)">
            <rect x="20" y="22" width="68" height="62" rx="14" fill={u("glass")} stroke={INDIGO[1]} strokeWidth="1.5" />
            {[0, 1].map((col) =>
              [0, 1, 2].map((row) => <Tablet key={`${col}-${row}`} cx={40 + col * 28} cy={36 + row * 17} r={7.5} id={id} />),
            )}
          </g>
          <g>
            <circle cx="84" cy="88" r="15" fill={PINK[2]} opacity="0.55" />
            <circle cx="84" cy="86" r="15" fill={u("pink")} />
            <path d="M72 86 h24" stroke={PINK[2]} strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
            <ellipse cx="78" cy="79" rx="6" ry="3.2" fill="#ffffff" opacity="0.6" />
          </g>
        </>
      );
    case "capsule":
      return (
        <>
          <g transform="rotate(-28 60 58)">
            <rect x="22" y="46" width="76" height="26" rx="13" fill={u("pink")} />
            <path d="M35 46 h25 v26 h-25 a13 13 0 0 1 0 -26 z" fill={u("indigo")} />
            <Shine d="M30 52 h56 a4 4 0 0 1 0 5 h-56 a4 4 0 0 1 0 -5 z" />
          </g>
          <g transform="rotate(22 70 80)">
            <rect x="40" y="70" width="64" height="22" rx="11" fill={u("indigo")} />
            <path d="M72 70 h21 a11 11 0 0 1 0 22 h-21 z" fill={u("pink")} />
            <Shine d="M47 75 h46 a3 3 0 0 1 0 4 h-46 a3 3 0 0 1 0 -4 z" />
          </g>
        </>
      );
    case "sciroppo":
      return (
        <>
          <rect x="44" y="16" width="30" height="16" rx="5" fill={u("indigo")} />
          {[50, 56, 62, 68].map((x) => (
            <path key={x} d={`M${x} 19 v10`} stroke={INDIGO[3]} strokeWidth="1.4" opacity="0.5" />
          ))}
          <rect x="49" y="30" width="20" height="10" rx="3" fill={INDIGO[0]} />
          <path d="M36 52 q0 -14 14 -14 h18 q14 0 14 14 v38 q0 12 -12 12 h-22 q-12 0 -12 -12 z" fill={u("pink")} />
          <path d="M36 66 h46 v24 q0 12 -12 12 h-22 q-12 0 -12 -12 z" fill={PINK[3]} opacity="0.25" />
          <rect x="42" y="60" width="34" height="22" rx="6" fill={u("cream")} opacity="0.95" />
          <Shine d="M42 48 q2 -6 8 -6 h2 q-6 2 -6 10 v26 q-4 -2 -4 -8 z" />
          <ellipse cx="94" cy="92" rx="10" ry="6.5" fill={u("indigo")} transform="rotate(-25 94 92)" />
          <path d="M86 98 L66 108" stroke={INDIGO[2]} strokeWidth="5" strokeLinecap="round" />
        </>
      );
    case "bustine": {
      const zig = (x: number, w: number, y: number) =>
        Array.from({ length: Math.round(w / 6) }, (_, i) => `l3 ${i % 2 ? 3 : -3} l3 ${i % 2 ? -3 : 3}`).join(" ").replace(/^/, `M${x} ${y} `);
      return (
        <>
          <g transform="rotate(-14 50 56)">
            <path d={`${zig(26, 48, 26)} v58 q0 6 -6 6 h-36 q-6 0 -6 -6 z`} fill={u("glass")} stroke={INDIGO[1]} strokeWidth="1.5" />
            <rect x="32" y="48" width="36" height="12" rx="6" fill={INDIGO[1]} opacity="0.7" />
          </g>
          <g transform="rotate(10 72 64)">
            <path d={`${zig(52, 48, 32)} v58 q0 6 -6 6 h-36 q-6 0 -6 -6 z`} fill={u("pink")} />
            <rect x="58" y="56" width="36" height="12" rx="6" fill="#ffffff" opacity="0.55" />
            <Shine d="M56 40 h6 v40 q-6 -2 -6 -10 z" />
          </g>
          {[
            [96, 100, 3],
            [102, 94, 2.4],
            [90, 104, 2],
            [106, 102, 2.6],
          ].map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={PINK[0]} stroke={PINK[2]} strokeWidth="1" />
          ))}
        </>
      );
    }
    case "spray-nasale":
      return (
        <>
          {[
            [84, 18, 2.4],
            [92, 24, 1.8],
            [78, 12, 1.6],
            [90, 12, 1.4],
            [98, 16, 1.2],
          ].map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={INDIGO[1]} opacity="0.8" />
          ))}
          <path d="M54 40 l4 -18 q2 -6 8 -6 h0 q6 0 8 6 l4 18 z" fill={u("glass")} stroke={INDIGO[1]} strokeWidth="1.5" />
          <rect x="46" y="38" width="40" height="12" rx="4" fill={u("indigo")} />
          <rect x="40" y="48" width="52" height="54" rx="18" fill={u("cream")} stroke={PINK[1]} strokeWidth="1.5" />
          <rect x="48" y="62" width="36" height="22" rx="8" fill={u("pink")} />
          <Shine d="M46 56 q2 -4 6 -4 h2 q-4 2 -4 8 v30 q-4 -2 -4 -8 z" />
        </>
      );
    case "collirio":
      return (
        <>
          <path d="M92 16 q8 12 8 18 a8 8 0 0 1 -16 0 q0 -6 8 -18 z" fill={u("indigo")} />
          <ellipse cx="89" cy="30" rx="2.5" ry="4" fill="#ffffff" opacity="0.6" />
          <path d="M54 46 l6 -20 q2 -4 4 -4 q2 0 4 4 l6 20 z" fill={u("glass")} stroke={INDIGO[1]} strokeWidth="1.5" />
          <rect x="48" y="44" width="32" height="10" rx="3" fill={u("indigo")} />
          <rect x="42" y="52" width="44" height="50" rx="14" fill={u("pink")} />
          <rect x="49" y="66" width="30" height="18" rx="6" fill={u("cream")} opacity="0.9" />
          <Shine d="M47 60 q2 -4 6 -4 h1 q-3 2 -3 7 v26 q-4 -2 -4 -8 z" />
        </>
      );
    case "crema":
      return (
        <>
          <g transform="rotate(-32 60 62)">
            <rect x="14" y="48" width="12" height="30" rx="2" fill={INDIGO[1]} />
            {[52, 58, 64, 70, 76].map((y) => (
              <path key={y} d={`M15 ${y} h10`} stroke={INDIGO[2]} strokeWidth="1.2" opacity="0.6" />
            ))}
            <path d="M26 48 h52 q8 0 12 8 l6 8 v0 l-6 8 q-4 8 -12 8 h-52 z" fill={u("pink")} />
            <rect x="34" y="54" width="36" height="20" rx="6" fill={u("cream")} opacity="0.9" />
            <rect x="96" y="56" width="14" height="16" rx="3" fill={u("indigo")} />
            <Shine d="M30 51 h44 q-2 4 -6 4 h-38 z" />
          </g>
          <path d="M84 96 q-2 -8 6 -9 q2 -7 9 -5 q7 -2 8 6 q6 2 3 8 z" fill={u("cream")} stroke={PINK[1]} strokeWidth="1.5" />
        </>
      );
    case "altro":
      return (
        <>
          <path d="M28 44 l34 -14 l32 12 l-34 14 z" fill={PINK[1]} />
          <path d="M28 44 l32 12 v46 l-32 -12 z" fill={u("pink")} />
          <path d="M60 56 l34 -14 v46 l-34 14 z" fill={PINK[2]} />
          <path d="M28 62 l32 12 v12 l-32 -12 z" fill={INDIGO[2]} opacity="0.85" />
          <path d="M60 74 l34 -14 v12 l-34 14 z" fill={INDIGO[3]} opacity="0.75" />
          <Shine d="M32 48 l24 9 v6 l-24 -9 z" />
        </>
      );
  }
}

export function FormArt({ family, className, title }: { family: FormFamily; className?: string; title?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("block", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <Defs id={id} />
      <ellipse cx="60" cy="108" rx="40" ry="7" fill={`url(#${id}-shadow)`} />
      {scene(family, id)}
    </svg>
  );
}
