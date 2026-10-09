import { BookOpen, ChevronRight, ShieldCheck, Stethoscope } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import profilo from "@/assets/illustrations/sezione-profilo.webp";
import privacy from "@/assets/illustrations/stato-privacy.webp";
import { DefaultCity } from "@/components/profile/default-city";
import { EraseData } from "@/components/profile/erase-data";
import { HistoryList } from "@/components/profile/history-list";
import { PreferencesPanel } from "@/components/profile/preferences-panel";
import { PageHeader } from "@/components/ui/page-header";
import { TiltIllustration } from "@/components/ui/tilt-illustration";

export const metadata: Metadata = { title: "Profilo" };

const INFO = [
  { href: "/profilo/privacy", title: "Informativa privacy", text: "Quali dati usa Orienta, dove vanno e come eliminarli.", Icon: ShieldCheck },
  { href: "/profilo/avvertenze", title: "Avvertenze mediche", text: "Cosa può fare Orienta e cosa no.", Icon: Stethoscope },
  { href: "/profilo/fonti", title: "Fonti", text: "Da dove vengono schede, dati sui farmaci e mappe.", Icon: BookOpen },
] as const;

export default function ProfiloPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Profilo" lead="Nessun account: le tue preferenze e il tuo storico restano su questo dispositivo." illustration={profilo} />

      <section aria-labelledby="preferenze" className="space-y-5 rounded-3xl bg-surface p-5">
        <h2 id="preferenze" className="text-heading font-bold">
          Preferenze
        </h2>
        <PreferencesPanel />
        <DefaultCity />
      </section>

      <section id="storico" aria-labelledby="storico-titolo" className="scroll-mt-20 space-y-3">
        <h2 id="storico-titolo" className="text-heading font-bold">
          Storico delle sessioni
        </h2>
        <HistoryList />
      </section>

      <section aria-labelledby="dati-titolo" className="space-y-4 rounded-3xl border-2 border-line p-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <h2 id="dati-titolo" className="text-heading font-bold">
              I tuoi dati
            </h2>
            <p className="text-small">
              Orienta non ha account e non conserva i tuoi dati sui suoi server. Tutto ciò che salvi resta qui: puoi eliminarlo in un solo passaggio.
            </p>
          </div>
          <TiltIllustration src={privacy} sizes="80px" className="w-20 shrink-0" />
        </div>
        <ul className="list-disc space-y-1 pl-5 text-small">
          <li>I sintomi partono dal dispositivo solo se scegli l&apos;intervista con l&apos;AI, dopo il tuo consenso esplicito.</li>
          <li>La posizione serve solo per cercare i medici vicini, e solo se la condividi.</li>
          <li>Niente cookie di profilazione, niente pubblicità, nessuno strumento di analisi.</li>
        </ul>
        <EraseData />
      </section>

      <nav aria-labelledby="info-titolo" className="space-y-3">
        <h2 id="info-titolo" className="text-heading font-bold">
          Informazioni
        </h2>
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
          {INFO.map(({ href, title, text, Icon }) => (
            <li key={href}>
              <Link href={href} className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2">
                <Icon aria-hidden className="size-6 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-primary">{title}</span>
                  <span className="block text-small text-ink-muted">{text}</span>
                </span>
                <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
