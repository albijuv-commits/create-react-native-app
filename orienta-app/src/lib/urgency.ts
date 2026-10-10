import { Clock, House, Siren, Stethoscope, type LucideIcon } from "lucide-react-native";
import casa from "@/assets/illustrations/urgenza-casa.webp";
import medico from "@/assets/illustrations/urgenza-medico.webp";
import presto from "@/assets/illustrations/urgenza-presto.webp";
import subito from "@/assets/illustrations/urgenza-subito.webp";
import type { UrgencyLevel } from "@/lib/design/urgency";
import type { Palette } from "~/theme/colors";

/** I quattro livelli in ordine, dal meno al più urgente */
export const LEVELS: readonly UrgencyLevel[] = ["home", "gp", "soon", "er"];

/** Colore, icona, etichetta breve e illustrazione di ogni livello: mai solo il colore */
export const LEVEL_UI: Record<UrgencyLevel, { color: keyof Palette; soft: keyof Palette; icon: LucideIcon; short: string; image: number }> = {
  home: { color: "calm", soft: "calmSoft", icon: House, short: "A casa", image: casa },
  gp: { color: "amber", soft: "amberSoft", icon: Stethoscope, short: "Dal medico", image: medico },
  soon: { color: "orange", soft: "orangeSoft", icon: Clock, short: "Entro 24 ore", image: presto },
  er: { color: "red", soft: "redSoft", icon: Siren, short: "Subito", image: subito },
};
