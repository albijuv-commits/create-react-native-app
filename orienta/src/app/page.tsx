import { ArrowRight, MessageCircleHeart, ShieldCheck, Stethoscope } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";

export default function SintomiHome() {
  return (
    <div className="space-y-8">
      <section className="space-y-4 pt-2">
        <p className="text-small font-bold text-accent">Sintomi</p>
        <h1 className="text-display font-bold text-primary">Cosa senti oggi?</h1>
        <p className="text-ink-muted">
          Descrivi i tuoi sintomi e rispondi a qualche domanda. Ti mostriamo quali condizioni potrebbero essere
          compatibili e a chi rivolgerti.
        </p>
        <ButtonLink href="/sintomi/intervista" size="lg" className="w-full" icon={<MessageCircleHeart aria-hidden className="size-6" />}>
          Inizia
        </ButtonLink>
      </section>

      <Callout tone="info" title="Orienta, non diagnostica">
        Ogni risultato è una possibilità, mai una diagnosi. Solo un medico può valutare i tuoi sintomi.
      </Callout>

      <section aria-labelledby="come-funziona" className="space-y-3">
        <h2 id="come-funziona" className="text-heading font-bold">
          Come funziona
        </h2>
        <ol className="space-y-3">
          {[
            { n: 1, t: "Dai il consenso", d: "Ti spieghiamo quali dati usiamo e perché." },
            { n: 2, t: "Descrivi cosa senti", d: "A parole o toccando le zone del corpo." },
            { n: 3, t: "Rispondi alle domande", d: "Da 5 a 12, una alla volta. C'è sempre «Non so»." },
            { n: 4, t: "Scopri a chi rivolgerti", d: "Condizioni possibili, urgenza e specialista." },
          ].map((s) => (
            <li key={s.n} className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft font-bold text-primary">
                {s.n}
              </span>
              <div>
                <p className="font-bold">{s.t}</p>
                <p className="text-small text-ink-muted">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link
          href="/medici"
          className="flex min-h-24 flex-col justify-between rounded-2xl bg-surface-2 p-4 font-bold text-primary"
        >
          <Stethoscope aria-hidden className="size-6" />
          <span className="flex items-center gap-1">
            Trova un medico <ArrowRight aria-hidden className="size-4" />
          </span>
        </Link>
        <Link
          href="/profilo"
          className="flex min-h-24 flex-col justify-between rounded-2xl border border-line p-4 font-bold text-ink"
        >
          <ShieldCheck aria-hidden className="size-6 text-primary" />
          <span className="flex items-center gap-1">
            I tuoi dati <ArrowRight aria-hidden className="size-4" />
          </span>
        </Link>
      </section>
    </div>
  );
}
