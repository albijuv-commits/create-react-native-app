"use client";

import { ArrowLeft, Check, CircleHelp, Gauge, ListChecks, ShieldAlert, X } from "lucide-react";
import { AnimatePresence, motion, useIsPresent, useMotionValue, useTransform, type PanInfo, type Variants } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { RED_FLAG_IDS, RED_FLAGS, type RedFlagId } from "@data/emergency/red-flags";
import type { BodyView, BodyZoneId } from "@data/vocab/body";
import { SYMPTOMS, type SymptomId } from "@data/vocab/symptoms";
import { BodyFigure, ZoneShape, zonesShapes } from "@/components/body-map/body-figure";
import { C } from "@/components/slide/palette";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";
import { NON_SO, type Answer, type Question } from "@/lib/triage/schema";

type ExitDir = "left" | "right" | "up" | "down";
type QuestionOf<K extends Question["kind"]> = Extract<Question, { kind: K }>;
type AnswerOf<K extends Answer["kind"]> = Extract<Answer, { kind: K }>;

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
/** Oltre questa distanza (o velocità) il trascinamento vale come risposta */
const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 650;
/** Dopo una risposta, per un attimo i tocchi si ignorano: un doppio tocco non risponde anche alla carta dopo */
const ANSWER_LOCK_MS = 350;

const BACK_ONLY = new Set<BodyZoneId>(["nuca", "schiena-alta", "schiena-bassa"]);
const HEAD_ZONES = new Set<BodyZoneId>(["testa", "occhi", "naso", "bocca", "orecchie"]);

const cardVariants: Variants = {
  enter: { opacity: 0, y: 28, scale: 0.97 },
  center: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: EASE_OUT } },
  exit: (dir: ExitDir) => ({
    ...(dir === "right" ? { x: 420 } : dir === "left" ? { x: -420 } : dir === "down" ? { y: 56 } : { y: -40, scale: 0.98 }),
    opacity: 0,
    transition: { duration: 0.26, ease: [0.4, 0, 1, 1] },
  }),
};
const staticVariants: Variants = { enter: { opacity: 1 }, center: { opacity: 1 }, exit: { opacity: 0, transition: { duration: 0 } } };

/** Porta il focus sul titolo della carta appena compare, così il lettore di schermo legge la domanda */
function focusOnMount(el: HTMLElement | null) {
  el?.focus({ preventScroll: true });
}

/**
 * Il mazzo delle domande: una carta alla volta, con le altre che si intravedono sotto.
 * Le carte sì/no si possono anche trascinare (destra = sì, sinistra = no); ogni risposta
 * fa volare via la carta nella direzione scelta. Con meno movimento le carte si sostituiscono e basta.
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
  const [exit, setExit] = useState<ExitDir>("up");
  const lockedUntil = useRef(0);

  const submit = useCallback(
    (answer: Answer, dir: ExitDir) => {
      const now = performance.now();
      if (now < lockedUntil.current) return;
      lockedUntil.current = now + ANSWER_LOCK_MS;
      setExit(dir);
      onAnswer(answer);
    },
    [onAnswer],
  );

  const variants = reduced ? staticVariants : cardVariants;
  const prev = previous && previous.question.id === question.id ? previous : null;

  return (
    <div className="space-y-5 pt-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={number === 1 ? "Torna alla descrizione" : "Domanda precedente"}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 text-primary transition-transform duration-150 ease-out active:scale-[0.94]"
        >
          <ArrowLeft aria-hidden className="size-5" />
        </button>
        <div className="flex-1 space-y-1.5">
          <p className="flex justify-between text-small font-bold">
            <span>Domanda {number}</span>
            <span className="text-ink-muted">da 5 a 12 in tutto</span>
          </p>
          <ProgressBar value={number - 1} max={total} label="Domande completate" />
        </div>
      </div>

      <div className="relative pb-4">
        {/* Le carte successive che si intravedono sotto */}
        <div aria-hidden className="absolute inset-x-6 bottom-0 top-6 rounded-3xl bg-surface-2" />
        <div aria-hidden className="absolute inset-x-3 bottom-2 top-3 rounded-3xl border border-line bg-surface" />
        <AnimatePresence mode="popLayout" initial={false} custom={exit}>
          {question.kind === "yesno" ? (
            <YesNoCard key={question.id} question={question} previous={prev?.kind === "yesno" ? prev : null} onAnswer={submit} variants={variants} reduced={reduced} />
          ) : (
            <Card key={question.id} variants={variants}>
              {question.kind === "choice" && <ChoiceBody question={question} previous={prev?.kind === "choice" ? prev : null} onAnswer={submit} reduced={reduced} />}
              {question.kind === "scale" && <ScaleBody question={question} previous={prev?.kind === "scale" ? prev : null} onAnswer={submit} reduced={reduced} />}
              {question.kind === "redflags" && <RedFlagsBody question={question} previous={prev?.kind === "redflags" ? prev : null} onAnswer={submit} />}
            </Card>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Carte */

const cardClass = "relative z-10 rounded-3xl border border-line bg-surface p-5 shadow-[0_10px_30px_-12px_rgb(26_27_46/0.25)]";

function Card({ variants, children }: { variants: Variants; children: ReactNode }) {
  const present = useIsPresent();
  return (
    <motion.div variants={variants} initial="enter" animate="center" exit="exit" inert={!present} className={cardClass}>
      {children}
    </motion.div>
  );
}

function Kicker({ icon, children, tone = "primary" }: { icon: ReactNode; children: ReactNode; tone?: "primary" | "red" }) {
  return (
    <p className={cn("flex items-center gap-2 text-small font-bold", tone === "red" ? "text-red" : "text-accent")}>
      {icon}
      {children}
    </p>
  );
}

function QuestionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h1 id={id} ref={focusOnMount} tabIndex={-1} className="text-title font-bold outline-none">
      {children}
    </h1>
  );
}

function PreviousNote({ children }: { children: ReactNode }) {
  return <p className="text-small font-bold text-ink-muted">Prima avevi risposto: {children}</p>;
}

/* ------------------------------------------------------------------ Sì / No */

function YesNoCard({
  question,
  previous,
  onAnswer,
  variants,
  reduced,
}: {
  question: QuestionOf<"yesno">;
  previous: AnswerOf<"yesno"> | null;
  onAnswer: (answer: Answer, dir: ExitDir) => void;
  variants: Variants;
  reduced: boolean;
}) {
  const present = useIsPresent();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-12, 12]);
  const yes = useTransform(x, [24, SWIPE_DISTANCE], [0, 1]);
  const no = useTransform(x, [-SWIPE_DISTANCE, -24], [1, 0]);
  const titleId = `domanda-${question.id}`;
  const answer = (value: AnswerOf<"yesno">["value"]) =>
    onAnswer({ kind: "yesno", question, value }, value === "si" ? "right" : value === "no" ? "left" : "down");

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { x: dx } = info.offset;
    const { x: vx } = info.velocity;
    if (dx > SWIPE_DISTANCE || vx > SWIPE_VELOCITY) answer("si");
    else if (dx < -SWIPE_DISTANCE || vx < -SWIPE_VELOCITY) answer("no");
  };

  return (
    <motion.div
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      inert={!present}
      style={reduced ? undefined : { x, rotate }}
      drag={reduced || !present ? false : "x"}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={onDragEnd}
      className={cn(cardClass, "flex min-h-[23rem] flex-col", !reduced && "cursor-grab touch-pan-y active:cursor-grabbing")}
    >
      {!reduced && (
        <>
          <motion.span
            aria-hidden
            style={{ opacity: yes }}
            className="pointer-events-none absolute right-5 top-5 rotate-[8deg] rounded-xl border-4 border-primary px-3 py-0.5 text-title font-bold text-primary"
          >
            Sì
          </motion.span>
          <motion.span
            aria-hidden
            style={{ opacity: no }}
            className="pointer-events-none absolute left-5 top-5 -rotate-[8deg] rounded-xl border-4 border-ink-muted px-3 py-0.5 text-title font-bold text-ink-muted"
          >
            No
          </motion.span>
        </>
      )}
      <div className="space-y-3 select-none">
        <Kicker icon={<CircleHelp aria-hidden className="size-4" />}>{reduced ? "Rispondi" : "Rispondi o trascina la carta"}</Kicker>
        <QuestionTitle id={titleId}>{question.text}</QuestionTitle>
        {previous && <PreviousNote>{previous.value === "si" ? "sì" : previous.value === "no" ? "no" : "non so"}</PreviousNote>}
      </div>
      <div className="flex flex-1 items-center justify-center py-4 select-none">
        <SymptomFigure symptomId={question.symptomId} />
      </div>
      {!reduced && <p className="pb-3 text-center text-small text-ink-muted select-none">Trascina a destra per Sì, a sinistra per No.</p>}
      <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby={titleId}>
        <AnswerButton onClick={() => answer("no")} active={previous?.value === "no"} icon={<X aria-hidden className="size-5" />}>
          No
        </AnswerButton>
        <AnswerButton onClick={() => answer(NON_SO)} active={previous?.value === NON_SO} subtle>
          Non so
        </AnswerButton>
        <AnswerButton onClick={() => answer("si")} active={previous?.value === "si"} icon={<Check aria-hidden className="size-5" />} strong>
          Sì
        </AnswerButton>
      </div>
    </motion.div>
  );
}

function AnswerButton({
  onClick,
  active,
  icon,
  strong,
  subtle,
  children,
}: {
  onClick: () => void;
  active: boolean;
  icon?: ReactNode;
  strong?: boolean;
  subtle?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-14 items-center justify-center gap-1.5 rounded-2xl px-2 font-bold",
        "transition-[color,background-color,border-color,transform,filter] duration-150 ease-out active:scale-[0.96]",
        strong ? "bg-primary text-on-primary hover:brightness-110" : subtle ? "bg-surface-2 text-ink hover:bg-primary-soft" : "border-2 border-primary bg-surface text-primary hover:bg-primary-soft",
        active && "ring-4 ring-accent/40 ring-offset-2 ring-offset-surface",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/** Dove si sente il sintomo: la sagoma con le zone accese (ingrandita sulla testa per il viso) */
function SymptomFigure({ symptomId }: { symptomId: SymptomId | null }) {
  const zones: readonly BodyZoneId[] = symptomId ? (SYMPTOMS.find((s) => s.id === symptomId)?.zones ?? []) : [];
  if (zones.length === 0) {
    return (
      <span aria-hidden className="grid size-24 place-items-center rounded-full bg-primary-soft text-primary">
        <CircleHelp className="size-12" />
      </span>
    );
  }
  const back = zones.every((z) => BACK_ONLY.has(z));
  const view: BodyView = back ? "retro" : "fronte";
  const headOnly = zones.every((z) => HEAD_ZONES.has(z));
  const lit = zonesShapes(view, zones);
  return (
    <svg aria-hidden viewBox={headOnly ? "27 0 46 44" : "-4 -2 108 204"} className={headOnly ? "size-32" : "h-40 w-auto"}>
      <BodyFigure view={view} />
      {lit.map((shape, i) => (
        <ZoneShape key={i} shape={shape} fill={C.tissueInflamed} fillOpacity={0.9} stroke={C.highlight} strokeWidth={headOnly ? 0.6 : 1.2} />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ Scelta */

function ChoiceBody({
  question,
  previous,
  onAnswer,
  reduced,
}: {
  question: QuestionOf<"choice">;
  previous: AnswerOf<"choice"> | null;
  onAnswer: (answer: Answer, dir: ExitDir) => void;
  reduced: boolean;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );
  const titleId = `domanda-${question.id}`;
  const pick = (value: string) => {
    if (picked) return;
    setPicked(value);
    // Un attimo per vedere la scelta evidenziata prima che la carta voli via
    timer.current = window.setTimeout(() => onAnswer({ kind: "choice", question, value }, "up"), reduced ? 0 : 160);
  };
  const options = [...question.options, { id: NON_SO, label: "Non so" }];

  return (
    <div className="space-y-4">
      <Kicker icon={<ListChecks aria-hidden className="size-4" />}>Scegli una risposta</Kicker>
      <QuestionTitle id={titleId}>{question.text}</QuestionTitle>
      {previous && <PreviousNote>{options.find((o) => o.id === previous.value)?.label.toLowerCase() ?? "non so"}</PreviousNote>}
      <div role="group" aria-labelledby={titleId} className="space-y-2">
        {options.map((o) => {
          const selected = picked === o.id;
          const before = !picked && previous?.value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => pick(o.id)}
              className={cn(
                "flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold",
                "transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.98]",
                selected ? "border-primary bg-primary text-on-primary" : before ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-primary",
                o.id === NON_SO && !selected && "border-dashed",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border-2",
                  selected ? "border-on-primary bg-on-primary text-primary" : "border-current opacity-60",
                )}
              >
                {selected && <Check className="size-4" />}
              </span>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
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

function ScaleBody({
  question,
  previous,
  onAnswer,
  reduced,
}: {
  question: QuestionOf<"scale">;
  previous: AnswerOf<"scale"> | null;
  onAnswer: (answer: Answer, dir: ExitDir) => void;
  reduced: boolean;
}) {
  const [value, setValue] = useState<number | null>(previous && previous.value !== NON_SO ? previous.value : null);
  const [tried, setTried] = useState(false);
  const titleId = `domanda-${question.id}`;
  const name = `scala-${question.id}`;

  return (
    <div className="space-y-4">
      <Kicker icon={<Gauge aria-hidden className="size-4" />}>Scegli un numero</Kicker>
      <QuestionTitle id={titleId}>{question.text}</QuestionTitle>
      {previous && <PreviousNote>{previous.value === NON_SO ? "non so" : `${previous.value} su 10`}</PreviousNote>}

      <Dial value={value} reduced={reduced} />

      <fieldset aria-labelledby={titleId}>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 11 }, (_, n) => (
            <label
              key={n}
              className={cn(
                "relative grid min-h-12 cursor-pointer place-items-center rounded-2xl border-2 text-heading font-bold tabular-nums",
                "transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.94]",
                "has-checked:border-primary has-checked:bg-primary has-checked:text-on-primary",
                "has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus",
                "border-line bg-surface hover:border-primary",
              )}
            >
              <input
                type="radio"
                name={name}
                value={n}
                checked={value === n}
                onChange={() => {
                  setValue(n);
                  setTried(false);
                }}
                className="sr-only"
              />
              {n}
              <span className="sr-only">: {intensityWord(n).toLowerCase()}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 flex justify-between text-small text-ink-muted" aria-hidden>
          <span>0 = per niente</span>
          <span>10 = il massimo</span>
        </p>
      </fieldset>

      {tried && value === null && (
        <p role="alert" className="text-small font-bold text-red">
          Scegli un numero, oppure tocca «Non so».
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="lg" className="whitespace-nowrap border-dashed" onClick={() => onAnswer({ kind: "scale", question, value: NON_SO }, "down")}>
          Non so
        </Button>
        <Button
          size="lg"
          onClick={() => {
            if (value === null) setTried(true);
            else onAnswer({ kind: "scale", question, value }, "up");
          }}
        >
          Conferma
        </Button>
      </div>
    </div>
  );
}

/** Il quadrante dell'intensità: l'arco si riempie e la lancetta segue il numero scelto */
function Dial({ value, reduced }: { value: number | null; reduced: boolean }) {
  const v = value ?? 0;
  const transition = reduced ? "none" : "transform 380ms cubic-bezier(0.23, 1, 0.32, 1), stroke-dashoffset 380ms cubic-bezier(0.23, 1, 0.32, 1)";
  return (
    <div className="flex flex-col items-center" aria-hidden>
      <svg viewBox="0 0 200 116" className="w-full max-w-64">
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="var(--surface-2)" strokeWidth="16" strokeLinecap="round" />
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="16"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - v / 10}
          opacity={value === null || value === 0 ? 0 : 1}
          style={{ transition }}
        />
        <g
          style={{
            transform: `rotate(${value === null ? -90 : -90 + v * 18}deg)`,
            transformOrigin: "100px 100px",
            transformBox: "view-box",
            transition,
          }}
          opacity={value === null ? 0.25 : 1}
        >
          <line x1="100" y1="100" x2="100" y2="34" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" />
        </g>
        <circle cx="100" cy="100" r="9" fill="var(--ink)" />
      </svg>
      <p className="-mt-1 text-center">
        <span className="text-display font-bold tabular-nums">{value ?? "–"}</span>
        <span className="block text-small font-bold text-ink-muted">{value === null ? "Tocca un numero" : intensityWord(v)}</span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- Segnali d'allarme */

function RedFlagsBody({
  question,
  previous,
  onAnswer,
}: {
  question: QuestionOf<"redflags">;
  previous: AnswerOf<"redflags"> | null;
  onAnswer: (answer: Answer, dir: ExitDir) => void;
}) {
  const [checked, setChecked] = useState<RedFlagId[]>(previous ? [...previous.value] : []);
  const titleId = `domanda-${question.id}`;
  const toggle = (id: RedFlagId, on: boolean) => setChecked((c) => (on ? [...c, id] : c.filter((x) => x !== id)));

  return (
    <div className="space-y-4">
      <Kicker icon={<ShieldAlert aria-hidden className="size-4" />} tone="red">
        Controllo di sicurezza
      </Kicker>
      <QuestionTitle id={titleId}>{question.text}</QuestionTitle>
      <p className="text-small text-ink-muted">Spunta quelli che hai adesso, anche se ti sembrano passeggeri.</p>
      <fieldset aria-labelledby={titleId} className="space-y-2">
        {RED_FLAG_IDS.map((id) => (
          <label
            key={id}
            className={cn(
              "flex cursor-pointer gap-3 rounded-2xl border-2 p-3 text-small font-bold transition-colors duration-150",
              "has-checked:border-red has-checked:bg-red-soft",
              "border-line bg-surface hover:border-red/50",
            )}
          >
            <input
              type="checkbox"
              checked={checked.includes(id)}
              onChange={(e) => toggle(id, e.target.checked)}
              className="mt-0.5 size-6 shrink-0 cursor-pointer accent-red"
            />
            <span>{RED_FLAGS[id].checklist}</span>
          </label>
        ))}
      </fieldset>
      <p className="text-small">
        <strong>Se non sei sicuro, chiama il 112:</strong> l&apos;operatore ti aiuta a capire cosa fare.
      </p>
      <Button
        size="lg"
        variant={checked.length ? "danger" : "primary"}
        className="w-full"
        onClick={() => onAnswer({ kind: "redflags", question, value: RED_FLAG_IDS.filter((id) => checked.includes(id)) }, "up")}
      >
        {checked.length ? "Ho almeno uno di questi segnali" : "Nessuno di questi"}
      </Button>
    </div>
  );
}
