import { z } from "zod";

/** Livelli di urgenza, coerenti in tutta l'app: sempre colore + icona + testo. */
export const urgencyLevelSchema = z.enum(["home", "gp", "soon", "er"]);
export type UrgencyLevel = z.infer<typeof urgencyLevelSchema>;

export interface UrgencyMeta {
  level: UrgencyLevel;
  label: string;
  description: string;
  /** Classi Tailwind per testo, fondo e bordo */
  tone: { text: string; bg: string; border: string };
}

export const URGENCY: Record<UrgencyLevel, UrgencyMeta> = {
  home: {
    level: "home",
    label: "Puoi gestirlo a casa",
    description: "Riposo e attenzione ai sintomi. Se peggiorano o non passano, senti il medico.",
    tone: { text: "text-calm", bg: "bg-calm-soft", border: "border-calm" },
  },
  gp: {
    level: "gp",
    label: "Senti il medico di base o la guardia medica (116117 dove attivo)",
    description: "Non è un'emergenza, ma è bene parlarne con un medico nei prossimi giorni.",
    tone: { text: "text-amber", bg: "bg-amber-soft", border: "border-amber" },
  },
  soon: {
    level: "soon",
    label: "Fatti visitare a breve",
    description: "Cerca una visita entro 24 ore.",
    tone: { text: "text-orange", bg: "bg-orange-soft", border: "border-orange" },
  },
  er: {
    level: "er",
    label: "Vai subito al pronto soccorso",
    description: "Se non puoi muoverti in sicurezza, chiama il 112.",
    tone: { text: "text-red", bg: "bg-red-soft", border: "border-red" },
  },
};

const ORDER: readonly UrgencyLevel[] = ["home", "gp", "soon", "er"];

/** Restituisce il livello più urgente tra quelli dati. */
export function maxUrgency(levels: readonly UrgencyLevel[]): UrgencyLevel {
  return levels.reduce<UrgencyLevel>(
    (max, l) => (ORDER.indexOf(l) > ORDER.indexOf(max) ? l : max),
    "home",
  );
}
