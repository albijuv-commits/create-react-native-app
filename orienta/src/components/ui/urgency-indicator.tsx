import { Clock, House, Siren, Stethoscope } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { URGENCY, type UrgencyLevel } from "@/lib/design/urgency";
import { cn } from "@/lib/cn";

const ICONS: Record<UrgencyLevel, ComponentType<SVGProps<SVGSVGElement>>> = {
  home: House,
  gp: Stethoscope,
  soon: Clock,
  er: Siren,
};

/** Livello di urgenza: colore, icona e testo insieme, mai solo colore. */
export function UrgencyIndicator({
  level,
  showDescription = true,
  className,
}: {
  level: UrgencyLevel;
  showDescription?: boolean;
  className?: string;
}) {
  const meta = URGENCY[level];
  const Icon = ICONS[level];
  return (
    <div
      className={cn("flex items-start gap-3 rounded-2xl border-2 p-4", meta.tone.bg, meta.tone.border, className)}
    >
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-full bg-surface", meta.tone.text)}>
        <Icon aria-hidden className="size-6" />
      </span>
      <div>
        <p className={cn("text-heading font-bold", meta.tone.text)}>{meta.label}</p>
        {showDescription && <p className="text-small text-ink">{meta.description}</p>}
      </div>
    </div>
  );
}
