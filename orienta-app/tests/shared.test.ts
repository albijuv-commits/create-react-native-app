import { CONDITIONS } from "@data/conditions";
import { parsePrefs } from "@/lib/prefs/prefs";
import { rulesStep } from "@/lib/triage/engine";
import { recognizeSymptoms } from "@/lib/triage/recognize";
import { detectRedFlags } from "@/lib/triage/red-flags";
import { triageConditions } from "@/lib/conditions/knowledge-base";

/* Il codice della web app gira identico nell'app: stesse schede, stesse regole, stessi allarmi */
describe("codice condiviso con la web app", () => {
  it("carica le 40 schede delle condizioni validate con Zod", () => {
    expect(CONDITIONS.length).toBeGreaterThanOrEqual(40);
    expect(CONDITIONS.find((c) => c.id === "cistite")?.name).toBe("Cistite");
  });

  it("i segnali d'allarme sono gli stessi, compresi quelli aggiunti nella revisione", () => {
    expect(detectRedFlags({ text: "Mi voglio fare del male" })).toEqual(["autolesionismo"]);
    expect(detectRedFlags({ text: "Ho un dolore al petto che mi opprime" })).toEqual(["dolore-petto"]);
    expect(detectRedFlags({ text: "Ho un po' di raffreddore" })).toEqual([]);
  });

  it("riconosce i sintomi e il motore a regole propone le domande", () => {
    const { present } = recognizeSymptoms("Mi brucia quando faccio pipì e non riesco a deglutire");
    expect(present).toEqual(expect.arrayContaining(["bruciore-urinare", "difficolta-deglutire"]));
    const step = rulesStep(triageConditions(), {
      profile: { age: 30, sex: "femmina", pregnancy: "no" },
      text: "Mi brucia quando faccio pipì",
      symptoms: ["bruciore-urinare"],
      zones: [],
      answers: [],
    });
    expect(step.kind).toBe("questions");
  });

  it("le preferenze hanno lo stesso schema della web app", () => {
    expect(parsePrefs('{"theme":"dark","textSize":"xlarge"}')).toMatchObject({ theme: "dark", textSize: "xlarge", defaultCity: "" });
    expect(parsePrefs("non è json")).toMatchObject({ theme: "system", textSize: "normal" });
  });
});
