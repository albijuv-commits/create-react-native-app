import { Hammer } from "lucide-react";

/** Segnaposto per le sezioni costruite nelle fasi successive. */
export function ComingSoon({ phase, children }: { phase: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl border-2 border-dashed border-line p-5 text-ink-muted">
      <Hammer aria-hidden className="size-6 shrink-0" />
      <div className="space-y-1">
        <p className="font-bold text-ink">In costruzione (fase {phase})</p>
        <p className="text-small">{children}</p>
      </div>
    </div>
  );
}
