import { BadgeCheck, FileText, Hospital, ShieldCheck, Stethoscope } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/cn";
import { supplyBadge, SUPPLY_BADGE_LABEL, type SupplyBadge, type SupplyCode } from "@/lib/medicines/regime";

const STYLE: Record<SupplyBadge, { className: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }> = {
  // Il verde è riservato a «Senza ricetta»
  "senza-ricetta": { className: "bg-otc-soft text-otc", Icon: BadgeCheck },
  "con-ricetta": { className: "bg-primary-soft text-primary", Icon: FileText },
  ospedaliero: { className: "bg-surface-2 text-ink", Icon: Hospital },
  specialista: { className: "bg-surface-2 text-ink", Icon: Stethoscope },
  "non-indicato": { className: "bg-surface-2 text-ink-muted", Icon: FileText },
};

/** Il regime di fornitura con colore, icona e testo: mai solo il colore */
export function SupplyBadge({ code, className }: { code: SupplyCode | null; className?: string }) {
  const badge = supplyBadge(code);
  const { className: tone, Icon } = STYLE[badge];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.8125rem] font-bold", tone, className)}>
      <Icon aria-hidden className="size-4" />
      {SUPPLY_BADGE_LABEL[badge]}
    </span>
  );
}

/** Classe A: il Servizio sanitario nazionale lo rimborsa */
export function ReimbursableBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-[0.8125rem] font-bold text-accent", className)}>
      <ShieldCheck aria-hidden className="size-4" />
      Rimborsabile SSN
    </span>
  );
}
