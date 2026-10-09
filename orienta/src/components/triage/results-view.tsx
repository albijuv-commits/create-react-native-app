"use client";

import { ArrowRight, BookOpen, ChevronDown, Clock, House, ImageIcon, Info, MapPin, Microscope, Phone, RotateCcw, Siren, Sparkles, Stethoscope, UsersRound } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ComponentType, type Ref, type SVGProps } from "react";
import bussola from "@/assets/illustrations/passo-risultati.webp";
import nessunRisultato from "@/assets/illustrations/stato-nessun-risultato.webp";
import { CURE_NON_URGENTI } from "@data/emergency/helplines";
import { getSpecialty, type SpecialtyId } from "@data/vocab/specialties";
import { symptomLabel } from "@data/vocab/symptoms";
import { HelplineCard } from "@/components/emergency/emergency-panel";
import { SlidePreview } from "@/components/slide/slide-preview";
import { ModelViewer } from "@/components/three/model-viewer";
import { Button, ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { UrgencyIndicator } from "@/components/ui/urgency-indicator";
import type { InterviewCondition } from "@/lib/conditions/catalog";
import { saveSummaryForDoctors } from "@/lib/doctors/handoff";
import { cn } from "@/lib/cn";
import { URGENCY, type UrgencyLevel } from "@/lib/design/urgency";
import { CONDITION_ILLUSTRATIONS } from "@/lib/illustrations/conditions";
import { URGENCY_ILLUSTRATIONS, URGENCY_MODELS } from "@/lib/illustrations/urgency";
import type { Compatibility, ResultCondition, TriageResponse } from "@/lib/triage/schema";
import type { HistoryEntry } from "@/lib/storage/history";
import { DoctorSummary } from "./doctor-summary";
import { SaveToHistory } from "./save-history";
import { StepHeader } from "./parts";

type Results = Extract<TriageResponse, { kind: "results" }>;

const LEVELS: readonly UrgencyLevel[] = ["home", "gp", "soon", "er"];
const LEVEL_SHORT: Record<UrgencyLevel, string> = { home: "A casa", gp: "Dal medico", soon: "Entro 24 ore", er: "Subito" };
const LEVEL_ICON: Record<UrgencyLevel, ComponentType<SVGProps<SVGSVGElement>>> = { home: House, gp: Stethoscope, soon: Clock, er: Siren };
const LEVEL_FILL: Record<UrgencyLevel, string> = { home: "bg-calm", gp: "bg-amber", soon: "bg-orange", er: "bg-red" };

const COMPATIBILITY: Record<Compatibility, { label: string; bars: number }> = {
  alta: { label: "Compatibilità alta", bars: 3 },
  media: { label: "Compatibilità media", bars: 2 },
  bassa: { label: "Compatibilità bassa", bars: 1 },
};

/** Sotto i 14 anni il riferimento per tutto ciò che è «medico di base» è il pediatra */
function specialistFor(id: SpecialtyId, age: number): SpecialtyId {
  return age < 14 && id === "medico-di-base" ? "pediatra" : id;
}

export function ResultsView({
  result,
  conditions,
  age,
  summary,
  generatedAt,
  historyEntry,
  onRestart,
  reduced,
  headingRef,
}: {
  result: Results;
  conditions: readonly InterviewCondition[];
  age: number;
  summary: string;
  generatedAt: Date;
  historyEntry: HistoryEntry;
  onRestart: () => void;
  reduced: boolean;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const byId = new Map(conditions.map((c) => [c.id, c]));
  const items = result.conditions.flatMap((r) => {
    const c = byId.get(r.id);
    return c ? [{ result: r, condition: c }] : [];
  });
  const unidentified = result.unidentified || items.length === 0;

  return (
    <div className="space-y-7">
      <StepHeader
        step="Risultati"
        title={unidentified ? "Nessuna corrispondenza chiara" : "Cosa potrebbe essere"}
        aside={
          <ModelViewer
            src="/models/bussola.glb"
            poster={bussola}
            label="Una bussola: Orienta ti indica la direzione"
            initialRotation={[0.15, -Math.PI / 2, 0]}
            sizes="112px"
            hint="icon"
            className="w-28"
          />
        }
        headingRef={headingRef}
      />

      <div className="flex gap-3 rounded-3xl border-2 border-primary bg-primary-soft p-4">
        <Info aria-hidden className="mt-0.5 size-6 shrink-0 text-primary" />
        <p className="font-bold">Questa non è una diagnosi. Solo un medico può valutare i tuoi sintomi.</p>
      </div>

      {age < 18 && (
        <p className="flex items-start gap-2 rounded-3xl bg-surface-2 p-4 text-small">
          <UsersRound aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
          <span>Fai vedere questi risultati a un genitore o a un adulto di cui ti fidi.</span>
        </p>
      )}

      <section aria-labelledby="urgenza-titolo" className="space-y-4">
        <h2 id="urgenza-titolo" className="text-heading font-bold">
          Quando farti vedere
        </h2>
        <UrgencyMeter level={result.urgency} reduced={reduced} />
        <ModelViewer
          key={result.urgency}
          src={URGENCY_MODELS[result.urgency]}
          poster={URGENCY_ILLUSTRATIONS[result.urgency]}
          label={`Il simbolo del tuo livello: ${LEVEL_SHORT[result.urgency].toLowerCase()}`}
          initialRotation={[0.1, -Math.PI / 2, 0]}
          sizes="176px"
          className="mx-auto w-44"
        />
        <UrgencyIndicator level={result.urgency} />
        <NextSteps level={result.urgency} age={age} />
        <UrgencyExplorer current={result.urgency} reduced={reduced} />
      </section>

      <section aria-labelledby="condizioni-titolo" className="space-y-4">
        <div className="space-y-1">
          <h2 id="condizioni-titolo" className="text-heading font-bold">
            Condizioni compatibili
          </h2>
          {!unidentified && (
            <p className="text-small text-ink-muted">
              Dalla più compatibile con ciò che hai descritto. Tocca «Perché?» per vedere cosa la rende più o meno probabile.
            </p>
          )}
        </div>
        {unidentified && (
          <div className="flex items-center gap-3 rounded-3xl bg-surface-2 p-4">
            <TiltIllustration src={nessunRisultato} sizes="88px" className="w-22 shrink-0" />
            <p className="text-small">
              Nessuna delle condizioni nella base di conoscenza di Orienta corrisponde bene a ciò che hai descritto. Non vuol dire che non ci
              sia niente: parlane con il medico.
            </p>
          </div>
        )}
        {!unidentified && (
          <ol className="space-y-3">
            {items.map(({ result: r, condition: c }, i) => (
              <motion.li
                key={c.id}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 * i, ease: [0.23, 1, 0.32, 1] }}
              >
                <ConditionCard condition={c} result={r} rank={i + 1} age={age} reduced={reduced} onFindSpecialist={() => saveSummaryForDoctors(summary)} />
              </motion.li>
            ))}
          </ol>
        )}
        <ButtonLink href="/condizioni" variant="ghost" icon={<BookOpen aria-hidden className="size-5" />}>
          Sfoglia tutte le condizioni
        </ButtonLink>
      </section>

      <DoctorSummary text={summary} generatedAt={generatedAt} />
      <SaveToHistory key={historyEntry.id} entry={historyEntry} />

      <p className="text-small text-ink-muted">
        {result.source === "ai"
          ? "Domande e confronto preparati con l'intelligenza artificiale (Claude di Anthropic), che può scegliere solo tra le schede di Orienta. L'urgenza non è mai più bassa di quella calcolata dalle regole fisse."
          : "Abbiamo confrontato i tuoi sintomi con le schede di Orienta usando regole fisse, direttamente sul tuo dispositivo."}
      </p>

      <Button variant="secondary" size="lg" className="w-full" onClick={onRestart} icon={<RotateCcw aria-hidden className="size-5" />}>
        Nuova intervista
      </Button>
    </div>
  );
}

/** I quattro livelli in fila: il segnaposto scorre fino a quello indicato */
function UrgencyMeter({ level, reduced }: { level: UrgencyLevel; reduced: boolean }) {
  const index = LEVELS.indexOf(level);
  return (
    <div className="space-y-2">
      <p className="sr-only">
        Livello di urgenza {index + 1} su 4: {URGENCY[level].label}.
      </p>
      <div aria-hidden className="grid grid-cols-4 gap-1.5">
        {LEVELS.map((l, i) => (
          <div key={l} className="h-2.5 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className={cn("h-full rounded-full", LEVEL_FILL[l])}
              initial={reduced ? false : { width: "0%" }}
              animate={{ width: i <= index ? "100%" : "0%" }}
              transition={{ duration: 0.25, delay: reduced ? 0 : 0.12 * i, ease: [0.23, 1, 0.32, 1] }}
            />
          </div>
        ))}
      </div>
      <div aria-hidden className="grid grid-cols-4 gap-1.5">
        {LEVELS.map((l, i) => {
          const Icon = LEVEL_ICON[l];
          const current = i === index;
          return (
            <div key={l} className={cn("flex flex-col items-center gap-1 text-center text-small", current ? cn("font-bold", URGENCY[l].tone.text) : "text-ink-muted")}>
              <Icon className={cn("size-5", !current && "opacity-60")} />
              <span className="leading-tight">{LEVEL_SHORT[l]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** I quattro livelli da esplorare: si tocca un livello per leggere cosa significa */
function UrgencyExplorer({ current, reduced }: { current: UrgencyLevel; reduced: boolean }) {
  const [open, setOpen] = useState<UrgencyLevel | null>(null);
  const shown = open ? URGENCY[open] : null;
  return (
    <div className="space-y-3 rounded-3xl bg-surface-2 p-4">
      <p className="flex items-center gap-2 text-small font-bold">
        <Sparkles aria-hidden className="size-4 text-accent" />
        Cosa significano i livelli? Toccane uno.
      </p>
      <div role="group" aria-label="Livelli di urgenza" className="grid grid-cols-4 gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={open === l}
            aria-label={`${URGENCY[l].label}${l === current ? " (il tuo livello)" : ""}`}
            onClick={() => setOpen((o) => (o === l ? null : l))}
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-2xl border-2 p-1.5 pb-2 transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.96]",
              open === l ? cn("bg-surface", URGENCY[l].tone.border) : "border-transparent hover:bg-surface",
            )}
          >
            {l === current && (
              <span className="absolute -top-2 rounded-full bg-primary px-1.5 text-[0.6875rem] font-bold leading-5 text-on-primary">Tu</span>
            )}
            <Image src={URGENCY_ILLUSTRATIONS[l]} alt="" sizes="56px" className="size-14" />
            <span className={cn("text-center text-[0.75rem] font-bold leading-tight", URGENCY[l].tone.text)}>{LEVEL_SHORT[l]}</span>
          </button>
        ))}
      </div>
      <AnimatePresence initial={false} mode="wait">
        {shown && open && (
          <motion.div
            key={open}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            aria-live="polite"
            className="space-y-1 rounded-2xl bg-surface p-3"
          >
            <p className={cn("font-bold", shown.tone.text)}>
              {shown.label}
              {open === current && <span className="text-ink"> · il tuo livello</span>}
            </p>
            <p className="text-small">{shown.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Cosa fare adesso, livello per livello. I numeri sono quelli verificati in data/emergency. */
function NextSteps({ level, age }: { level: UrgencyLevel; age: number }) {
  const doctor = age < 14 ? "il pediatra" : "il medico di base";
  if (level === "er") {
    return (
      <div className="space-y-3">
        <ButtonAnchor href="tel:112" variant="danger" size="lg" className="w-full" icon={<Phone aria-hidden className="size-6" />}>
          Chiama il 112
        </ButtonAnchor>
        <p className="text-small">Se puoi muoverti in sicurezza, fatti accompagnare al pronto soccorso più vicino. Non guidare da solo.</p>
        <ButtonLink href="/medici#specialista=pronto-soccorso" variant="secondary" className="w-full" icon={<MapPin aria-hidden className="size-5" />}>
          Trova il pronto soccorso
        </ButtonLink>
      </div>
    );
  }
  if (level === "home") {
    return <p className="text-small">Se compaiono segnali d&apos;allarme, come difficoltà a respirare o dolore al petto, chiama subito il 112.</p>;
  }
  return (
    <div className="space-y-3">
      <p className="text-small">
        {level === "soon"
          ? `Cerca una visita entro 24 ore: chiama ${doctor}. Di notte, nel fine settimana e nei festivi rivolgiti alla guardia medica.`
          : `Prendi appuntamento con ${doctor} nei prossimi giorni. Se non è disponibile, rivolgiti alla guardia medica.`}{" "}
        Se peggiori o compaiono segnali d&apos;allarme, chiama il 112.
      </p>
      <HelplineCard helpline={CURE_NON_URGENTI} tone="soft" />
    </div>
  );
}

function CompatibilityBadge({ level }: { level: Compatibility }) {
  const { label, bars } = COMPATIBILITY[level];
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-small font-bold text-primary">
      <span aria-hidden className="flex items-end gap-0.5">
        {[1, 2, 3].map((b) => (
          <span key={b} className={cn("w-1 rounded-sm", b <= bars ? "bg-primary" : "bg-primary/25")} style={{ height: `${4 + b * 3}px` }} />
        ))}
      </span>
      {label}
    </span>
  );
}

function ConditionCard({
  condition,
  result,
  rank,
  age,
  reduced,
  onFindSpecialist,
}: {
  condition: InterviewCondition;
  result: ResultCondition;
  rank: number;
  age: number;
  reduced: boolean;
  /** Prima di andare a Medici: il riepilogo resta pronto per l'email al medico, solo in questa scheda */
  onFindSpecialist: () => void;
}) {
  const [open, setOpen] = useState(false);
  const titleId = `risultato-${condition.id}`;
  const detailsId = `perche-${condition.id}`;
  const specialist = getSpecialty(specialistFor(condition.specialistId, age));
  const params = new URLSearchParams({ specialista: specialist.id, condizione: condition.id });

  return (
    <article aria-labelledby={titleId} className="space-y-4 rounded-3xl border border-line bg-surface p-4">
      <div className="flex gap-3">
        <FlipMedia condition={condition} reduced={reduced} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 id={titleId} className="text-heading font-bold">
            <span className="sr-only">{rank}. </span>
            {condition.name}
          </h3>
          <CompatibilityBadge level={result.compatibility} />
        </div>
      </div>
      <p className="text-small text-ink-muted">{condition.teaser}</p>

      {result.matchingSymptoms.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-small font-bold">Corrisponde a ciò che hai indicato:</p>
          <ul className="flex flex-wrap gap-1.5">
            {result.matchingSymptoms.map((s) => (
              <li key={s} className="rounded-full bg-accent-soft px-3 py-1 text-small font-bold text-accent">
                {symptomLabel(s)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 w-full items-center justify-between rounded-2xl bg-surface-2 px-4 font-bold text-primary"
      >
        Perché?
        <ChevronDown aria-hidden className={cn("size-5 transition-transform duration-200 ease-out", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={detailsId}
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 pb-1">
              <FactorList title="Più probabile se" items={condition.moreLikelyIf} sign="+" />
              <FactorList title="Meno probabile se" items={condition.lessLikelyIf} sign="−" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-2">
        {/* Niente precaricamento né immagini dello specialista: le richieste direbbero al server quale condizione è uscita */}
        <ButtonLink href={`/condizioni/${condition.id}`} prefetch={false} variant="secondary" icon={<BookOpen aria-hidden className="size-5" />}>
          Scopri di più
        </ButtonLink>
        <ButtonLink href={`/medici#${params.toString()}`} onClick={onFindSpecialist} variant="ghost" className="justify-start gap-3 py-2 text-left">
          <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-surface-2 text-primary">
            <MapPin className="size-6" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="inline-flex items-center gap-1.5">
              Trova uno specialista
              <ArrowRight aria-hidden className="size-5" />
            </span>
            <span className="text-small font-normal text-ink-muted">
              <span className="sr-only">: </span>
              {specialist.label}
            </span>
          </span>
        </ButtonLink>
      </div>
    </article>
  );
}

/**
 * L'immagine della condizione: davanti il vetrino animato, disegnato nel browser; dietro
 * l'illustrazione, che si scarica solo quando giri la carta (il suo indirizzo direbbe al server
 * quale condizione è uscita). Si gira toccandola; con meno movimento cambia e basta.
 */
function FlipMedia({ condition, reduced }: { condition: InterviewCondition; reduced: boolean }) {
  const [back, setBack] = useState(false);
  const [seen, setSeen] = useState(false);
  const art = CONDITION_ILLUSTRATIONS[condition.id];
  if (!art) return <SlidePreview spec={condition.animation} className="size-24 shrink-0" />;
  return (
    <button
      type="button"
      onClick={() => {
        setBack((b) => !b);
        setSeen(true);
      }}
      aria-pressed={back}
      aria-label={`Mostra l'illustrazione di ${condition.name}`}
      className="relative size-24 shrink-0 [perspective:700px]"
    >
      <motion.span
        className="relative block size-full [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: back ? 180 : 0 }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 24 }}
      >
        <span className="absolute inset-0 [backface-visibility:hidden]">
          <SlidePreview spec={condition.animation} className="size-24" />
        </span>
        <span className="absolute inset-0 grid place-items-center rounded-2xl bg-surface-2 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {seen && <Image src={art} alt="" sizes="96px" className="size-20" />}
        </span>
      </motion.span>
      <span aria-hidden className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-primary text-on-primary shadow-sm">
        {back ? <Microscope className="size-4" /> : <ImageIcon className="size-4" />}
      </span>
    </button>
  );
}

function FactorList({ title, items, sign }: { title: string; items: readonly string[]; sign: "+" | "−" }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <h4 className="text-small font-bold">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((t) => (
          <li key={t} className="flex gap-2 text-small">
            <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-full bg-surface-2 font-bold text-primary">
              {sign}
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
