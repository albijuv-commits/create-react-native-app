import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** Le pagine informative del Profilo: titolo, data dell'ultimo aggiornamento, sezioni con indice */
export function InfoPage({ title, lead, updated, sections, children }: { title: string; lead: ReactNode; updated: string; sections: { id: string; title: string }[]; children: ReactNode }) {
  return (
    <article className="space-y-6">
      <Link href="/profilo" className="inline-flex min-h-11 items-center gap-1.5 font-bold text-primary">
        <ArrowLeft aria-hidden className="size-5" />
        Profilo
      </Link>
      <header className="space-y-2">
        <h1 className="text-display font-bold leading-tight text-primary">{title}</h1>
        <p className="text-ink-muted">{lead}</p>
        <p className="text-small text-ink-muted">Ultimo aggiornamento: {updated}</p>
      </header>
      <nav aria-label="In questa pagina" className="rounded-3xl bg-surface-2 p-4">
        <ol className="list-decimal space-y-1 pl-5">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="inline-flex min-h-9 items-center font-bold text-primary underline-offset-2 hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      {children}
    </article>
  );
}

export function InfoSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titolo`} className="scroll-mt-20 space-y-3">
      <h2 id={`${id}-titolo`} className="text-heading font-bold">
        {title}
      </h2>
      <div className="space-y-3 [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">{children}</div>
    </section>
  );
}

/** Link esterno: si apre in una nuova scheda e lo dice a chi usa un lettore di schermo */
export function External({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline underline-offset-2">
      {children}
      <ExternalLink aria-hidden className="ml-1 inline size-3.5 align-[-2px]" />
      <span className="sr-only"> (si apre in una nuova scheda)</span>
    </a>
  );
}
