"use client";

import { ArrowLeft, RotateCw, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { RedFlagId } from "@data/emergency/red-flags";
import type { BodyZoneId } from "@data/vocab/body";
import type { SymptomId } from "@data/vocab/symptoms";
import offline from "@/assets/illustrations/stato-offline.webp";
import { EmergencyPanel } from "@/components/emergency/emergency-panel";
import { Button } from "@/components/ui/button";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import type { InterviewCondition } from "@/lib/conditions/catalog";
import { fetchAiAvailability, postTriageStep, TriageRequestError } from "@/lib/triage/client";
import { redFlagsFor, rulesResults, rulesStep } from "@/lib/triage/engine";
import { CORE_QUESTIONS } from "@/lib/triage/questions";
import { ambiguousTerms, recognizeSymptoms } from "@/lib/triage/recognize";
import { detectRedFlags } from "@/lib/triage/red-flags";
import { MAX_QUESTIONS, MIN_QUESTIONS, type Answer, type Question, type TriageRequest, type TriageResponse } from "@/lib/triage/schema";
import { buildDoctorSummary } from "@/lib/triage/summary";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { ConsentStep, type ConsentState } from "./consent-step";
import { DescribeStep, MAX_TEXT } from "./describe-step";
import { StepHeader } from "./parts";
import { completeProfile, ProfileStep, type ProfileDraft } from "./profile-step";
import { QuestionDeck } from "./question-deck";
import { ResultsView } from "./results-view";
import { Thinking } from "./thinking";

type Stage = "consenso" | "persona" | "descrizione" | "domande" | "attesa" | "risultati" | "emergenza" | "errore";
type Engine = "ai" | "regole";
type Results = Extract<TriageResponse, { kind: "results" }>;
type RequestBase = Omit<TriageRequest, "answers">;

const MAX_SYMPTOMS = 40;
/** Con il motore a regole i risultati sono immediati: un breve «messa a fuoco» li introduce */
const FOCUS_MS = 900;

function mergeSymptoms(recognized: readonly SymptomId[], extra: readonly SymptomId[], dismissed: readonly SymptomId[]): SymptomId[] {
  const out: SymptomId[] = [];
  for (const s of [...recognized, ...extra]) if (!dismissed.includes(s) && !out.includes(s)) out.push(s);
  return out.slice(0, MAX_SYMPTOMS);
}

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/** Il gruppo di domande a cui appartiene la domanda numero `index` */
function batchOf(starts: readonly number[], index: number): number {
  let b = 0;
  starts.forEach((s, i) => {
    if (s <= index) b = i;
  });
  return b;
}

/**
 * L'intervista sui sintomi: consenso → dati di base → descrizione → domande → risultati.
 * Tutto resta in memoria nel browser. Senza consenso all'AI (o senza chiave sul server) il motore
 * a regole gira qui, senza rete; con il consenso i passi passano da /api/triage. Il controllo dei
 * segnali d'allarme è deterministico e avviene qui a ogni risposta, oltre che sul server.
 */
export function Interview({ conditions }: { conditions: InterviewCondition[] }) {
  const reduced = usePrefersReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [stage, setStage] = useState<Stage>("consenso");
  const [direction, setDirection] = useState<1 | -1>(1);
  // Il primo passo arriva già pronto dal server: si anima solo dopo un'azione della persona
  const [navigated, setNavigated] = useState(false);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [consent, setConsent] = useState<ConsentState>({ terms: false, health: false, ai: false });
  const [profile, setProfile] = useState<ProfileDraft>({ age: null, sex: null, pregnancy: "non-applicabile", guardian: false });

  const [text, setText] = useState("");
  const debouncedText = useDebounced(text, 300);
  const [extra, setExtra] = useState<SymptomId[]>([]);
  const [dismissed, setDismissed] = useState<SymptomId[]>([]);
  const [zones, setZones] = useState<BodyZoneId[]>([]);
  const [describeError, setDescribeError] = useState<string | null>(null);

  const [base, setBase] = useState<RequestBase | null>(null);
  const [asked, setAsked] = useState<Question[]>([]);
  const [batchStarts, setBatchStarts] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [undone, setUndone] = useState<Answer | null>(null);
  const [rulesOnly, setRulesOnly] = useState(false);
  const [waitingFor, setWaitingFor] = useState<"passo" | "risultati">("passo");

  const [result, setResult] = useState<{ data: Results; summary: string; at: Date } | null>(null);
  const [flags, setFlags] = useState<RedFlagId[]>([]);
  const [emergencyFrom, setEmergencyFrom] = useState<"descrizione" | "domande">("descrizione");
  const [error, setError] = useState<string | null>(null);

  const pending = useRef<AbortController | null>(null);
  const focusTimer = useRef<number | null>(null);

  const engine: Engine = aiAvailable === true && consent.ai && !rulesOnly ? "ai" : "regole";

  // Il server dice solo se l'AI è attiva: nessun dato della persona parte da qui
  useEffect(() => {
    const ac = new AbortController();
    void fetchAiAvailability(ac.signal).then((ok) => {
      if (!ac.signal.aborted) setAiAvailable(ok);
    });
    return () => ac.abort();
  }, []);

  useEffect(
    () => () => {
      pending.current?.abort();
      if (focusTimer.current !== null) window.clearTimeout(focusTimer.current);
    },
    [],
  );

  // A ogni nuovo passo: in cima alla pagina e focus sul titolo (le domande gestiscono il proprio)
  useEffect(() => {
    if (!navigated) return;
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [stage, navigated]);

  // Chi sta compilando non perde le risposte per sbaglio; mai però davanti a una chiamata al 112
  const dirty = stage === "persona" || stage === "descrizione" || stage === "domande" || stage === "attesa" || stage === "errore";
  useEffect(() => {
    if (!dirty) return;
    let allowUntil = 0;
    const onClick = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest('a[href^="tel:"]')) allowUntil = Date.now() + 3000;
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Date.now() < allowUntil) return;
      e.preventDefault();
      e.returnValue = "";
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [dirty]);

  const recognized = useMemo(() => recognizeSymptoms(debouncedText).present, [debouncedText]);
  const symptoms = useMemo(() => mergeSymptoms(recognized, extra, dismissed), [recognized, extra, dismissed]);
  const textFlags = useMemo(() => detectRedFlags({ text: debouncedText, symptoms }), [debouncedText, symptoms]);
  const ambiguities = useMemo(() => ambiguousTerms(debouncedText, symptoms), [debouncedText, symptoms]);

  const go = (next: Stage, dir: 1 | -1 = 1) => {
    if (focusTimer.current !== null) window.clearTimeout(focusTimer.current);
    setDirection(dir);
    setNavigated(true);
    setStage(next);
  };

  const showEmergency = (found: RedFlagId[], from: "descrizione" | "domande") => {
    pending.current?.abort();
    setFlags(found);
    setEmergencyFrom(from);
    go("emergenza");
  };

  /* ----------------------------------------------------------- Motore */

  const apply = (step: TriageResponse, req: TriageRequest, via: Engine) => {
    if (step.kind === "emergency") {
      showEmergency(step.flags, req.answers.length ? "domande" : "descrizione");
      return;
    }
    if (step.kind === "questions") {
      const seen = new Set(req.answers.map((a) => a.question.id));
      const fresh = step.questions.filter((q) => !seen.has(q.id)).slice(0, MAX_QUESTIONS - req.answers.length);
      // Mai bloccati: se non arrivano domande nuove si chiude con le regole
      if (fresh.length === 0) {
        apply(rulesResults(conditions, req), req, "regole");
        return;
      }
      setAsked([...req.answers.map((a) => a.question), ...fresh]);
      setBatchStarts((starts) => [...starts.filter((s) => s < req.answers.length), req.answers.length]);
      go("domande");
      return;
    }
    const known = new Set(conditions.map((c) => c.id));
    const data: Results = { ...step, conditions: step.conditions.filter((c) => known.has(c.id)) };
    const at = new Date();
    setResult({ data, summary: buildDoctorSummary(req, data, conditions, at), at });
    if (reduced || via === "ai") {
      go("risultati");
      return;
    }
    setWaitingFor("risultati");
    go("attesa");
    focusTimer.current = window.setTimeout(() => setStage("risultati"), FOCUS_MS);
  };

  const advance = async (req: TriageRequest, via: Engine = engine) => {
    const found = redFlagsFor(req);
    if (found.length) {
      showEmergency(found, req.answers.length ? "domande" : "descrizione");
      return;
    }
    if (via === "regole") {
      apply(rulesStep(conditions, req), req, "regole");
      return;
    }
    // Le domande fisse non hanno bisogno del modello: nessun dato parte finché non servono
    const seen = new Set(req.answers.map((a) => a.question.id));
    const core = CORE_QUESTIONS.filter((q) => !seen.has(q.id));
    if (core.length) {
      apply({ kind: "questions", source: "regole", questions: core }, req, "regole");
      return;
    }
    pending.current?.abort();
    const ac = new AbortController();
    pending.current = ac;
    setWaitingFor(req.answers.length >= MIN_QUESTIONS ? "risultati" : "passo");
    go("attesa");
    try {
      const step = await postTriageStep(req, ac.signal);
      if (!ac.signal.aborted) apply(step, req, "ai");
    } catch (e) {
      if (ac.signal.aborted) return;
      setError(e instanceof TriageRequestError ? e.message : "Qualcosa è andato storto.");
      go("errore");
    }
  };

  /* ----------------------------------------------------------- Azioni */

  const submitDescription = () => {
    const finalSymptoms = mergeSymptoms(recognizeSymptoms(text).present, extra, dismissed);
    if (text.trim().length < 3 && finalSymptoms.length === 0 && zones.length === 0) {
      setDescribeError("Scrivi cosa senti, tocca un sintomo o indica una zona del corpo.");
      return;
    }
    const p = completeProfile(profile);
    if (!p) {
      go("persona", -1);
      return;
    }
    setDescribeError(null);
    const next: RequestBase = { profile: p, text: text.trim().slice(0, MAX_TEXT), symptoms: finalSymptoms, zones };
    setBase(next);
    setAnswers([]);
    setAsked([]);
    setBatchStarts([]);
    setUndone(null);
    void advance({ ...next, answers: [] });
  };

  const answer = (a: Answer) => {
    if (!base) return;
    const next = [...answers, a];
    setAnswers(next);
    setUndone(null);
    const req = { ...base, answers: next };
    // Controllo deterministico dopo ogni risposta, prima di qualsiasi altra cosa
    const found = redFlagsFor(req);
    if (found.length) {
      showEmergency(found, "domande");
      return;
    }
    if (next.length >= asked.length) void advance(req);
  };

  const back = () => {
    pending.current?.abort();
    if (answers.length === 0) {
      go("descrizione", -1);
      return;
    }
    const index = answers.length - 1;
    const last = answers[index] ?? null;
    // Le domande arrivate dopo questa risposta dipendevano da lei: si tolgono
    const b = batchOf(batchStarts, index);
    setAsked(asked.slice(0, batchStarts[b + 1] ?? asked.length));
    setBatchStarts(batchStarts.slice(0, b + 1));
    setAnswers(answers.slice(0, index));
    setUndone(last);
    go("domande", -1);
  };

  const restart = () => {
    pending.current?.abort();
    setText("");
    setExtra([]);
    setDismissed([]);
    setZones([]);
    setBase(null);
    setAsked([]);
    setBatchStarts([]);
    setAnswers([]);
    setUndone(null);
    setResult(null);
    setFlags([]);
    setError(null);
    setRulesOnly(false);
    go("descrizione", -1);
  };

  /* ----------------------------------------------------------- Vista */

  const current = stage === "domande" ? asked[answers.length] : undefined;
  const total = Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, asked.length));
  const young = profile.age !== null && profile.age < 18;

  let view: ReactNode = null;
  switch (stage) {
    case "consenso":
      view = <ConsentStep value={consent} onChange={setConsent} aiAvailable={aiAvailable} onNext={() => go("persona")} headingRef={headingRef} />;
      break;
    case "persona":
      view = (
        <ProfileStep
          value={profile}
          onChange={setProfile}
          onNext={() => go("descrizione")}
          onBack={() => go("consenso", -1)}
          reduced={reduced}
          headingRef={headingRef}
        />
      );
      break;
    case "descrizione":
      view = (
        <DescribeStep
          text={text}
          onText={(t) => {
            setText(t);
            if (describeError) setDescribeError(null);
          }}
          symptoms={symptoms}
          onAddSymptom={(s) => {
            setDismissed((d) => d.filter((x) => x !== s));
            setExtra((e) => (e.includes(s) ? e : [...e, s]));
            setDescribeError(null);
          }}
          onRemoveSymptom={(s) => {
            setExtra((e) => e.filter((x) => x !== s));
            setDismissed((d) => (d.includes(s) ? d : [...d, s]));
          }}
          zones={zones}
          onToggleZone={(z) => {
            setZones((list) => (list.includes(z) ? list.filter((x) => x !== z) : [...list, z]));
            setDescribeError(null);
          }}
          ambiguities={ambiguities}
          flags={textFlags}
          onEmergency={() => showEmergency(textFlags, "descrizione")}
          onNext={submitDescription}
          onBack={() => go("persona", -1)}
          young={young}
          reduced={reduced}
          error={describeError}
          headingRef={headingRef}
        />
      );
      break;
    case "domande":
      view = current ? (
        <QuestionDeck question={current} number={answers.length + 1} total={total} previous={undone} onAnswer={answer} onBack={back} reduced={reduced} />
      ) : null;
      break;
    case "attesa":
      view =
        waitingFor === "risultati" ? (
          <Thinking title="Metto a fuoco le possibilità…" detail="Confronto le tue risposte con le schede di Orienta." reduced={reduced} />
        ) : (
          <Thinking title="Scelgo le domande più utili…" detail="Può richiedere qualche secondo." reduced={reduced} />
        );
      break;
    case "risultati":
      view =
        result && base ? (
          <ResultsView
            result={result.data}
            conditions={conditions}
            age={base.profile.age}
            summary={result.summary}
            generatedAt={result.at}
            onRestart={restart}
            reduced={reduced}
            headingRef={headingRef}
          />
        ) : null;
      break;
    case "emergenza":
      view = (
        <EmergencyPanel
          flags={flags}
          age={profile.age}
          headingRef={headingRef}
          onBack={() => (emergencyFrom === "domande" && answers.length ? back() : go("descrizione", -1))}
        />
      );
      break;
    case "errore":
      view = (
        <div className="space-y-6">
          <StepHeader
            title="Non siamo riusciti a continuare"
            lead={error ?? undefined}
            aside={<TiltIllustration src={offline} sizes="96px" className="w-24" />}
            headingRef={headingRef}
          />
          <p>Le tue risposte sono ancora qui. Puoi riprovare, oppure continuare con il metodo semplificato a regole fisse, che funziona sul tuo dispositivo.</p>
          <div className="grid gap-3">
            <Button size="lg" onClick={() => base && void advance({ ...base, answers }, "ai")} icon={<RotateCw aria-hidden className="size-5" />}>
              Riprova
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setRulesOnly(true);
                if (base) void advance({ ...base, answers }, "regole");
              }}
              icon={<Wrench aria-hidden className="size-5" />}
            >
              Continua con il metodo semplificato
            </Button>
            <Button variant="ghost" onClick={back} icon={<ArrowLeft aria-hidden className="size-5" />}>
              Torna all&apos;ultima domanda
            </Button>
          </div>
        </div>
      );
      break;
  }

  return (
    <motion.div
      key={stage}
      initial={reduced || !navigated ? false : { opacity: 0, x: 28 * direction }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
    >
      {view}
    </motion.div>
  );
}
