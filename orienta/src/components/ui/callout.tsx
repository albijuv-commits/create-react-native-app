import { AlertTriangle, Info, OctagonAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CalloutTone = "info" | "warning" | "danger";

const tones: Record<CalloutTone, { box: string; icon: ReactNode }> = {
  info: {
    box: "border-primary bg-primary-soft",
    icon: <Info aria-hidden className="size-5 shrink-0 text-primary" />,
  },
  warning: {
    box: "border-amber bg-amber-soft",
    icon: <AlertTriangle aria-hidden className="size-5 shrink-0 text-amber" />,
  },
  danger: {
    box: "border-red bg-red-soft",
    icon: <OctagonAlert aria-hidden className="size-5 shrink-0 text-red" />,
  },
};

/** Box informativo con bordo laterale: per avvisi e note, non per contenuti principali. */
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
      className={cn("flex gap-3 rounded-xl border-l-4 p-4 text-small", t.box, className)}
    >
      {t.icon}
      <div className="space-y-1">
        {title && <p className="font-bold text-ink">{title}</p>}
        <div className="text-ink">{children}</div>
      </div>
    </div>
  );
}
