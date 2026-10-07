import { HeartPulse, Microscope, Pill, Stethoscope, UserRound } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Percorsi che attivano questa scheda */
  match: (pathname: string) => boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/",
    label: "Sintomi",
    icon: HeartPulse,
    match: (p) => p === "/" || p.startsWith("/sintomi"),
  },
  { href: "/condizioni", label: "Condizioni", icon: Microscope, match: (p) => p.startsWith("/condizioni") },
  { href: "/medici", label: "Medici", icon: Stethoscope, match: (p) => p.startsWith("/medici") },
  { href: "/mercato", label: "Mercato", icon: Pill, match: (p) => p.startsWith("/mercato") },
  { href: "/profilo", label: "Profilo", icon: UserRound, match: (p) => p.startsWith("/profilo") },
];
