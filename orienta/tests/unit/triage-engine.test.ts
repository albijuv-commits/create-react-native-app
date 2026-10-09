import { describe, expect, it } from "vitest";
import type { SymptomId } from "@data/vocab/symptoms";
import { triageConditions } from "@/lib/conditions/catalog";
import { nextQuestions, rulesStep, scoreConditions, urgencyFloor } from "@/lib/triage/engine";
import { buildDoctorSummary } from "@/lib/triage/summary";
import {
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  type Answer,
  type Question,
  type TriageRequest,
  type TriageResponse,
} from "@/lib/triage/schema";

const CONDITIONS = triageConditions();

const base = (over: Partial<TriageRequest> = {}): TriageRequest => ({
  profile: { age: 35, sex: "femmina", pregnancy: "no" },
  text: "",
  symptoms: [],
  zones: [],
  answers: [],
  ...over,
});

interface Persona {
  has: SymptomId[];
  duration?: string;
  intensity?: number;
}

function answerFor(q: Question, p: Persona): Answer {
  switch (q.kind) {
    case "redflags":
      return { kind: "redflags", question: q, value: [] };
    case "choice":
      return { kind: "choice", question: q, value: p.duration ?? "1-3-giorni" };
    case "scale":
      return { kind: "scale", question: q, value: p.intensity ?? 3 };
    case "yesno":
      return { kind: "yesno", question: q, value: q.symptomId && p.has.includes(q.symptomId) ? "si" : "no" };
  }
}

/** Fa l'intervista completa con il motore a regole, rispondendo come la persona indicata */
function interview(req: TriageRequest, p: Persona): { final: TriageResponse; asked: Question[] } {
  let state = req;
  const asked: Question[] = [];
  for (let round = 0; round < 10; round++) {
    const step = rulesStep(CONDITIONS, state);
    if (step.kind !== "questions") return { final: step, asked };
    asked.push(...step.questions);
    state = { ...state, answers: [...state.answers, ...step.questions.map((q) => answerFor(q, p))] };
  }
  throw new Error("L'intervista non finisce");
}

describe("motore a regole: domande", () => {
  it("comincia dai segnali d'allarme, poi durata e intensità, e arriva ad almeno 5 domande", () => {
    const qs = nextQuestions(CONDITIONS, base({ symptoms: ["naso-chiuso"] }));
    expect(qs.slice(0, 3).map((q) => q.id)).toEqual(["segnali-allarme", "durata", "intensita"]);
    expect(qs.length).toBeGreaterThanOrEqual(MIN_QUESTIONS);
  });

  it("chiede tra 5 e 12 domande, senza ripeterle", () => {
    const { asked } = interview(base({ symptoms: ["mal-di-testa"] }), { has: ["mal-di-testa", "nausea"] });
    expect(asked.length).toBeGreaterThanOrEqual(MIN_QUESTIONS);
    expect(asked.length).toBeLessThanOrEqual(MAX_QUESTIONS);
    expect(new Set(asked.map((q) => q.id)).size).toBe(asked.length);
  });

  it("con una sola condizione in vista, conferma prima i suoi sintomi chiave", () => {
    const qs = nextQuestions(CONDITIONS, base({ symptoms: ["bruciore-urinare"] }));
    expect(qs[3]?.id).toBe("sintomo-urinare-spesso");
  });

  it("con più condizioni in vista, chiede ciò che le distingue", () => {
    const qs = nextQuestions(CONDITIONS, base({ symptoms: ["naso-chiuso", "naso-che-cola", "starnuti"] }));
    const symptomIds = qs.slice(3).map((q) => q.id);
    // Febbre o prurito separano raffreddore e allergie meglio dei sintomi che hanno in comune
    expect(symptomIds.some((id) => id === "sintomo-febbre" || id === "sintomo-prurito-naso" || id === "sintomo-prurito-occhi")).toBe(true);
  });

  it("con solo una zona toccata, chiede dei sintomi di quella zona", () => {
    const qs = nextQuestions(CONDITIONS, base({ zones: ["schiena-bassa"] }));
    expect(qs.map((q) => q.id)).toContain("sintomo-mal-di-schiena");
  });
});

describe("motore a regole: risultati", () => {
  it("raffreddore: lo trova tra le prime possibilità e consiglia di gestirlo a casa", () => {
    const { final } = interview(base({ symptoms: ["naso-chiuso", "starnuti"] }), {
      has: ["naso-chiuso", "starnuti", "naso-che-cola", "mal-di-gola"],
    });
    expect(final.kind).toBe("results");
    if (final.kind !== "results") return;
    expect(final.conditions.slice(0, 3).map((c) => c.id)).toContain("raffreddore");
    expect(final.conditions.length).toBeLessThanOrEqual(5);
    expect(final.urgency).toBe("home");
    expect(final.source).toBe("regole");
  });

  it("cistite: compatibilità alta e indicazione di sentire il medico", () => {
    const { final } = interview(base({ symptoms: ["bruciore-urinare", "urinare-spesso"] }), {
      has: ["bruciore-urinare", "urinare-spesso", "urine-torbide"],
    });
    if (final.kind !== "results") throw new Error(final.kind);
    expect(final.conditions[0]).toMatchObject({ id: "cistite", compatibility: "alta" });
    expect(final.conditions[0]?.matchingSymptoms).toEqual(expect.arrayContaining(["bruciore-urinare", "urinare-spesso"]));
    expect(final.urgency).toBe("gp");
  });

  it("nessun sintomo riconosciuto: condizione non identificata, medico di base", () => {
    const { final } = interview(base(), { has: [] });
    if (final.kind !== "results") throw new Error(final.kind);
    expect(final.unidentified).toBe(true);
    expect(final.conditions).toEqual([]);
    expect(final.urgency).toBe("gp");
  });

  it("le condizioni senza sintomi tipici (pressione alta) non vengono proposte", () => {
    const scored = scoreConditions(CONDITIONS, base({ symptoms: ["mal-di-testa", "capogiri", "vista-offuscata"] }));
    expect(scored.map((s) => s.condition.id)).not.toContain("ipertensione");
  });
});

describe("motore a regole: segnali d'allarme e urgenza", () => {
  it("una voce spuntata nell'elenco porta all'emergenza", () => {
    const q = nextQuestions(CONDITIONS, base())[0]!;
    const step = rulesStep(CONDITIONS, base({ answers: [{ kind: "redflags", question: q, value: ["respiro"] }] }));
    expect(step).toEqual({ kind: "emergency", flags: ["respiro"] });
  });

  it("il testo con un segnale d'allarme porta all'emergenza prima di ogni domanda", () => {
    expect(rulesStep(CONDITIONS, base({ text: "ho un dolore al petto che mi opprime" }))).toEqual({
      kind: "emergency",
      flags: ["dolore-petto"],
    });
  });

  it("le risposte alzano il livello minimo di urgenza", () => {
    const q = (id: string): Question => ({ kind: id === "intensita" ? "scale" : "choice", id, text: "domanda di prova", ...(id === "durata" ? { options: [{ id: "a", label: "a" }, { id: "b", label: "b" }] } : {}) }) as Question;
    expect(urgencyFloor(base(), false)).toBe("home");
    expect(urgencyFloor(base({ answers: [{ kind: "scale", question: q("intensita"), value: 9 }] }), false)).toBe("soon");
    expect(urgencyFloor(base({ answers: [{ kind: "scale", question: q("intensita"), value: 6 }] }), false)).toBe("gp");
    expect(urgencyFloor(base({ answers: [{ kind: "choice", question: q("durata"), value: "piu-di-un-mese" }] }), false)).toBe("gp");
    expect(urgencyFloor(base({ profile: { age: 0, sex: "maschio", pregnancy: "non-applicabile" } }), false)).toBe("soon");
    expect(urgencyFloor(base({ profile: { age: 30, sex: "femmina", pregnancy: "si" } }), false)).toBe("gp");
    expect(urgencyFloor(base(), true)).toBe("gp");
  });

  it("un dolore molto forte non lascia l'indicazione «a casa» anche per un raffreddore", () => {
    const { final } = interview(base({ symptoms: ["naso-chiuso", "starnuti"] }), {
      has: ["naso-chiuso", "starnuti", "naso-che-cola", "mal-di-gola"],
      intensity: 9,
    });
    if (final.kind !== "results") throw new Error(final.kind);
    expect(final.urgency).toBe("soon");
  });
});

describe("riepilogo per il medico", () => {
  it("contiene dati, risposte, urgenza e possibilità, senza promettere una diagnosi", () => {
    const req = base({ text: "Bruciore quando faccio pipì", symptoms: ["bruciore-urinare", "urinare-spesso"] });
    const { final } = interview(req, { has: ["bruciore-urinare", "urinare-spesso"] });
    if (final.kind !== "results") throw new Error(final.kind);
    const text = buildDoctorSummary(req, final, CONDITIONS, new Date(Date.UTC(2026, 9, 7, 10, 30)));
    expect(text).toContain("Riepilogo per il medico");
    expect(text).toContain("Non è una diagnosi");
    expect(text).toContain("Età: 35 anni");
    expect(text).toContain("«Bruciore quando faccio pipì»");
    expect(text).toContain("Cistite, compatibilità alta");
    expect(text).toContain("Senti il medico di base");
  });
});
