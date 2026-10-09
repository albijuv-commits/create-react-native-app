import { ExternalLink, Phone, Siren, Undo2 } from "lucide-react";
import type { Ref } from "react";
import type { Helpline } from "@data/emergency/helplines";
import { RED_FLAGS, type RedFlag, type RedFlagId } from "@data/emergency/red-flags";
import { ButtonAnchor } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * La schermata Emergenza dell'intervista: il pulsante per il 112 sempre per primo, poi cosa fare
 * caso per caso. Per i pensieri di farsi del male compaiono anche Telefono Amico e Telefono Azzurro
 * (per prima la linea più adatta all'età).
 */
export function EmergencyPanel({
  flags,
  age,
  onBack,
  headingRef,
}: {
  flags: readonly RedFlagId[];
  age: number | null;
  /** «Ho sbagliato a rispondere»: torna al passo precedente */
  onBack?: () => void;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  const list = flags.map((id) => RED_FLAGS[id]);
  const single = list.length === 1 ? list[0] : undefined;
  const selfHarm = flags.includes("autolesionismo");

  return (
    <section aria-labelledby="emergenza-titolo" className="space-y-6 pt-2">
      <header className="space-y-2">
        <p className="flex items-center gap-2 text-small font-bold text-red">
          <Siren aria-hidden className="size-5" />
          {selfHarm ? "Chiedi aiuto adesso" : "Possibile emergenza"}
        </p>
        <h1 id="emergenza-titolo" ref={headingRef} tabIndex={-1} className="text-display font-bold text-red outline-none">
          {single ? single.title : "Alcune risposte indicano una possibile emergenza"}
        </h1>
        <p>
          {selfHarm
            ? "Quello che provi conta. Parlarne con qualcuno adesso può aiutarti."
            : "Da quello che ci hai detto potrebbe esserci un'emergenza. Non aspettare che passi da solo."}
        </p>
      </header>

      <CallEmergency />

      {list.map((flag) => (
        <FlagSteps key={flag.id} flag={flag} age={age} showTitle={!single} />
      ))}

      {onBack && (
        <div className="border-t border-line pt-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl px-2 font-bold text-primary underline-offset-4 hover:underline"
          >
            <Undo2 aria-hidden className="size-5" />
            Ho sbagliato a rispondere: torna indietro
          </button>
        </div>
      )}
    </section>
  );
}

/** Il grande pulsante del 112 */
export function CallEmergency() {
  return (
    <div className="space-y-2">
      <ButtonAnchor href="tel:112" variant="danger" className="min-h-20 w-full text-title" icon={<Phone aria-hidden className="size-8" />}>
        Chiama il 112
      </ButtonAnchor>
      <p className="text-center text-small text-ink-muted">Gratuito, sempre attivo, anche senza credito.</p>
    </div>
  );
}

function FlagSteps({ flag, age, showTitle }: { flag: RedFlag; age: number | null; showTitle: boolean }) {
  // Sotto i 18 anni Telefono Azzurro viene prima
  const helplines = age !== null && age < 18 ? [...flag.helplines].reverse() : flag.helplines;
  const titleId = `segnale-${flag.id}`;
  return (
    <section aria-labelledby={titleId} className="space-y-4 rounded-3xl bg-red-soft p-5">
      <h2 id={titleId} className="text-heading font-bold">
        {showTitle ? flag.title : "Cosa fare adesso"}
      </h2>
      <ol className="space-y-3">
        {flag.steps.map((step, i) => (
          <li key={step} className="flex gap-3">
            <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-surface font-bold text-red">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
      {helplines.length > 0 && (
        <div className="space-y-3">
          {helplines.map((h) => (
            <HelplineCard key={h.number} helpline={h} />
          ))}
        </div>
      )}
      <a
        href={flag.source.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center gap-1.5 text-small font-bold text-ink underline underline-offset-4"
      >
        Fonte: {flag.source.title}
        <ExternalLink aria-hidden className="size-4" />
        <span className="sr-only">(si apre in una nuova scheda)</span>
      </a>
    </section>
  );
}

/** Un numero di aiuto: nome, numero grande, orari e a chi si rivolge, con il pulsante per chiamare */
export function HelplineCard({ helpline, tone = "surface" }: { helpline: Helpline; tone?: "surface" | "soft" }) {
  return (
    <div className={cn("space-y-3 rounded-2xl p-4", tone === "surface" ? "bg-surface" : "bg-surface-2")}>
      <div>
        <p className="font-bold">{helpline.name}</p>
        <p className="text-title font-bold tabular-nums text-primary">{helpline.number}</p>
        <p className="text-small text-ink-muted">
          {helpline.hours.charAt(0).toUpperCase() + helpline.hours.slice(1)}. {helpline.audience.charAt(0).toUpperCase() + helpline.audience.slice(1)}.
        </p>
      </div>
      <ButtonAnchor href={`tel:${helpline.tel}`} variant="secondary" className="w-full" icon={<Phone aria-hidden className="size-5" />}>
        Chiama {helpline.number}
      </ButtonAnchor>
    </div>
  );
}
