import { AlertTriangle, Info, OctagonAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CalloutTone = "info" | "warning" | "danger";

const tones: Record<CalloutTone, { box: string; icon: ReactNode }> = {
  info: {
    box: "border-primary/25 bg-primary-soft",
    icon: <Info aria-hidden className="size-5 shrink-0 text-primary" />,
  },
  warning: {
    box: "border-amber/30 bg-amber-soft",
    icon: <AlertTriangle aria-hidden className="size-5 shrink-0 text-amber" />,
  },
  danger: {
    box: "border-red/30 bg-red-soft",
    icon: <OctagonAlert aria-hidden className="size-5 shrink-0 text-red" />,
  },
};

/** Box informativo con fondo tinto e icona: per avvisi e note, non per contenuti principali. */
export function Callout({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : undefined}
      className={cn("flex gap-3 rounded-2xl border p-4 text-small", t.box, className)}
    >
      {t.icon}
      <div className="space-y-1">
        {title && <p className="font-bold text-ink">{title}</p>}
        <div className="text-ink">{children}</div>
      </div>
    </div>
  );
}
