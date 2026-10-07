import { RED_FLAGS } from "@data/emergency/red-flags";
import { bodyZoneLabel } from "@data/vocab/body";
import { symptomLabel } from "@data/vocab/symptoms";
import { URGENCY } from "@/lib/design/urgency";
import type { TriageCondition } from "./engine";
import { DURATION_OPTIONS } from "./questions";
import { NON_SO, type Answer, type Profile, type TriageRequest, type TriageResponse } from "./schema";

const SEX: Record<Profile["sex"], string> = {
  femmina: "femmina",
  maschio: "maschio",
  altro: "altro",
  "non-indicato": "non indicato",
};

const COMPATIBILITY = { bassa: "compatibilità bassa", media: "compatibilità media", alta: "compatibilità alta" } as const;

function answerText(a: Answer): string {
  switch (a.kind) {
    case "yesno":
      return a.value === "si" ? "sì" : a.value === "no" ? "no" : "non so";
    case "choice": {
      if (a.value === NON_SO) return "non so";
      const options = a.question.kind === "choice" ? a.question.options : [];
      return options.find((o) => o.id === a.value)?.label.toLowerCase() ?? a.value;
    }
    case "scale":
      return a.value === NON_SO ? "non so" : `${a.value} su 10`;
    case "redflags":
      return a.value.length ? a.value.map((id) => RED_FLAGS[id].checklist.toLowerCase()).join("; ") : "nessuno";
  }
}

/**
 * Il riepilogo da mostrare o consegnare al medico: dati di base, cosa ha riferito la persona,
 * le risposte e le possibilità emerse. In testo semplice, da copiare o da mettere in un PDF.
 */
export function buildDoctorSummary(
  req: TriageRequest,
  result: Extract<TriageResponse, { kind: "results" }>,
  conditions: readonly TriageCondition[],
  generatedAt: Date,
): string {
  const byId = new Map(conditions.map((c) => [c.id, c]));
  const date = new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeStyle: "short" }).format(generatedAt);
  const duration = req.answers.find((a) => a.question.id === "durata");
  const lines: string[] = [
    "Riepilogo per il medico",
    `Preparato con Orienta il ${date}. Non è una diagnosi: serve a raccontare i sintomi in modo ordinato.`,
    "",
    "Persona",
    `- Età: ${req.profile.age} anni`,
    `- Sesso: ${SEX[req.profile.sex]}`,
  ];
  if (req.profile.pregnancy !== "non-applicabile") {
    lines.push(`- Gravidanza: ${req.profile.pregnancy === "si" ? "sì" : req.profile.pregnancy === "no" ? "no" : "non so"}`);
  }
  lines.push("", "Cosa ha descritto");
  if (req.text.trim()) lines.push(`- «${req.text.trim()}»`);
  if (req.symptoms.length) lines.push(`- Sintomi: ${req.symptoms.map((s) => symptomLabel(s).toLowerCase()).join(", ")}`);
  if (req.zones.length) lines.push(`- Zone del corpo: ${req.zones.map((z) => bodyZoneLabel(z).toLowerCase()).join(", ")}`);
  if (duration?.kind === "choice" && duration.value !== NON_SO) {
    lines.push(`- Da quanto tempo: ${DURATION_OPTIONS.find((o) => o.id === duration.value)?.label.toLowerCase() ?? duration.value}`);
  }

  lines.push("", "Risposte alle domande");
  for (const a of req.answers) lines.push(`- ${a.question.text} ${answerText(a)}`);

  lines.push("", `Indicazione di Orienta: ${URGENCY[result.urgency].label}`);
  if (result.unidentified || result.conditions.length === 0) {
    lines.push("Nessuna condizione della base di conoscenza di Orienta è risultata compatibile.");
  } else {
    lines.push("Possibilità emerse (da verificare con il medico):");
    for (const r of result.conditions) {
      const name = byId.get(r.id)?.name ?? r.id;
      const matching = r.matchingSymptoms.map((s) => symptomLabel(s).toLowerCase()).join(", ");
      lines.push(`- ${name}, ${COMPATIBILITY[r.compatibility]}${matching ? `; sintomi corrispondenti: ${matching}` : ""}`);
    }
  }
  lines.push("", `Metodo: ${result.source === "ai" ? "domande e confronto con un modello di intelligenza artificiale" : "regole fisse sui sintomi"}.`);
  return lines.join("\n");
}
