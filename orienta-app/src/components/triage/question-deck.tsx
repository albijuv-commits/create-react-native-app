import { ArrowLeft, Check, CircleHelp, Gauge, ListChecks, ShieldAlert, X, type LucideIcon } from "lucide-react-native";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Pressable, StyleSheet, View, type Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from "react-native-reanimated";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { scheduleOnRN } from "react-native-worklets";
import { RED_FLAG_IDS, RED_FLAGS, type RedFlagId } from "@data/emergency/red-flags";
import type { BodyView, BodyZoneId } from "@data/vocab/body";
import { SYMPTOMS, type SymptomId } from "@data/vocab/symptoms";
import { zonesShapes } from "@/components/body-map/body-shapes";
import { C } from "@/components/slide/palette";
import { NON_SO, type Answer, type Question } from "@/lib/triage/schema";
import { BodyFigure, ZoneShape } from "~/components/body-map/body-figure";
import { motion } from "~/components/slide/motion";
import { Button } from "~/components/ui/button";
import { ProgressBar } from "~/components/ui/progress-bar";
import { Txt } from "~/components/ui/text";
import { focusLater } from "~/lib/a11y";
import { useTheme } from "~/theme/theme";
import { CheckRow, FieldError } from "./parts";

type ExitDir = "left" | "right" | "up" | "down";
type QuestionOf<K extends Question["kind"]> = Extract<Question, { kind: K }>;
type AnswerOf<K extends Answer["kind"]> = Extract<Answer, { kind: K }>;
/** Risponde e fa volare via la carta; false se la risposta è stata ignorata (un doppio tocco) */
type Submit = (answer: Answer, dir: ExitDir) => boolean;

/** Oltre questa distanza (o velocità) il trascinamento vale come risposta, come nella web app */
const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 650;
/** Dopo una risposta, per un attimo i tocchi si ignorano: un doppio tocco non risponde anche alla carta dopo */
const ANSWER_LOCK_MS = 350;
const ENTER = { duration: 280, easing: Easing.bezier(0.23, 1, 0.32, 1) };
const EXIT = { duration: 260, easing: Easing.bezier(0.4, 0, 1, 1) };
const SNAP_BACK = { stiffness: 320, damping: 26 };

const BACK_ONLY = new Set<BodyZoneId>(["nuca", "schiena-alta", "schiena-bassa"]);
const HEAD_ZONES = new Set<BodyZoneId>(["testa", "occhi", "naso", "bocca", "orecchie"]);

/**
 * Il mazzo delle domande: una carta alla volta, con le altre che si intravedono sotto.
 * Le carte sì/no si possono anche trascinare (destra = sì, sinistra = no); ogni risposta fa volare
 * via la carta nella direzione scelta. Con «Riduci movimento» le carte si sostituiscono e basta.
 */
export function QuestionDeck({
  question,
  number,
  total,
  previous,
  onAnswer,
  onBack,
  reduced,
}: {
  question: Question;
  /** Numero della domanda (da 1) e stima del totale per la barra */
  number: number;
  total: number;
  /** La risposta data prima a questa domanda, se si è tornati indietro */
  previous: Answer | null;
  onAnswer: (answer: Answer) => void;
  onBack: () => void;
  reduced: boolean;
}) {
  const { colors } = useTheme();
  const lockedUntil = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  // La prima carta arriva insieme al passo; le altre entrano dopo una risposta o tornando indietro
  const [moved, setMoved] = useState(false);
  const prev = previous && previous.question.id === question.id ? previous : null;

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const tryLock = () => {
    const now = Date.now();
    if (now < lockedUntil.current) return false;
    lockedUntil.current = now + ANSWER_LOCK_MS;
    return true;
  };
  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  };
  const answer = (a: Answer) => {
    setMoved(true);
    onAnswer(a);
  };
  const back = () => {
    setMoved(true);
    onBack();
  };

  return (
    <View style={styles.deck}>
      <View style={styles.top}>
        <Pressable
          role="button"
          accessibilityLabel={number === 1 ? "Torna alla descrizione" : "Domanda precedente"}
          onPress={back}
          style={({ pressed }) => [styles.round, { backgroundColor: colors.surface2, transform: [{ scale: pressed ? 0.94 : 1 }] }]}
        >
          <ArrowLeft color={colors.primary} size={20} />
        </Pressable>
        <View style={styles.progress}>
          <View style={styles.progressText}>
            <Txt variant="small" bold>
              Domanda {number}
            </Txt>
            <Txt variant="small" bold tone="inkMuted">
              da 5 a 12 in tutto
            </Txt>
          </View>
          <ProgressBar value={number - 1} max={total} label="Domande completate" />
        </View>
      </View>

      <View style={styles.stack}>
        {/* Le carte successive che si intravedono sotto */}
        <View aria-hidden style={[styles.under, styles.underFar, { backgroundColor: colors.surface2 }]} />
        <View aria-hidden style={[styles.under, styles.underNear, { backgroundColor: colors.surface, borderColor: colors.line }]} />
        <QuestionCard key={question.id} question={question} previous={prev} tryLock={tryLock} later={later} onAnswer={answer} enter={moved && !reduced} reduced={reduced} />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ Carta */

function QuestionCard({
  question,
  previous,
  tryLock,
  later,
  onAnswer,
  enter,
  reduced,
}: {
  question: Question;
  previous: Answer | null;
  tryLock: () => boolean;
  /** Un timer che il mazzo annulla se sparisce prima che scatti */
  later: (fn: () => void, ms: number) => void;
  onAnswer: (answer: Answer) => void;
  /** Entra con un piccolo movimento (non la prima carta del passo) */
  enter: boolean;
  reduced: boolean;
}) {
  const { colors } = useTheme();
  const titleRef = useRef<Text>(null);
  const [leaving, setLeaving] = useState(false);
  const [entering] = useState(enter);
  const x = useSharedValue(0);
  const y = useSharedValue(entering ? 28 : 0);
  const scale = useSharedValue(entering ? 0.97 : 1);
  const opacity = useSharedValue(entering ? 0 : 1);

  useEffect(() => {
    if (!entering) return;
    y.set(withTiming(0, ENTER));
    scale.set(withTiming(1, ENTER));
    opacity.set(withTiming(1, ENTER));
  }, [entering, y, scale, opacity]);

  // Il lettore di schermo legge subito la nuova domanda
  useEffect(() => focusLater(titleRef), []);

  const submit: Submit = (answer, dir) => {
    if (!tryLock()) return false;
    setLeaving(true);
    if (reduced) {
      onAnswer(answer);
      return true;
    }
    if (dir === "left" || dir === "right") x.set(withTiming(dir === "right" ? 420 : -420, EXIT));
    else y.set(withTiming(dir === "down" ? 56 : -40, EXIT));
    if (dir === "up") scale.set(withTiming(0.98, EXIT));
    opacity.set(withTiming(0, EXIT));
    later(() => onAnswer(answer), EXIT.duration);
    return true;
  };

  const swipe = (value: "si" | "no") => {
    if (!submit({ kind: "yesno", question, value }, value === "si" ? "right" : "left")) x.set(withSpring(0, SNAP_BACK));
  };
  const pan = Gesture.Pan()
    .enabled(question.kind === "yesno" && !reduced && !leaving)
    .activeOffsetX([-12, 12])
    .failOffsetY([-16, 16])
    .onUpdate((e) => {
      x.set(e.translationX);
    })
    .onEnd((e, success) => {
      if (success && (e.translationX > SWIPE_DISTANCE || e.velocityX > SWIPE_VELOCITY)) scheduleOnRN(swipe, "si");
      else if (success && (e.translationX < -SWIPE_DISTANCE || e.velocityX < -SWIPE_VELOCITY)) scheduleOnRN(swipe, "no");
      else x.set(withSpring(0, SNAP_BACK));
    });

  const style = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [
      { translateX: x.get() },
      { translateY: y.get() },
      { rotate: `${interpolate(x.get(), [-220, 220], [-12, 12], Extrapolation.CLAMP)}deg` },
      { scale: scale.get() },
    ],
  }));

  const card = (
    <Animated.View
      aria-hidden={leaving}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.line, shadowColor: colors.ink, pointerEvents: leaving ? "none" : "auto" },
        question.kind === "yesno" && styles.tall,
        style,
      ]}
    >
      {question.kind === "yesno" && (
        <YesNoBody question={question} previous={previous?.kind === "yesno" ? previous : null} submit={submit} x={x} reduced={reduced} titleRef={titleRef} />
      )}
      {question.kind === "choice" && <ChoiceBody question={question} previous={previous?.kind === "choice" ? previous : null} submit={submit} reduced={reduced} titleRef={titleRef} />}
      {question.kind === "scale" && <ScaleBody question={question} previous={previous?.kind === "scale" ? previous : null} submit={submit} reduced={reduced} titleRef={titleRef} />}
      {question.kind === "redflags" && <RedFlagsBody question={question} previous={previous?.kind === "redflags" ? previous : null} submit={submit} titleRef={titleRef} />}
    </Animated.View>
  );

  return question.kind === "yesno" ? <GestureDetector gesture={pan}>{card}</GestureDetector> : card;
}

function Kicker({ icon: Icon, children, tone = "accent" }: { icon: LucideIcon; children: string; tone?: "accent" | "red" }) {
  const { colors } = useTheme();
  return (
    <View style={styles.kicker}>
      <Icon color={colors[tone]} size={16} />
      <Txt variant="small" bold tone={tone}>
        {children}
      </Txt>
    </View>
  );
}

function QuestionTitle({ titleRef, children }: { titleRef: RefObject<Text | null>; children: string }) {
  return (
    <Txt ref={titleRef} variant="title" header>
      {children}
    </Txt>
  );
}

function PreviousNote({ children }: { children: string }) {
  return (
    <Txt variant="small" bold tone="inkMuted">
      Prima avevi risposto: {children}
    </Txt>
  );
}

/* ------------------------------------------------------------------ Sì / No */

function YesNoBody({
  question,
  previous,
  submit,
  x,
  reduced,
  titleRef,
}: {
  question: QuestionOf<"yesno">;
  previous: AnswerOf<"yesno"> | null;
  submit: Submit;
  x: SharedValue<number>;
  reduced: boolean;
  titleRef: RefObject<Text | null>;
}) {
  const { colors } = useTheme();
  const yesStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.get(), [24, SWIPE_DISTANCE], [0, 1], Extrapolation.CLAMP) }));
  const noStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.get(), [-SWIPE_DISTANCE, -24], [1, 0], Extrapolation.CLAMP) }));
  const answer = (value: AnswerOf<"yesno">["value"]) => submit({ kind: "yesno", question, value }, value === "si" ? "right" : value === "no" ? "left" : "down");

  return (
    <>
      {!reduced && (
        <>
          <Animated.View aria-hidden style={[styles.stamp, styles.stampYes, { borderColor: colors.primary }, yesStyle]}>
            <Txt variant="title" tone="primary">
              Sì
            </Txt>
          </Animated.View>
          <Animated.View aria-hidden style={[styles.stamp, styles.stampNo, { borderColor: colors.inkMuted }, noStyle]}>
            <Txt variant="title" tone="inkMuted">
              No
            </Txt>
          </Animated.View>
        </>
      )}
      <View style={styles.head}>
        <Kicker icon={CircleHelp}>{reduced ? "Rispondi" : "Rispondi o trascina la carta"}</Kicker>
        <QuestionTitle titleRef={titleRef}>{question.text}</QuestionTitle>
        {previous && <PreviousNote>{previous.value === "si" ? "sì" : previous.value === "no" ? "no" : "non so"}</PreviousNote>}
      </View>
      <View style={styles.figure}>
        <SymptomFigure symptomId={question.symptomId} />
      </View>
      {!reduced && (
        <Txt variant="small" tone="inkMuted" aria-hidden style={styles.dragHint}>
          Trascina a destra per Sì, a sinistra per No.
        </Txt>
      )}
      <View style={styles.answers}>
        <AnswerButton label="No" icon={X} look="outline" active={previous?.value === "no"} onPress={() => answer("no")} />
        <AnswerButton label="Non so" look="subtle" active={previous?.value === NON_SO} onPress={() => answer(NON_SO)} />
        <AnswerButton label="Sì" icon={Check} look="strong" active={previous?.value === "si"} onPress={() => answer("si")} />
      </View>
    </>
  );
}

function AnswerButton({
  label,
  onPress,
  active,
  icon: Icon,
  look,
}: {
  label: string;
  onPress: () => void;
  /** La risposta data prima, se si è tornati indietro */
  active: boolean;
  icon?: LucideIcon;
  look: "strong" | "subtle" | "outline";
}) {
  const { colors } = useTheme();
  const tone = {
    strong: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    subtle: { bg: colors.surface2, fg: colors.ink, border: colors.surface2 },
    outline: { bg: colors.surface, fg: colors.primary, border: colors.primary },
  }[look];
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.answer,
        { backgroundColor: tone.bg, borderColor: active ? colors.accent : tone.border, borderWidth: active ? 4 : 2, transform: [{ scale: pressed ? 0.96 : 1 }] },
      ]}
    >
      {Icon && <Icon color={tone.fg} size={20} strokeWidth={2.4} />}
      <Txt bold style={{ color: tone.fg }}>
        {label}
      </Txt>
    </Pressable>
  );
}

/** Dove si sente il sintomo: la sagoma con le zone accese (ingrandita sulla testa per il viso) */
function SymptomFigure({ symptomId }: { symptomId: SymptomId | null }) {
  const { colors } = useTheme();
  const zones: readonly BodyZoneId[] = symptomId ? (SYMPTOMS.find((s) => s.id === symptomId)?.zones ?? []) : [];
  if (zones.length === 0) {
    return (
      <View aria-hidden style={[styles.help, { backgroundColor: colors.primarySoft }]}>
        <CircleHelp color={colors.primary} size={48} />
      </View>
    );
  }
  const view: BodyView = zones.every((z) => BACK_ONLY.has(z)) ? "retro" : "fronte";
  const headOnly = zones.every((z) => HEAD_ZONES.has(z));
  const lit = zonesShapes(view, zones);
  return (
    <View aria-hidden style={headOnly ? styles.figureHead : styles.figureBody}>
      <Svg viewBox={headOnly ? "27 0 46 44" : "-4 -2 108 204"} width="100%" height="100%">
        <BodyFigure view={view} />
        {lit.map((shape, i) => (
          <ZoneShape key={i} shape={shape} fill={C.tissueInflamed} fillOpacity={0.9} stroke={C.highlight} strokeWidth={headOnly ? 0.6 : 1.2} />
        ))}
      </Svg>
    </View>
  );
}

/* ------------------------------------------------------------------ Scelta */

function ChoiceBody({
  question,
  previous,
  submit,
  reduced,
  titleRef,
}: {
  question: QuestionOf<"choice">;
  previous: AnswerOf<"choice"> | null;
  submit: Submit;
  reduced: boolean;
  titleRef: RefObject<Text | null>;
}) {
  const { colors } = useTheme();
  const [picked, setPicked] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );
  const options = [...question.options, { id: NON_SO, label: "Non so" }];
  const pick = (value: string) => {
    if (picked) return;
    setPicked(value);
    // Un attimo per vedere la scelta evidenziata prima che la carta voli via
    timer.current = setTimeout(
      () => {
        if (!submit({ kind: "choice", question, value }, "up")) setPicked(null);
      },
      reduced ? 0 : 160,
    );
  };

  return (
    <View style={styles.body}>
      <Kicker icon={ListChecks}>Scegli una risposta</Kicker>
      <QuestionTitle titleRef={titleRef}>{question.text}</QuestionTitle>
      {previous && <PreviousNote>{options.find((o) => o.id === previous.value)?.label.toLowerCase() ?? "non so"}</PreviousNote>}
      <View style={styles.options}>
        {options.map((o) => {
          const selected = picked === o.id;
          const before = !picked && previous?.value === o.id;
          return (
            <Pressable
              key={o.id}
              role="button"
              accessibilityLabel={o.label}
              accessibilityState={{ selected: selected || before }}
              onPress={() => pick(o.id)}
              style={({ pressed }) => [
                styles.option,
                {
                  borderColor: selected ? colors.primary : before ? colors.accent : colors.line,
                  backgroundColor: selected ? colors.primary : before ? colors.accentSoft : colors.surface,
                  borderStyle: o.id === NON_SO && !selected ? "dashed" : "solid",
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <View style={[styles.radio, selected ? { borderColor: colors.onPrimary, backgroundColor: colors.onPrimary } : { borderColor: colors.inkMuted }]}>
                {selected && <Check color={colors.primary} size={16} strokeWidth={3} />}
              </View>
              <Txt bold style={[styles.flex, { color: selected ? colors.onPrimary : colors.ink }]}>
                {o.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ Scala 0-10 */

function intensityWord(v: number): string {
  if (v === 0) return "Nessun fastidio";
  if (v <= 3) return "Lieve";
  if (v <= 6) return "Moderato";
  if (v <= 8) return "Forte";
  return "Fortissimo";
}

const SCALE_ROWS = [
  [0, 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
] as const;

function ScaleBody({
  question,
  previous,
  submit,
  reduced,
  titleRef,
}: {
  question: QuestionOf<"scale">;
  previous: AnswerOf<"scale"> | null;
  submit: Submit;
  reduced: boolean;
  titleRef: RefObject<Text | null>;
}) {
  const { colors } = useTheme();
  const [value, setValue] = useState<number | null>(previous && previous.value !== NON_SO ? previous.value : null);
  const [tried, setTried] = useState(false);

  return (
    <View style={styles.body}>
      <Kicker icon={Gauge}>Scegli un numero</Kicker>
      <QuestionTitle titleRef={titleRef}>{question.text}</QuestionTitle>
      {previous && <PreviousNote>{previous.value === NON_SO ? "non so" : `${previous.value} su 10`}</PreviousNote>}

      <Dial value={value} reduced={reduced} />

      <View role="radiogroup" accessibilityLabel={question.text} style={styles.scale}>
        {SCALE_ROWS.map((row, r) => (
          <View key={r} style={styles.scaleRow}>
            {row.map((n) => {
              const checked = value === n;
              return (
                <Pressable
                  key={n}
                  role="radio"
                  accessibilityLabel={`${n}: ${intensityWord(n).toLowerCase()}`}
                  accessibilityState={{ checked }}
                  onPress={() => {
                    setValue(n);
                    setTried(false);
                  }}
                  style={({ pressed }) => [
                    styles.scaleCell,
                    { borderColor: checked ? colors.primary : colors.line, backgroundColor: checked ? colors.primary : colors.surface, transform: [{ scale: pressed ? 0.94 : 1 }] },
                  ]}
                >
                  <Txt variant="heading" style={[styles.tabular, { color: checked ? colors.onPrimary : colors.ink }]}>
                    {n}
                  </Txt>
                </Pressable>
              );
            })}
            {/* La seconda riga ha una casella in meno: lo spazio vuoto tiene le colonne allineate */}
            {row.length < 6 && <View style={styles.scaleSpacer} />}
          </View>
        ))}
        <View aria-hidden style={styles.scaleEnds}>
          <Txt variant="small" tone="inkMuted">
            0 = per niente
          </Txt>
          <Txt variant="small" tone="inkMuted">
            10 = il massimo
          </Txt>
        </View>
      </View>

      {tried && value === null && <FieldError>Scegli un numero, oppure tocca «Non so».</FieldError>}
      <View style={styles.twoButtons}>
        <Button label="Non so" variant="secondary" size="lg" style={styles.flex} onPress={() => submit({ kind: "scale", question, value: NON_SO }, "down")} />
        <Button
          label="Conferma"
          size="lg"
          style={styles.flex}
          onPress={() => {
            if (value === null) setTried(true);
            else submit({ kind: "scale", question, value }, "up");
          }}
        />
      </View>
    </View>
  );
}

const ARC = "M20 100 A80 80 0 0 1 180 100";
const ARC_LENGTH = Math.PI * 80;

/** Il quadrante dell'intensità: l'arco si riempie e la lancetta segue il numero scelto */
function Dial({ value, reduced }: { value: number | null; reduced: boolean }) {
  const { colors } = useTheme();
  const v = value ?? 0;
  const transition = reduced ? { duration: 0 } : { duration: 0.38, ease: [0.23, 1, 0.32, 1] as const };
  return (
    <View aria-hidden style={styles.dial}>
      <View style={styles.dialArt}>
        <Svg viewBox="0 0 200 116" width="100%" height="100%">
          <Path d={ARC} fill="none" stroke={colors.surface2} strokeWidth={16} strokeLinecap="round" />
          <motion.path
            d={ARC}
            fill="none"
            stroke={colors.accent}
            strokeWidth={16}
            strokeLinecap="round"
            length={ARC_LENGTH}
            animate={{ pathLength: v / 10, opacity: value === null || value === 0 ? 0 : 1 }}
            transition={transition}
          />
          <motion.g pivot={[100, 100]} animate={{ rotate: value === null ? -90 : -90 + v * 18, opacity: value === null ? 0.25 : 1 }} transition={transition}>
            <Line x1={100} y1={100} x2={100} y2={34} stroke={colors.ink} strokeWidth={5} strokeLinecap="round" />
          </motion.g>
          <Circle cx={100} cy={100} r={9} fill={colors.ink} />
        </Svg>
      </View>
      <Txt variant="display" style={styles.tabular}>
        {value ?? "–"}
      </Txt>
      <Txt variant="small" bold tone="inkMuted">
        {value === null ? "Tocca un numero" : intensityWord(v)}
      </Txt>
    </View>
  );
}

/* ------------------------------------------------------------- Segnali d'allarme */

function RedFlagsBody({
  question,
  previous,
  submit,
  titleRef,
}: {
  question: QuestionOf<"redflags">;
  previous: AnswerOf<"redflags"> | null;
  submit: Submit;
  titleRef: RefObject<Text | null>;
}) {
  const [checked, setChecked] = useState<RedFlagId[]>(previous ? [...previous.value] : []);
  const toggle = (id: RedFlagId, on: boolean) => setChecked((c) => (on ? [...c, id] : c.filter((x) => x !== id)));

  return (
    <View style={styles.body}>
      <Kicker icon={ShieldAlert} tone="red">
        Controllo di sicurezza
      </Kicker>
      <QuestionTitle titleRef={titleRef}>{question.text}</QuestionTitle>
      <Txt variant="small" tone="inkMuted">
        Spunta quelli che hai adesso, anche se ti sembrano passeggeri.
      </Txt>
      <View style={styles.options}>
        {RED_FLAG_IDS.map((id) => (
          <CheckRow key={id} tone="red" checked={checked.includes(id)} onChange={(on) => toggle(id, on)} label={RED_FLAGS[id].checklist} />
        ))}
      </View>
      <Txt variant="small">
        <Txt variant="small" bold>
          Se non sei sicuro, chiama il 112:
        </Txt>{" "}
        l&apos;operatore ti aiuta a capire cosa fare.
      </Txt>
      <Button
        label={checked.length ? "Ho almeno uno di questi segnali" : "Nessuno di questi"}
        variant={checked.length ? "danger" : "primary"}
        size="lg"
        onPress={() => submit({ kind: "redflags", question, value: RED_FLAG_IDS.filter((id) => checked.includes(id)) }, "up")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  deck: { gap: 20, paddingTop: 8 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  progress: { flex: 1, gap: 6 },
  progressText: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  stack: { paddingBottom: 16 },
  under: { position: "absolute", borderRadius: 24 },
  underFar: { left: 24, right: 24, top: 24, bottom: 0 },
  underNear: { left: 12, right: 12, top: 12, bottom: 8, borderWidth: 1 },
  card: {
    gap: 16,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  tall: { minHeight: 368 },
  head: { gap: 12 },
  body: { gap: 16 },
  kicker: { flexDirection: "row", alignItems: "center", gap: 8 },
  stamp: { position: "absolute", top: 20, zIndex: 2, borderWidth: 4, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 2 },
  stampYes: { right: 20, transform: [{ rotate: "8deg" }] },
  stampNo: { left: 20, transform: [{ rotate: "-8deg" }] },
  figure: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  help: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  figureHead: { width: 128, height: 128 },
  figureBody: { height: 160, width: (160 * 108) / 204 },
  dragHint: { textAlign: "center" },
  answers: { flexDirection: "row", gap: 8 },
  answer: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 56, borderRadius: 16, paddingHorizontal: 8 },
  options: { gap: 8 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, borderWidth: 2, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
  dial: { alignItems: "center" },
  dialArt: { width: "100%", maxWidth: 256, aspectRatio: 200 / 116 },
  tabular: { fontVariant: ["tabular-nums"], textAlign: "center" },
  scale: { gap: 8 },
  scaleRow: { flexDirection: "row", gap: 8 },
  scaleCell: { flex: 1, minHeight: 48, borderWidth: 2, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  scaleSpacer: { flex: 1 },
  scaleEnds: { flexDirection: "row", justifyContent: "space-between" },
  twoButtons: { flexDirection: "row", gap: 8 },
});
