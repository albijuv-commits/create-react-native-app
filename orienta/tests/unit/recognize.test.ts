import { describe, expect, it } from "vitest";
import { ambiguousTerms, recognizeSymptoms } from "@/lib/triage/recognize";

describe("riconoscimento dei sintomi nel testo libero", () => {
  it("trova sintomi scritti con parole comuni", () => {
    const r = recognizeSymptoms("Da ieri ho il naso chiuso, starnuti e un po' di mal di gola");
    expect(r.present).toEqual(["naso-chiuso", "starnuti", "mal-di-gola"]);
  });

  it("ignora accenti, maiuscole e punteggiatura", () => {
    expect(recognizeSymptoms("FEBBRE! E tanta STANCHEZZA...").present).toEqual(["febbre", "stanchezza"]);
  });

  it("riconosce le negazioni", () => {
    const r = recognizeSymptoms("Ho mal di gola ma non ho febbre e niente tosse secca");
    expect(r.present).toEqual(["mal-di-gola"]);
    expect(r.negated).toEqual(["febbre", "tosse-secca"]);
  });

  it("l'espressione più lunga vince su quella generica", () => {
    const r = recognizeSymptoms("ho prurito agli occhi");
    expect(r.present).toEqual(["prurito-occhi"]);
    expect(r.present).not.toContain("prurito-pelle");
  });

  it("non duplica un sintomo citato due volte", () => {
    expect(recognizeSymptoms("febbre, febbre alta, ho la febbre").present).toEqual(["febbre"]);
  });

  it("le frasi che contengono «non» nel sintomo stesso non sono negate", () => {
    expect(recognizeSymptoms("non riesco ad addormentarmi").present).toEqual(["difficolta-addormentarsi"]);
  });

  it("testo vuoto o senza sintomi", () => {
    expect(recognizeSymptoms("")).toEqual({ present: [], negated: [] });
    expect(recognizeSymptoms("buongiorno, vorrei un consiglio").present).toEqual([]);
  });

  it("tollera qualche parola in mezzo e le radici delle parole", () => {
    expect(recognizeSymptoms("Mi brucia quando faccio pipì e devo andare spesso in bagno").present).toEqual(["bruciore-urinare", "urinare-spesso"]);
    expect(recognizeSymptoms("ho la tosse molto secca").present).toEqual(["tosse-secca"]);
    expect(recognizeSymptoms("starnutisco di continuo e mi fa male la testa").present).toEqual(["starnuti", "mal-di-testa"]);
  });

  it("una negazione in mezzo all'espressione la nega", () => {
    const r = recognizeSymptoms("il naso non è chiuso");
    expect(r.present).toEqual([]);
    expect(r.negated).toEqual(["naso-chiuso"]);
  });

  it("non confonde parole con la stessa radice ma senso diverso", () => {
    expect(recognizeSymptoms("ho un malessere generale").present).toEqual(["malessere"]);
    expect(recognizeSymptoms("da febbraio dormo male").present).not.toContain("febbre");
  });
});

describe("parole generiche da precisare", () => {
  it("«tosse» da sola: chiede se è secca o con catarro", () => {
    expect(ambiguousTerms("ho la tosse da tre giorni", [])).toEqual([
      { term: "tosse", question: "Che tipo di tosse?", options: ["tosse-secca", "tosse-catarro"] },
    ]);
  });

  it("niente da chiedere se il tipo è già noto o la parola è negata", () => {
    expect(ambiguousTerms("ho la tosse secca", ["tosse-secca"])).toEqual([]);
    expect(ambiguousTerms("non ho tosse", [])).toEqual([]);
  });

  it("il mal di stomaco può essere pancia, bruciore o nausea", () => {
    expect(ambiguousTerms("mi fa male lo stomaco", [])[0]?.options).toEqual(["mal-di-pancia", "bruciore-petto", "nausea"]);
  });
});
