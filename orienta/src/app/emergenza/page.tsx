import type { Metadata } from "next";
import { ChevronDown, ExternalLink } from "lucide-react";
import { CURE_NON_URGENTI, TELEFONO_AMICO, TELEFONO_AZZURRO } from "@data/emergency/helplines";
import { RED_FLAG_IDS, RED_FLAGS } from "@data/emergency/red-flags";
import { CallEmergency, HelplineCard } from "@/components/emergency/emergency-panel";
import { formatItalianDate } from "@/lib/conditions/catalog";

export const metadata: Metadata = { title: "Emergenza" };

/** Schermata Emergenza sempre raggiungibile: 112, i segnali da riconoscere e i numeri di aiuto. */
export default function EmergenzaPage() {
  return (
    <div className="space-y-8 pt-2">
      <header className="space-y-2">
        <h1 className="text-display font-bold text-red">Emergenza</h1>
        <p>Se pensi che la tua vita o quella di qualcun altro sia in pericolo, chiama subito.</p>
      </header>

      <CallEmergency />

      <section aria-labelledby="mentre-aspetti" className="space-y-3 rounded-3xl bg-red-soft p-5">
        <h2 id="mentre-aspetti" className="text-heading font-bold">
          Mentre aspetti i soccorsi
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Resta calmo e rispondi alle domande dell&apos;operatore: ti guiderà passo per passo.</li>
          <li>Di&apos; dove ti trovi nel modo più preciso possibile.</li>
          <li>Non restare da solo: chiedi aiuto a chi è vicino.</li>
          <li>Non prendere farmaci, cibo o bevande se non te lo dice l&apos;operatore.</li>
        </ul>
      </section>

      <section aria-labelledby="segnali" className="space-y-3">
        <div className="space-y-1">
          <h2 id="segnali" className="text-heading font-bold">
            Riconosci i segnali d&apos;allarme
          </h2>
          <p className="text-small text-ink-muted">Tocca un segnale per sapere cosa fare.</p>
        </div>
        <ul className="space-y-2">
          {RED_FLAG_IDS.map((id) => {
            const flag = RED_FLAGS[id];
            return (
              <li key={id}>
                <details className="group rounded-2xl border border-line bg-surface open:border-red/40">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-bold [&::-webkit-details-marker]:hidden">
                    <span>{flag.title}</span>
                    <ChevronDown aria-hidden className="size-5 shrink-0 text-red transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="space-y-3 px-4 pb-4">
                    <p className="text-small text-ink-muted">{flag.checklist}.</p>
                    <ol className="list-decimal space-y-2 pl-5">
                      {flag.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                    <a
                      href={flag.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-1.5 text-small font-bold underline underline-offset-4"
                    >
                      Fonte: {flag.source.title}
                      <ExternalLink aria-hidden className="size-4" />
                      <span className="sr-only">(si apre in una nuova scheda)</span>
                    </a>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="numeri" className="space-y-3">
        <div className="space-y-1">
          <h2 id="numeri" className="text-heading font-bold">
            Numeri di aiuto
          </h2>
          <p className="text-small text-ink-muted">
            Numeri e orari verificati sui siti ufficiali il {formatItalianDate(TELEFONO_AMICO.verifiedAt)}.
          </p>
        </div>
        <HelplineCard helpline={TELEFONO_AMICO} tone="soft" />
        <HelplineCard helpline={TELEFONO_AZZURRO} tone="soft" />
        <HelplineCard helpline={CURE_NON_URGENTI} tone="soft" />
      </section>
    </div>
  );
}
