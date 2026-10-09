import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { TiltIllustration } from "./tilt-illustration";

export function PageHeader({
  title,
  lead,
  illustration,
  children,
}: {
  title: string;
  lead?: ReactNode;
  /** Illustrazione decorativa accanto al titolo */
  illustration?: StaticImageData;
  children?: ReactNode;
}) {
  return (
    <header className="space-y-2 pb-4 pt-2">
      <div className="flex items-center gap-3">
        <h1 className="min-w-0 flex-1 text-display font-bold text-primary">{title}</h1>
        {illustration && <TiltIllustration src={illustration} sizes="96px" priority className="w-24 shrink-0" />}
      </div>
      {lead && <p className="text-body text-ink-muted">{lead}</p>}
      {children}
    </header>
  );
}
