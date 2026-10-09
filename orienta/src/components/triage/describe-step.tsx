"use client";

import { ArrowRight, Phone, Plus, Siren, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type Ref } from "react";
import type { BodyZoneId } from "@data/vocab/body";
import { RED_FLAGS, type RedFlagId } from "@data/emergency/red-flags";
import { symptomLabel, type SymptomId } from "@data/vocab/symptoms";
import descrivi from "@/assets/illustrations/passo-descrivi.webp";
import { BodyMap } from "@/components/body-map/body-map";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { Button, ButtonAnchor } from "@/components/ui/button";
import { zoneSymptoms } from "@/lib/triage/questions";
import type { Ambiguity } from "@/lib/triage/recognize";
import { Chip, FieldError, StepHeader } from "./parts";

export const MAX_TEXT = 1000;

/** Sintomi frequenti da toccare quando non c'è ancora niente di più specifico */
const COMMON: SymptomId[] = ["febbre", "mal-di-testa", "mal-di-gola", "tosse-secca", "naso-che-cola", "mal-di-pancia", "nausea", "stanchezza"];
const SUGGESTIONS_SHOWN = 8;

export function DescribeStep({
  text,
  onText,
  symptoms,
  onAddSymptom,
  onRemoveSymptom,
  zones,
  onToggleZone,
  ambiguities,
  flags,
  onEmergency,
  onNext,
  onBack,
  young,
  reduced,
  error,
  headingRef,
}: {
  text: string;
  onText: (text: string) => void;
  /** I sintomi attivi: riconosciuti nel testo (se non tolti) più quelli toccati */
  symptoms: readonly SymptomId[];
  onAddSymptom: (id: SymptomId) => void;
  onRemoveSymptom: (id: SymptomId) => void;
  zones: readonly BodyZoneId[];
  onToggleZone: (zone: BodyZoneId) => void;
  /** Parole generiche del testo da precisare («tosse»: secca o con catarro?) */
  ambiguities: readonly Ambiguity[];
  /** Segnali d'allarme trovati in ciò che è stato scritto finora */
  flags: readonly RedFlagId[];
  onEmergency: () => void;
  onNext: () => void;
  onBack: () => void;
  young: boolean;
  reduced: boolean;
  error: string | null;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const [allSuggestions, setAllSuggestions] = useState(false);
  const active = new Set(symptoms);
  const fromZones = zoneSymptoms(zones).filter((s) => !active.has(s));
  const suggestions = zones.length ? fromZones : COMMON.filter((s) => !active.has(s));
  const shown = allSuggestions ? suggestions : suggestions.slice(0, SUGGESTIONS_SHOWN);

  return (
    <div className="space-y-7">
      <StepHeader
        step="Passo 3 di 4"
        title="Cosa senti?"
        lead={
          young
            ? "Racconta con parole tue cosa senti, oppure tocca il punto del corpo dove ti fa male."
            : "Scrivilo con parole tue, tocca le zone del corpo o scegli i sintomi: basta anche una sola di queste cose."
        }
        aside={<TiltIllustration src={descrivi} sizes="88px" className="w-22" />}
        headingRef={headingRef}
        onBack={onBack}
      />

      <div className="space-y-2">
        <label htmlFor="descrizione" className="text-heading font-bold">
          Descrivi i tuoi disturbi
        </label>
        <textarea
          id="descrizione"
          value={text}
          onChange={(e) => onText(e.target.value.slice(0, MAX_TEXT))}
          maxLength={MAX_TEXT}
          rows={4}
          placeholder="Per esempio: da ieri ho mal di gola e un po' di febbre"
          aria-describedby="descrizione-nota"
          className="block w-full resize-y rounded-2xl border-2 border-line bg-surface p-4 text-body placeholder:text-ink-muted/80 focus:border-primary"
        />
        <p id="descrizione-nota" className="flex justify-between gap-3 text-small text-ink-muted">
          <span>Non scrivere nome, indirizzo o altri dati che ti identificano.</span>
          <span className="shrink-0 tabular-nums" aria-hidden>
            {text.length}/{MAX_TEXT}
          </span>
        </p>
      </div>

      {ambiguities.map((a) => (
        <div key={a.question} className="space-y-2 rounded-3xl bg-surface-2 p-4">
          <p className="font-bold">
            Hai scritto «{a.term}»: {a.question.charAt(0).toLowerCase() + a.question.slice(1)}
          </p>
          <div className="flex flex-wrap gap-2">
            {a.options.map((o) => (
              <Chip key={o} pressed={false} onClick={() => onAddSymptom(o)} icon={<Plus aria-hidden className="size-4" />}>
                {symptomLabel(o)}
              </Chip>
            ))}
          </div>
        </div>
      ))}

      <AnimatePresence initial={false}>
        {flags.length > 0 && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            role="alert"
            className="space-y-3 rounded-3xl border-2 border-red bg-red-soft p-4"
          >
            <p className="flex items-start gap-2 font-bold text-red">
              <Siren aria-hidden className="mt-0.5 size-5 shrink-0" />
              Quello che descrivi può essere un&apos;emergenza.
            </p>
            <ul className="list-disc space-y-1 pl-6 text-small">
              {flags.map((f) => (
                <li key={f}>{RED_FLAGS[f].title}</li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-2">
              <ButtonAnchor href="tel:112" variant="danger" icon={<Phone aria-hidden className="size-5" />}>
                Chiama il 112
              </ButtonAnchor>
              <Button variant="secondary" onClick={onEmergency}>
                Cosa fare
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {symptoms.length > 0 && (
        <section aria-labelledby="sintomi-scelti" className="space-y-2">
          <h2 id="sintomi-scelti" className="font-bold">
            I sintomi che hai indicato
          </h2>
          <ul className="flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {symptoms.map((s) => (
                <motion.li
                  key={s}
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                >
                  <button
                    type="button"
                    onClick={() => onRemoveSymptom(s)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-accent-soft py-2 pl-4 pr-3 text-small font-bold text-accent transition-transform duration-150 ease-out active:scale-[0.97]"
                  >
                    {symptomLabel(s)}
                    <X aria-hidden className="size-4" />
                    <span className="sr-only">: togli</span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <p className="text-small text-ink-muted">Li riconosciamo mentre scrivi: tocca un sintomo per toglierlo se non è giusto.</p>
        </section>
      )}

      <section aria-labelledby="zone-titolo" className="space-y-3">
        <h2 id="zone-titolo" className="text-heading font-bold">
          Dove senti fastidio?
        </h2>
        <BodyMap selected={zones} onToggle={onToggleZone} />
      </section>

      {suggestions.length > 0 && (
        <section aria-labelledby="suggeriti-titolo" className="space-y-3">
          <h2 id="suggeriti-titolo" className="text-heading font-bold">
            {zones.length ? "Nelle zone che hai indicato, senti anche…" : "Oppure tocca un sintomo frequente"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {shown.map((s) => (
              <Chip key={s} pressed={false} onClick={() => onAddSymptom(s)} icon={<Plus aria-hidden className="size-4" />}>
                {symptomLabel(s)}
              </Chip>
            ))}
          </div>
          {suggestions.length > SUGGESTIONS_SHOWN && (
            <button
              type="button"
              onClick={() => setAllSuggestions((v) => !v)}
              aria-expanded={allSuggestions}
              className="min-h-11 font-bold text-primary underline-offset-4 hover:underline"
            >
              {allSuggestions ? "Mostra meno" : `Mostra tutti (${suggestions.length})`}
            </button>
          )}
        </section>
      )}

      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] -mx-4 space-y-2 border-t border-line bg-bg px-4 py-3">
        {error && <FieldError id="descrizione-errore">{error}</FieldError>}
        <Button size="lg" className="w-full" onClick={onNext} icon={<ArrowRight aria-hidden className="size-6" />}>
          Continua con le domande
        </Button>
      </div>
    </div>
  );
}
