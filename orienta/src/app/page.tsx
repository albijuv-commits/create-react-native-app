import { ArrowRight, MessageCircleHeart } from "lucide-react";
import Link from "next/link";
import consenso from "@/assets/illustrations/passo-consenso.webp";
import descrivi from "@/assets/illustrations/passo-descrivi.webp";
import domande from "@/assets/illustrations/passo-domande.webp";
import risultati from "@/assets/illustrations/passo-risultati.webp";
import condizioni from "@/assets/illustrations/sezione-condizioni.webp";
import medici from "@/assets/illustrations/sezione-medici.webp";
import profilo from "@/assets/illustrations/sezione-profilo.webp";
import vetrino from "@/assets/illustrations/vetrino-cellule.webp";
import { ModelViewer } from "@/components/three/model-viewer";
import { ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { TiltIllustration } from "@/components/ui/tilt-illustration";

const STEPS = [
  { n: 1, t: "Dai il consenso", d: "Ti spieghiamo quali dati usiamo e perché.", img: consenso },
  { n: 2, t: "Descrivi cosa senti", d: "A parole o toccando le zone del corpo.", img: descrivi },
  { n: 3, t: "Rispondi alle domande", d: "Da 5 a 12, una alla volta. C'è sempre «Non so».", img: domande },
  { n: 4, t: "Scopri a chi rivolgerti", d: "Condizioni possibili, urgenza e specialista.", img: risultati },
];

const TILES = [
  { href: "/medici", label: "Trova un medico", img: medici },
  { href: "/condizioni", label: "Sfoglia le condizioni", img: condizioni },
  { href: "/profilo", label: "I tuoi dati", img: profilo },
];

export default function SintomiHome() {
  return (
    <div className="space-y-10">
      <section className="space-y-5 pt-1">
        <div className="relative mx-auto w-64">
          {/* Il «tavolo luminoso» del microscopio dietro al vetrino */}
          <div aria-hidden className="absolute inset-4 rounded-full bg-[radial-gradient(circle,var(--primary-soft)_0%,transparent_70%)] opacity-90" />
          <ModelViewer
            src="/models/vetrino.glb"
            poster={vetrino}
            label="Un vetrino al microscopio con alcune cellule"
            initialRotation={[0, -Math.PI / 2, 0]}
            sizes="256px"
            priority
            className="w-64"
          />
        </div>
        <div className="space-y-3">
          <p className="text-small font-bold text-accent">Sintomi</p>
          <h1 className="text-display font-bold text-primary">Cosa senti oggi?</h1>
          <p className="text-ink-muted">
            Descrivi i tuoi sintomi e rispondi a qualche domanda. Ti mostriamo quali condizioni potrebbero essere
            compatibili e a chi rivolgerti.
          </p>
        </div>
        <ButtonLink href="/sintomi/intervista" size="lg" className="w-full" icon={<MessageCircleHeart aria-hidden className="size-6" />}>
          Inizia
        </ButtonLink>
      </section>

      <Callout tone="info" title="Orienta, non diagnostica">
        Ogni risultato è una possibilità, mai una diagnosi. Solo un medico può valutare i tuoi sintomi.
      </Callout>

      <section aria-labelledby="come-funziona" className="space-y-4">
        <h2 id="come-funziona" className="text-heading font-bold">
          Come funziona
        </h2>
        <ol className="grid grid-cols-2 gap-3">
          {STEPS.map((s) => (
            <li key={s.n} className="relative space-y-2 rounded-3xl border border-line bg-surface p-4">
              <span className="absolute left-3 top-3 grid size-7 place-items-center rounded-full bg-primary text-small font-bold text-on-primary">
                {s.n}
              </span>
              <TiltIllustration src={s.img} sizes="96px" className="mx-auto w-24" />
              <p className="font-bold leading-snug">{s.t}</p>
              <p className="text-small text-ink-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Altre sezioni" className="grid grid-cols-3 gap-3">
        {TILES.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group flex flex-col items-center gap-2 rounded-3xl bg-surface-2 p-3 text-center text-small font-bold text-primary transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            <TiltIllustration src={t.img} sizes="80px" className="w-20" />
            <span className="inline-flex items-center gap-1">
              {t.label}
              <ArrowRight aria-hidden className="size-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
