import type { HistoryEntry } from "@/lib/storage/history";
import type { TriageCondition } from "./engine";
import type { TriageRequest, TriageResponse } from "./schema";

/** La voce dello storico per una sessione conclusa: risultati, sintomi e riepilogo per il medico */
export function makeHistoryEntry(
  id: string,
  req: TriageRequest,
  result: Extract<TriageResponse, { kind: "results" }>,
  conditions: readonly TriageCondition[],
  summary: string,
  at: Date,
): HistoryEntry {
  const names = new Map(conditions.map((c) => [c.id, c.name]));
  return {
    id,
    createdAt: at.toISOString(),
    source: result.source,
    urgency: result.urgency,
    unidentified: result.unidentified,
    conditions: result.conditions.flatMap((c) => {
      const name = names.get(c.id);
      return name ? [{ id: c.id, name, compatibility: c.compatibility }] : [];
    }),
    symptoms: req.symptoms,
    age: req.profile.age,
    summary,
  };
}
