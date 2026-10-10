import { useNavigation } from "expo-router";
import { useHeaderHeight, usePreventRemove } from "expo-router/react-navigation";
import { ArrowLeft, RotateCw, Wrench } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type Text } from "react-native";
import Animated, { Easing, FadeInLeft, FadeInRight } from "react-native-reanimated";
import type { RedFlagId } from "@data/emergency/red-flags";
import type { BodyZoneId } from "@data/vocab/body";
import type { SymptomId } from "@data/vocab/symptoms";
import offline from "@/assets/illustrations/stato-offline.webp";
import type { InterviewCondition } from "@/lib/conditions/knowledge-base";
import { TriageRequestError } from "@/lib/triage/client";
import { redFlagsFor, rulesResults, rulesStep } from "@/lib/triage/engine";
import { CORE_QUESTIONS } from "@/lib/triage/questions";
import { ambiguousTerms, recognizeSymptoms } from "@/lib/triage/recognize";
import { detectRedFlags } from "@/lib/triage/red-flags";
import { MAX_QUESTIONS, MIN_QUESTIONS, type Answer, type Question, type TriageRequest, type TriageResponse } from "@/lib/triage/schema";
import { buildDoctorSummary } from "@/lib/triage/summary";
import { EmergencyPanel } from "~/components/emergency/emergency-panel";
import { Button } from "~/components/ui/button";
import { Txt } from "~/components/ui/text";
import { focusLater } from "~/lib/a11y";
import { aiAvailable as checkAiAvailable, postStep } from "~/lib/api";
import { clearSummaryForDoctors } from "~/lib/doctor-handoff";
import { useReducedMotion } from "~/lib/use-reduced-motion";
import { useTheme } from "~/theme/theme";
import { ConsentStep, type ConsentState } from "./consent-step";
import { DescribeFooter, DescribeStep, MAX_TEXT } from "./describe-step";
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
/** Con il motore a regole i risultati sono immediati: una breve «messa a fuoco» li introduce */
const FOCUS_MS = 900;
const STAGE_EASE = Easing.bezier(0.23, 1, 0.32, 1);

function mergeSymptoms(recognized: readonly SymptomId[], extra: readonly SymptomId[], dismissed: readonly SymptomId[]): SymptomId[] {
  const out: SymptomId[] = [];
  for (const s of [...recognized, ...extra]) if (!dismissed.includes(s) && !out.includes(s)) out.push(s);
  return out.slice(0, MAX_SYMPTOMS);
}

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
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

/** Chiede conferma prima di lasciare l'intervista (finestra di sistema; sul web quella del browser) */
function confirmLeave(title: string, message: string, leave: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) leave();
    return;
  }
  Alert.alert(title, message, [
    { text: "Resta", style: "cancel" },
    { text: "Esci", style: "destructive", onPress: leave },
  ]);
}

/**
 * L'intervista sui sintomi: consenso → dati di base → descrizione → domande → risultati, la stessa
 * logica della web app. Tutto resta in memoria sul telefono. Senza consenso all'AI (o senza il
 * servizio configurato) il motore a regole gira qui, senza rete; con il consenso i passi passano
 * da /api/triage della web app. Il controllo dei segnali d'allarme è deterministico e avviene qui a
 * ogni risposta, oltre che sul server.
 */
export function Interview({ conditions }: { conditions: InterviewCondition[] }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const headingRef = useRef<Text>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [stage, setStage] = useState<Stage>("consenso");
  const [direction, setDirection] = useState<1 | -1>(1);
  // Il primo passo compare con la schermata: si anima solo dopo un'azione della persona
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

  const [result, setResult] = useState<{ data: Results; summary: string } | null>(null);
  const [flags, setFlags] = useState<RedFlagId[]>([]);
  const [emergencyFrom, setEmergencyFrom] = useState<"descrizione" | "domande">("descrizione");
  const [error, setError] = useState<string | null>(null);

  const pending = useRef<AbortController | null>(null);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const engine: Engine = aiAvailable === true && consent.ai && !rulesOnly ? "ai" : "regole";

  // Il servizio dice solo se l'AI è attiva: nessun dato della persona parte da qui
  useEffect(() => {
    const ac = new AbortController();
    checkAiAvailable(ac.signal).then(
      (ok) => {
        if (!ac.signal.aborted) setAiAvailable(ok);
      },
      () => {
        if (!ac.signal.aborted) setAiAvailable(false);
      },
    );
    return () => ac.abort();
  }, []);

  useEffect(
    () => () => {
      pending.current?.abort();
      if (focusTimer.current !== null) clearTimeout(focusTimer.current);
    },
    [],
  );

  // A ogni nuovo passo: in cima e lettore di schermo sul titolo (le domande gestiscono il proprio)
  useEffect(() => {
    if (!navigated) return;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    if (stage === "domande") return;
    return focusLater(headingRef);
  }, [stage, navigated]);

  // Ogni nuova domanda riparte dall'alto
  useEffect(() => {
    if (stage === "domande") scrollRef.current?.scrollTo({ y: 0, animated: !reduced });
  }, [stage, answers.length, reduced]);

  // Chi sta compilando non perde le risposte per sbaglio; mai però davanti all'Emergenza
  const dirty = stage === "persona" || stage === "descrizione" || stage === "domande" || stage === "attesa" || stage === "errore" || stage === "risultati";
  usePreventRemove(dirty, ({ data }) => {
    const leave = () => navigation.dispatch(data.action);
    if (stage === "risultati") {
      confirmLeave("Uscire dai risultati?", "Non vengono salvati sul telefono: se ti serve, prima copia o condividi il riepilogo per il medico.", leave);
    } else {
      confirmLeave("Uscire dall'intervista?", "Le risposte date finora si perdono.", leave);
    }
  });

  const recognized = useMemo(() => recognizeSymptoms(debouncedText).present, [debouncedText]);
  const symptoms = useMemo(() => mergeSymptoms(recognized, extra, dismissed), [recognized, extra, dismissed]);
  const textFlags = useMemo(() => detectRedFlags({ text: debouncedText, symptoms }), [debouncedText, symptoms]);
  const ambiguities = useMemo(() => ambiguousTerms(debouncedText, symptoms), [debouncedText, symptoms]);

  const go = (next: Stage, dir: 1 | -1 = 1) => {
    if (focusTimer.current !== null) clearTimeout(focusTimer.current);
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
    setResult({ data, summary: buildDoctorSummary(req, data, conditions, new Date()) });
    if (reduced || via === "ai") {
      go("risultati");
      return;
    }
    setWaitingFor("risultati");
    go("attesa");
    focusTimer.current = setTimeout(() => setStage("risultati"), FOCUS_MS);
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
      const step = await postStep(req, ac.signal);
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
    clearSummaryForDoctors();
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
      view = <ProfileStep value={profile} onChange={setProfile} onNext={() => go("descrizione")} onBack={() => go("consenso", -1)} headingRef={headingRef} />;
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
          onBack={() => go("persona", -1)}
          young={young}
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
          <Thinking title="Metto a fuoco le possibilità…" detail="Confronto le tue risposte con le schede di Orienta." reduced={reduced} headingRef={headingRef} />
        ) : (
          <Thinking title="Scelgo le domande più utili…" detail="Può richiedere qualche secondo." reduced={reduced} headingRef={headingRef} />
        );
      break;
    case "risultati":
      view =
        result && base ? (
          <ResultsView result={result.data} conditions={conditions} age={base.profile.age} summary={result.summary} onRestart={restart} reduced={reduced} headingRef={headingRef} />
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
        <View style={styles.error}>
          <StepHeader title="Non siamo riusciti a continuare" lead={error ?? undefined} image={offline} headingRef={headingRef} />
          <Txt>Le tue risposte sono ancora qui. Puoi riprovare, oppure continuare con il metodo semplificato a regole fisse, che funziona sul tuo telefono.</Txt>
          <View style={styles.errorActions}>
            <Button label="Riprova" icon={RotateCw} size="lg" onPress={() => base && void advance({ ...base, answers }, "ai")} />
            <Button
              label="Continua con il metodo semplificato"
              icon={Wrench}
              variant="secondary"
              size="lg"
              onPress={() => {
                setRulesOnly(true);
                if (base) void advance({ ...base, answers }, "regole");
              }}
            />
            <Button label="Torna all'ultima domanda" icon={ArrowLeft} variant="ghost" onPress={back} />
          </View>
        </View>
      );
      break;
  }

  const entering = reduced || !navigated ? undefined : (direction === 1 ? FadeInRight : FadeInLeft).duration(250).easing(STAGE_EASE);

  return (
    // Con Android da bordo a bordo la finestra non si ridimensiona più sotto la tastiera: «padding» su tutti e due
    <KeyboardAvoidingView style={[styles.fill, { backgroundColor: colors.bg }]} behavior="padding" keyboardVerticalOffset={headerHeight}>
      <ScrollView ref={scrollRef} style={styles.fill} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <Animated.View key={stage} entering={entering}>
          {view}
        </Animated.View>
      </ScrollView>
      {stage === "descrizione" && <DescribeFooter error={describeError} onNext={submitDescription} />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 20, paddingBottom: 48, width: "100%", maxWidth: 640, alignSelf: "center" },
  error: { gap: 24 },
  errorActions: { gap: 12 },
});
