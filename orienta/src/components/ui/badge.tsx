import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "primary" | "accent" | "otc" | "rx" | "hospital" | "ssn";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-ink-muted",
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-accent",
  otc: "bg-otc-soft text-otc",
  rx: "bg-primary text-on-primary",
  hospital: "bg-ink text-bg",
  ssn: "border border-calm text-calm",
};

export function Badge({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-small font-bold",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
