import type { ReactNode } from "react";

export function PageHeader({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="space-y-2 pb-4 pt-2">
      <h1 className="text-display font-bold text-primary">{title}</h1>
      {lead && <p className="text-body text-ink-muted">{lead}</p>}
      {children}
    </header>
  );
}
