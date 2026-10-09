"use client";

import { C } from "@/components/slide/palette";

const CELLS = [
  { x: 72, y: 78, r: 17, n: 7 },
  { x: 118, y: 66, r: 14, n: 6 },
  { x: 128, y: 112, r: 19, n: 7.5 },
  { x: 84, y: 124, r: 15, n: 6 },
  { x: 104, y: 94, r: 11, n: 4.5 },
] as const;

/**
 * Attesa mentre si preparano domande o risultati: il vetrino mette a fuoco le cellule.
 * Compare solo dopo un'azione della persona; con meno movimento resta un'immagine ferma e nitida.
 */
export function Thinking({ title, detail, reduced }: { title: string; detail?: string; reduced: boolean }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-5 py-14 text-center">
      <svg viewBox="0 0 200 200" className="size-52" aria-hidden>
        <defs>
          <clipPath id="attesa-vetro">
            <circle cx="100" cy="100" r="86" />
          </clipPath>
          <radialGradient id="attesa-luce" cx="0.45" cy="0.4" r="0.7">
            <stop offset="0" stopColor="#fffcfe" />
            <stop offset="0.75" stopColor="#f8eef5" />
            <stop offset="1" stopColor="#eadcea" />
          </radialGradient>
          <filter id="attesa-fuoco" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0">
              {!reduced && <animate attributeName="stdDeviation" values="5;0;0;5" keyTimes="0;0.42;0.72;1" dur="2.6s" repeatCount="indefinite" />}
            </feGaussianBlur>
          </filter>
        </defs>
        <circle cx="100" cy="100" r="98" fill="#2a2340" />
        <g clipPath="url(#attesa-vetro)">
          <rect width="200" height="200" fill="url(#attesa-luce)" />
          <g filter="url(#attesa-fuoco)">
            {CELLS.map((c) => (
              <g key={`${c.x}-${c.y}`}>
                <circle cx={c.x} cy={c.y} r={c.r} fill={C.cytoplasm} stroke={C.membrane} strokeWidth="1.6" />
                <circle cx={c.x + 2} cy={c.y - 1} r={c.n} fill={C.nucleus} />
              </g>
            ))}
          </g>
        </g>
        {/* La ghiera della messa a fuoco gira mentre si aspetta */}
        <g>
          {!reduced && <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="6s" repeatCount="indefinite" />}
          <circle cx="100" cy="100" r="93" fill="none" stroke="#7a6fa3" strokeWidth="3" strokeDasharray="2 7" />
        </g>
      </svg>
      <div className="space-y-1">
        <p className="text-heading font-bold text-primary">{title}</p>
        {detail && <p className="text-small text-ink-muted">{detail}</p>}
      </div>
    </div>
  );
}
