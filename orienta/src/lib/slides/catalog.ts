import { z } from "zod";
import { BODY_ZONE_IDS } from "@data/vocab/body";

/**
 * Catalogo delle scene del "vetrino" (senza React): quali scene esistono, quanti passi hanno,
 * quali parametri accettano e che barra di scala mostrano. Le schede delle condizioni
 * scelgono una scena da qui e scrivono una didascalia per ogni passo.
 */

export const SCENE_STEPS = 4;

const captions = z
  .array(z.string().trim().min(10).max(220))
  .length(SCENE_STEPS, { message: `Ogni scena ha esattamente ${SCENE_STEPS} didascalie` });

const spec = <S extends string, P extends z.ZodType>(scene: S, params: P) =>
  z.object({ scene: z.literal(scene), params, captions });

const noParams = z.strictObject({});

export const VIRUS_KINDS = ["rinovirus", "influenza", "coronavirus", "norovirus", "herpesvirus"] as const;
export type VirusKind = (typeof VIRUS_KINDS)[number];

export const sceneSpecSchema = z.discriminatedUnion("scene", [
  spec(
    "infezione-virale",
    z.object({ virus: z.enum(VIRUS_KINDS), sede: z.enum(["naso", "gola", "polmoni", "intestino"]) }),
  ),
  spec("herpes-latenza", z.object({ variante: z.enum(["labiale", "varicella"]) })),
  spec(
    "infezione-batterica",
    z.object({ batterio: z.enum(["bacillo", "streptococco"]), sede: z.enum(["vescica", "gola", "orecchio"]) }),
  ),
  spec(
    "reazione-allergica",
    z.object({
      allergene: z.enum(["polline", "acaro", "muffa", "generico"]),
      sede: z.enum(["naso", "occhi", "pelle", "bronchi"]),
    }),
  ),
  spec("infiammazione", z.object({ tessuto: z.enum(["occhio", "gola", "pelle"]) })),
  spec("seni-nasali", noParams),
  spec("orecchio-medio", noParams),
  spec("onda-emicrania", noParams),
  spec("tensione-muscolare", z.object({ zona: z.enum(["testa", "mandibola"]) })),
  spec("reflusso", noParams),
  spec("intestino-sensibile", noParams),
  spec("bronchi", z.object({ variante: z.enum(["asma", "bronchite"]) })),
  spec("vie-aeree-sonno", noParams),
  spec("ciclo-sonno", noParams),
  spec("allarme", noParams),
  spec("circolo-umore", noParams),
  spec("globuli-rossi", z.object({ variante: z.enum(["anemia", "monossido"]) })),
  spec("tiroide", noParams),
  spec("vaso-pressione", noParams),
  spec("glicemia", noParams),
  spec("bilancio-acqua", noParams),
  spec("termoregolazione", noParams),
  spec("pelle", z.object({ variante: z.enum(["atopica", "contatto", "psoriasi", "acne"]) })),
  spec("fibre", z.object({ tipo: z.enum(["legamento", "tendine"]) })),
  spec(
    "corpo",
    z.object({ zone: z.array(z.enum(BODY_ZONE_IDS)).min(1), vista: z.enum(["fronte", "retro"]) }),
  ),
]);

export type SceneSpec = z.infer<typeof sceneSpecSchema>;
export type SceneId = SceneSpec["scene"];
export type SceneParams<S extends SceneId> = Extract<SceneSpec, { scene: S }>["params"];

/** Tutte le scene, nell'ordine del catalogo. */
export const SCENE_IDS = sceneSpecSchema.options.map((o) => o.shape.scene.value) as SceneId[];

/** Titolo descrittivo della scena, usato anche dagli screen reader. */
export const SCENE_TITLES: Record<SceneId, string> = {
  "infezione-virale": "Un virus infetta le cellule",
  "herpes-latenza": "Il virus che si nasconde nei nervi",
  "infezione-batterica": "Batteri e globuli bianchi",
  "reazione-allergica": "La reazione allergica",
  infiammazione: "L'infiammazione",
  "seni-nasali": "Il muco nei seni nasali",
  "orecchio-medio": "Liquido dietro il timpano",
  "onda-emicrania": "L'onda nervosa dell'emicrania",
  "tensione-muscolare": "Muscoli in tensione",
  reflusso: "L'acido che risale",
  "intestino-sensibile": "Un intestino sensibile",
  bronchi: "Le vie respiratorie",
  "vie-aeree-sonno": "Il respiro durante il sonno",
  "ciclo-sonno": "Le fasi del sonno",
  allarme: "Il sistema d'allarme del corpo",
  "circolo-umore": "Il circolo dell'umore",
  "globuli-rossi": "I globuli rossi e l'ossigeno",
  tiroide: "La tiroide e i suoi ormoni",
  "vaso-pressione": "La pressione nelle arterie",
  glicemia: "Lo zucchero nel sangue",
  "bilancio-acqua": "L'acqua nel corpo",
  termoregolazione: "La temperatura del corpo",
  pelle: "Gli strati della pelle",
  fibre: "Fibre di legamenti e tendini",
  corpo: "Mappa del corpo",
};

/** Barra di scala: `units` è la lunghezza della barra nelle coordinate della scena (viewBox 200). */
export interface SceneScale {
  label: string;
  units: number;
}

/**
 * Dimensioni disegnate dei virus (diametro in unità della scena) e dimensioni reali (nm):
 * la barra di scala si ricava da qui, così resta coerente con il disegno.
 */
export const VIRUS_SIZES: Record<VirusKind, { drawn: number; nm: number }> = {
  rinovirus: { drawn: 13, nm: 30 },
  norovirus: { drawn: 14, nm: 35 },
  influenza: { drawn: 26, nm: 100 },
  coronavirus: { drawn: 28, nm: 110 },
  herpesvirus: { drawn: 36, nm: 180 },
};

export function sceneScale(spec: SceneSpec, step: number): SceneScale | null {
  switch (spec.scene) {
    case "infezione-virale": {
      const s = VIRUS_SIZES[spec.params.virus];
      return { label: "100 nm", units: (s.drawn * 100) / s.nm };
    }
    case "infezione-batterica":
      return { label: "1 µm", units: 16 };
    case "reazione-allergica":
      if (step === 0) {
        if (spec.params.allergene === "acaro") return { label: "0,1 mm", units: 34 };
        if (spec.params.allergene === "polline") return { label: "10 µm", units: 22 };
        if (spec.params.allergene === "muffa") return { label: "10 µm", units: 18 };
      }
      return { label: "5 µm", units: 24 };
    case "infiammazione":
      return { label: "20 µm", units: 30 };
    case "globuli-rossi":
      return { label: "10 µm", units: 40 };
    case "pelle":
      return { label: "0,1 mm", units: 30 };
    case "fibre":
      return { label: "1 mm", units: 30 };
    case "bronchi":
      return { label: "1 mm", units: 26 };
    case "seni-nasali":
      return { label: "2 cm", units: 28 };
    case "orecchio-medio":
      return { label: "1 cm", units: 36 };
    case "onda-emicrania":
    case "reflusso":
    case "vie-aeree-sonno":
      return { label: "5 cm", units: 40 };
    case "vaso-pressione":
      return { label: "5 mm", units: 40 };
    case "tiroide":
      return { label: "2 cm", units: 30 };
    default:
      return null;
  }
}
