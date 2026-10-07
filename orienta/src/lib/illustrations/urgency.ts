import type { StaticImageData } from "next/image";
import casa from "@/assets/illustrations/urgenza-casa.webp";
import medico from "@/assets/illustrations/urgenza-medico.webp";
import presto from "@/assets/illustrations/urgenza-presto.webp";
import subito from "@/assets/illustrations/urgenza-subito.webp";
import type { UrgencyLevel } from "@/lib/design/urgency";

export const URGENCY_ILLUSTRATIONS: Record<UrgencyLevel, StaticImageData> = { home: casa, gp: medico, soon: presto, er: subito };

/** Gli stessi oggetti in 3D (GLB in public/models), da ruotare nei risultati */
export const URGENCY_MODELS: Record<UrgencyLevel, string> = {
  home: "/models/urgenza-casa.glb",
  gp: "/models/urgenza-medico.glb",
  soon: "/models/urgenza-presto.glb",
  er: "/models/urgenza-subito.glb",
};
