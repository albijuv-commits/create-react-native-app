import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearSessions,
  deleteHistoryDatabase,
  deleteSession,
  historyEntrySchema,
  listSessions,
  MAX_SESSIONS,
  newSessionId,
  saveSession,
  type HistoryEntry,
} from "@/lib/storage/history";
import { makeHistoryEntry } from "@/lib/triage/history-entry";
import type { TriageCondition } from "@/lib/triage/engine";
import type { TriageRequest, TriageResponse } from "@/lib/triage/schema";

function entry(i: number, patch: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: `sessione-${String(i).padStart(4, "0")}`,
    createdAt: new Date(Date.UTC(2026, 9, 1, 8, i)).toISOString(),
    source: "regole",
    urgency: "gp",
    unidentified: false,
    conditions: [{ id: "cistite", name: "Cistite", compatibility: "alta" }],
    symptoms: ["bruciore-urinare"],
    age: 27,
    summary: "Riepilogo per il medico\n…",
    ...patch,
  };
}

beforeEach(async () => {
  await deleteHistoryDatabase();
});

describe("storico delle sessioni (IndexedDB)", () => {
  it("salva, elenca dalla più recente ed elimina una sessione", async () => {
    await saveSession(entry(1));
    await saveSession(entry(3));
    await saveSession(entry(2));
    expect((await listSessions()).map((e) => e.id)).toEqual(["sessione-0003", "sessione-0002", "sessione-0001"]);
    await deleteSession("sessione-0002");
    expect((await listSessions()).map((e) => e.id)).toEqual(["sessione-0003", "sessione-0001"]);
  });

  it("rifiuta voci non valide e ignora quelle rovinate già salvate", async () => {
    await expect(saveSession(entry(1, { age: 300 }))).rejects.toThrow();
    // Una voce scritta da un'altra versione o rovinata: non arriva all'interfaccia
    await new Promise<void>((resolve, reject) => {
      const open = indexedDB.open("orienta", 1);
      open.onupgradeneeded = () => open.result.createObjectStore("sessioni", { keyPath: "id" });
      open.onsuccess = () => {
        const tx = open.result.transaction("sessioni", "readwrite");
        tx.objectStore("sessioni").put({ id: "rovinata", summary: 42 });
        tx.oncomplete = () => {
          open.result.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
    await saveSession(entry(2));
    expect((await listSessions()).map((e) => e.id)).toEqual(["sessione-0002"]);
  });

  it(`tiene al massimo ${MAX_SESSIONS} sessioni, le più recenti`, async () => {
    for (let i = 0; i < MAX_SESSIONS + 3; i++) await saveSession(entry(i));
    const all = await listSessions();
    expect(all).toHaveLength(MAX_SESSIONS);
    expect(all.at(-1)!.id).toBe("sessione-0003");
  });

  it("svuota lo storico ed elimina il database", async () => {
    await saveSession(entry(1));
    await clearSessions();
    expect(await listSessions()).toEqual([]);
    await saveSession(entry(2));
    await deleteHistoryDatabase();
    expect(await listSessions()).toEqual([]);
  });
});

describe("voce dello storico dai risultati", () => {
  it("prende urgenza, condizioni con il nome, sintomi, età e riepilogo", () => {
    const conditions = [{ id: "cistite", name: "Cistite" }] as unknown as TriageCondition[];
    const req = { profile: { age: 34, sex: "femmina", pregnancy: "no" }, text: "brucia", symptoms: ["bruciore-urinare"], zones: [], answers: [] } as unknown as TriageRequest;
    const result: Extract<TriageResponse, { kind: "results" }> = {
      kind: "results",
      source: "regole",
      urgency: "gp",
      unidentified: false,
      conditions: [
        { id: "cistite", compatibility: "alta", matchingSymptoms: ["bruciore-urinare"] },
        { id: "sconosciuta", compatibility: "bassa", matchingSymptoms: [] },
      ],
    };
    const at = new Date("2026-10-07T10:00:00Z");
    const e = makeHistoryEntry(newSessionId(), req, result, conditions, "Riepilogo", at);
    expect(historyEntrySchema.safeParse(e).success).toBe(true);
    expect(e).toMatchObject({ createdAt: "2026-10-07T10:00:00.000Z", urgency: "gp", age: 34, summary: "Riepilogo" });
    expect(e.conditions).toEqual([{ id: "cistite", name: "Cistite", compatibility: "alta" }]);
  });
});
