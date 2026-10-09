"use client";

import { ArrowRight, Minus, Plus, UsersRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { Profile } from "@/lib/triage/schema";
import { CheckRow, FieldError, StepHeader } from "./parts";

export interface ProfileDraft {
  age: number | null;
  sex: Profile["sex"] | null;
  pregnancy: Profile["pregnancy"];
  /** Sotto i 14 anni: un genitore o un tutore dà il consenso */
  guardian: boolean;
}

export const MAX_AGE = 120;

/** La domanda sulla gravidanza ha senso solo per alcune persone */
export function asksPregnancy(p: Pick<ProfileDraft, "age" | "sex">): boolean {
  return p.age !== null && p.age >= 10 && p.age <= 55 && (p.sex === "femmina" || p.sex === "altro");
}

export function completeProfile(p: ProfileDraft): Profile | null {
  if (p.age === null || p.sex === null) return null;
  if (p.age < 14 && !p.guardian) return null;
  return { age: p.age, sex: p.sex, pregnancy: asksPregnancy(p) ? p.pregnancy : "non-applicabile" };
}

const SEX_OPTIONS: { id: Profile["sex"]; label: string }[] = [
  { id: "femmina", label: "Femmina" },
  { id: "maschio", label: "Maschio" },
  { id: "altro", label: "Altro" },
  { id: "non-indicato", label: "Preferisco non dirlo" },
];

const PREGNANCY_OPTIONS: { id: Profile["pregnancy"]; label: string }[] = [
  { id: "si", label: "Sì" },
  { id: "no", label: "No" },
  { id: "non-so", label: "Non so" },
];

export function ProfileStep({
  value,
  onChange,
  onNext,
  onBack,
  reduced,
  headingRef,
}: {
  value: ProfileDraft;
  onChange: (next: ProfileDraft) => void;
  onNext: () => void;
  onBack: () => void;
  reduced: boolean;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const [tried, setTried] = useState(false);
  const ageRef = useRef<HTMLInputElement>(null);
  const sexRef = useRef<HTMLInputElement>(null);
  const guardianRef = useRef<HTMLInputElement>(null);
  const pregnancyRef = useRef<HTMLInputElement>(null);
  // Il campo di testo può restare vuoto mentre si scrive: l'età vera è in `value.age`
  const [ageText, setAgeText] = useState(value.age === null ? "" : String(value.age));

  const setAge = (age: number | null) => {
    setAgeText(age === null ? "" : String(age));
    onChange({ ...value, age });
  };
  const step = (delta: number) => setAge(Math.min(MAX_AGE, Math.max(0, (value.age ?? (delta > 0 ? 29 : 31)) + delta)));

  const pregnancy = asksPregnancy(value);
  const child = value.age !== null && value.age < 14;
  const teen = value.age !== null && value.age >= 14 && value.age < 18;
  const errors = {
    age: value.age === null,
    sex: value.sex === null,
    guardian: child && !value.guardian,
    pregnancy: pregnancy && value.pregnancy === "non-applicabile",
  };

  const submit = () => {
    const first = errors.age ? ageRef : errors.guardian ? guardianRef : errors.sex ? sexRef : errors.pregnancy ? pregnancyRef : null;
    if (first) {
      setTried(true);
      first.current?.focus();
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-7">
      <StepHeader step="Passo 2 di 4" title="Qualche dato su di te" lead="Servono a capire quali condizioni sono più probabili alla tua età." headingRef={headingRef} onBack={onBack} />

      <fieldset className="space-y-3" aria-describedby={tried && errors.age ? "eta-errore" : "eta-nota"}>
        <legend className="pb-3 text-heading font-bold">
          <label htmlFor="eta">Quanti anni hai?</label>
        </legend>
        <div className="flex items-center justify-center gap-4">
          <HoldButton label="Un anno in meno" onStep={() => step(-1)} disabled={value.age === 0}>
            <Minus aria-hidden className="size-6" />
          </HoldButton>
          <div className="flex items-baseline gap-2">
            <input
              ref={ageRef}
              id="eta"
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_AGE}
              value={ageText}
              placeholder="–"
              aria-invalid={(tried && errors.age) || undefined}
              onChange={(e) => {
                const raw = e.target.value;
                setAgeText(raw);
                const n = Number.parseInt(raw, 10);
                onChange({ ...value, age: raw === "" || Number.isNaN(n) ? null : Math.min(MAX_AGE, Math.max(0, n)) });
              }}
              onBlur={() => setAgeText(value.age === null ? "" : String(value.age))}
              className={cn(
                "h-20 w-28 rounded-2xl border-2 bg-surface text-center text-display font-bold tabular-nums",
                "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                tried && errors.age ? "border-red" : "border-line focus:border-primary",
              )}
            />
            <span aria-hidden className="font-bold text-ink-muted">
              anni
            </span>
          </div>
          <HoldButton label="Un anno in più" onStep={() => step(1)} disabled={value.age === MAX_AGE}>
            <Plus aria-hidden className="size-6" />
          </HoldButton>
        </div>
        {/* Il cursore è una scorciatoia per il dito; con tastiera e lettori di schermo si usa il campo */}
        <input
          type="range"
          min={0}
          max={100}
          value={Math.min(100, value.age ?? 30)}
          onChange={(e) => setAge(Number(e.target.value))}
          aria-hidden
          tabIndex={-1}
          className={cn("h-11 w-full cursor-pointer accent-primary", value.age === null && "opacity-60")}
        />
        <p id="eta-nota" className="text-small text-ink-muted">
          Puoi scrivere l&apos;età, trascinare il cursore o tenere premuti i pulsanti. Per un neonato scrivi 0.
        </p>
        {tried && errors.age && <FieldError id="eta-errore">Scrivi l&apos;età per continuare.</FieldError>}
      </fieldset>

      <Reveal show={child} reduced={reduced}>
        <div className="space-y-3 rounded-3xl bg-primary-soft p-4">
          <p className="flex items-start gap-2 text-small">
            <UsersRound aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
            <span>
              <strong>Sotto i 14 anni serve un genitore o un tutore.</strong> Se compili per un bambino, rispondi pensando a lui o a lei.
            </span>
          </p>
          <CheckRow
            inputRef={guardianRef}
            checked={value.guardian}
            onChange={(guardian) => onChange({ ...value, guardian })}
            invalid={tried && errors.guardian}
            label="Sono un genitore o un tutore (oppure ne ho uno accanto) e do il consenso."
          />
          {tried && errors.guardian && <FieldError id="tutore-errore">Serve il consenso di un genitore o di un tutore.</FieldError>}
        </div>
      </Reveal>
      <Reveal show={teen} reduced={reduced}>
        <p className="flex items-start gap-2 rounded-3xl bg-primary-soft p-4 text-small">
          <UsersRound aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
          <span>Se puoi, rispondi insieme a un adulto di cui ti fidi: un genitore, un parente, un insegnante.</span>
        </p>
      </Reveal>

      <Choices
        legend="Sesso"
        note="Alcune condizioni dipendono dal sesso biologico."
        name="sesso"
        options={SEX_OPTIONS}
        value={value.sex}
        onChange={(sex) => onChange({ ...value, sex })}
        firstRef={sexRef}
        error={tried && errors.sex ? "Scegli un'opzione: va bene anche «Preferisco non dirlo»." : null}
        columns={2}
      />

      <Reveal show={pregnancy} reduced={reduced}>
        <Choices
          legend="Potresti essere incinta?"
          note="Alcuni disturbi in gravidanza vanno sempre sentiti dal medico."
          name="gravidanza"
          options={PREGNANCY_OPTIONS}
          value={value.pregnancy === "non-applicabile" ? null : value.pregnancy}
          onChange={(p) => onChange({ ...value, pregnancy: p })}
          firstRef={pregnancyRef}
          error={tried && errors.pregnancy ? "Scegli un'opzione: va bene anche «Non so»." : null}
          columns={3}
        />
      </Reveal>

      <Button size="lg" className="w-full" onClick={submit} icon={<ArrowRight aria-hidden className="size-6" />}>
        Continua
      </Button>
    </div>
  );
}

/** Mostra o nasconde un blocco: si apre in altezza, oppure compare e basta con meno movimento */
function Reveal({ show, reduced, children }: { show: boolean; reduced: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={reduced ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Gruppo di scelte esclusive: radio veri, con l'aspetto di grandi pulsanti */
function Choices<T extends string>({
  legend,
  note,
  name,
  options,
  value,
  onChange,
  firstRef,
  error,
  columns,
}: {
  legend: string;
  note?: string;
  name: string;
  options: { id: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  firstRef?: Ref<HTMLInputElement>;
  error: string | null;
  columns: 2 | 3;
}) {
  const errorId = `${name}-errore`;
  const noteId = `${name}-nota`;
  return (
    <fieldset className="space-y-3" aria-describedby={error ? errorId : note ? noteId : undefined}>
      <legend className="pb-1 text-heading font-bold">{legend}</legend>
      {note && (
        <p id={noteId} className="text-small text-ink-muted">
          {note}
        </p>
      )}
      <div className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {options.map((o, i) => (
          <label
            key={o.id}
            className={cn(
              "relative flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border-2 px-3 py-2 text-center font-bold",
              "transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97]",
              "has-checked:border-primary has-checked:bg-primary has-checked:text-on-primary",
              "has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus",
              error ? "border-red bg-surface" : "border-line bg-surface hover:border-primary",
            )}
          >
            <input
              ref={i === 0 ? firstRef : undefined}
              type="radio"
              name={name}
              value={o.id}
              checked={value === o.id}
              onChange={() => onChange(o.id)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </fieldset>
  );
}

/**
 * Pulsante che ripete l'azione finché resta premuto. Con il dito o il mouse scatta subito e poi
 * accelera; con la tastiera (Invio o Spazio) fa un passo per volta.
 */
function HoldButton({ label, onStep, disabled, children }: { label: string; onStep: () => void; disabled?: boolean; children: ReactNode }) {
  const timer = useRef<number | null>(null);
  const latest = useRef(onStep);
  useEffect(() => {
    latest.current = onStep;
  });
  const stop = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);
  // Arrivati al limite il pulsante si disattiva e non riceve più il rilascio del dito
  useEffect(() => {
    if (disabled) stop();
  }, [disabled]);

  const repeat = (delay: number) => {
    timer.current = window.setTimeout(() => {
      latest.current();
      repeat(Math.max(45, delay * 0.8));
    }, delay);
  };

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        latest.current();
        repeat(420);
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onClick={(e) => {
        // detail 0: attivato da tastiera; il puntatore ha già fatto il suo passo
        if (e.detail === 0) onStep();
      }}
      onContextMenu={(e) => e.preventDefault()}
      className="grid size-14 shrink-0 place-items-center rounded-full bg-primary-soft text-primary transition-transform duration-150 ease-out select-none active:scale-[0.94] disabled:opacity-40"
    >
      {children}
    </button>
  );
}
