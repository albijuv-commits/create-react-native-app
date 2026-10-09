import { Hammer } from "lucide-react";
import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { TiltIllustration } from "./tilt-illustration";

/** Segnaposto per le sezioni costruite nelle fasi successive. */
export function ComingSoon({ phase, illustration, children }: { phase: number; illustration?: StaticImageData; children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-3xl border-2 border-dashed border-line p-5 text-ink-muted">
      {illustration && <TiltIllustration src={illustration} sizes="160px" className="mx-auto w-40" />}
      <div className="flex gap-3">
        <Hammer aria-hidden className="size-6 shrink-0" />
        <div className="space-y-1">
          <p className="font-bold text-ink">In costruzione (fase {phase})</p>
          <p className="text-small">{children}</p>
        </div>
      </div>
    </div>
  );
}
