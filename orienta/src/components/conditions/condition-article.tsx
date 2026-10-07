import { AlertTriangle, ArrowLeft, ExternalLink, MapPin, Phone, Siren, Stethoscope } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { bodyAreaLabel } from "@data/vocab/body";
import { getSpecialty, type SpecialtyId } from "@data/vocab/specialties";
import { SlideViewer } from "@/components/slide/slide-viewer";
import { Badge } from "@/components/ui/badge";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { cn } from "@/lib/cn";
import { SOURCES_CHECKED_AT, formatItalianDate } from "@/lib/conditions/catalog";
import type { Condition } from "@/lib/conditions/schema";
import { CONDITION_ILLUSTRATIONS } from "@/lib/illustrations/conditions";
import { SPECIALIST_ILLUSTRATIONS } from "@/lib/illustrations/specialists";

const SECTIONS = [
  { id: "panoramica", label: "Panoramica" },
  { id: "come-e-fatta", label: "Com'è fatta" },
  { id: "storia", label: "Storia" },
  { id: "casi", label: "Casi clinici" },
  { id: "cause", label: "Cause" },
  { id: "sintomi", label: "Sintomi" },
  { id: "cure", label: "Cure" },
  { id: "quando-andare", label: "Quando andare dal medico" },
  { id: "prevenzione", label: "Prevenzione" },
  { id: "specialista", label: "Specialista" },
  { id: "fonti", label: "Fonti" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function Section({ id, title, children }: { id: SectionId; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titolo`} className="space-y-4">
      <h2 id={`${id}-titolo`} className="text-title font-bold text-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-heading font-bold">{children}</h3>;
}

function BulletList({ items, marker = "bg-accent" }: { items: readonly string[]; marker?: string }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden className={cn("mt-2.5 size-2 shrink-0 rounded-full", marker)} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function medicLink(specialist: SpecialtyId, condition?: string) {
  const params = new URLSearchParams({ specialista: specialist });
  if (condition) params.set("condizione", condition);
  return `/medici?${params.toString()}`;
}

export function ConditionArticle({ condition: c }: { condition: Condition }) {
  const specialist = getSpecialty(c.specialist.id);
  const emergency = c.specialist.id === "pronto-soccorso";

  return (
    <article className="space-y-12">
      <header className="space-y-4">
        <Link
          href="/condizioni"
          className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-xl px-2 font-bold text-primary hover:bg-primary-soft"
        >
          <ArrowLeft aria-hidden className="size-5" />
          Tutte le condizioni
        </Link>
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <h1 className="text-display font-bold text-ink">{c.name}</h1>
            {c.aliases.length > 0 && <p className="text-ink-muted">Detta anche: {c.aliases.join(", ")}</p>}
          </div>
          {CONDITION_ILLUSTRATIONS[c.id] && (
            <TiltIllustration src={CONDITION_ILLUSTRATIONS[c.id]!} sizes="128px" priority className="w-28 shrink-0 sm:w-32" />
          )}
        </div>
        <ul className="flex flex-wrap gap-2" aria-label="Aree del corpo">
          {c.areas.map((a) => (
            <li key={a}>
              <Badge tone="primary">{bodyAreaLabel(a)}</Badge>
            </li>
          ))}
        </ul>
        {c.reviewStatus === "da revisionare" && (
          <p className="flex items-start gap-2 text-small text-ink-muted">
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-amber" />
            Contenuto non ancora revisionato da un medico.
          </p>
        )}
        <nav aria-label="In questa scheda" className="-mx-4 overflow-x-auto px-4">
          <ul className="flex gap-2 pb-1">
            {/* La sezione sulla sicurezza viene prima nell'indice: è quella da trovare subito */}
            {[...SECTIONS.filter((s) => s.id === "quando-andare"), ...SECTIONS.filter((s) => s.id !== "quando-andare")].map((s) => {
              const safety = s.id === "quando-andare";
              return (
                <li key={s.id} className="shrink-0">
                  <a
                    href={`#${s.id}`}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-small font-bold transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.97]",
                      safety ? "bg-red-soft text-red hover:bg-red hover:text-on-red" : "bg-surface-2 text-ink hover:bg-primary-soft hover:text-primary",
                    )}
                  >
                    {safety && <Siren aria-hidden className="size-4" />}
                    {s.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <Section id="panoramica" title="Panoramica">
        <p className="text-heading leading-relaxed">{c.overview}</p>
      </Section>

      <Section id="come-e-fatta" title="Com'è fatta">
        <SlideViewer spec={c.animation} subject={c.name} />
      </Section>

      <Section id="storia" title="Storia">
        <div className="space-y-1">
          <SubHeading>Da dove viene il nome</SubHeading>
          <p>{c.history.nameOrigin}</p>
        </div>
        <SubHeading>Le tappe</SubHeading>
        <ol className="relative space-y-5 border-l-2 border-line pl-6">
          {c.history.events.map((e) => (
            <li key={e.when + e.text.slice(0, 20)} className="relative">
              <span aria-hidden className="absolute -left-[31px] top-1.5 size-3 rounded-full border-2 border-primary bg-bg" />
              <p className="font-bold text-primary">{e.when}</p>
              <p>{e.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="casi" title={c.cases.length > 1 ? "Casi clinici" : "Un caso clinico"}>
        {c.cases.map((k, i) => (
          <article key={k.title} aria-labelledby={`caso-${i + 1}`} className="space-y-3 rounded-2xl bg-surface-2 p-5">
            <Badge tone={k.kind === "illustrativo" ? "primary" : "accent"}>
              {k.kind === "illustrativo" ? "Caso inventato a scopo illustrativo" : "Caso pubblicato"}
            </Badge>
            <h3 id={`caso-${i + 1}`} className="text-heading font-bold">
              {k.title}
            </h3>
            <p>{k.story}</p>
            <p>
              <span className="font-bold">Cosa insegna: </span>
              {k.lesson}
            </p>
            {k.kind === "pubblicato" && (
              <a href={k.source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-small font-bold text-primary underline underline-offset-2">
                Fonte: {k.source.publisher}
                <ExternalLink aria-hidden className="size-4" />
                <span className="sr-only">(si apre in una nuova scheda)</span>
              </a>
            )}
          </article>
        ))}
      </Section>

      <Section id="cause" title="Cause e fattori di rischio">
        <BulletList items={c.causes} />
        <SubHeading>Cosa aumenta il rischio</SubHeading>
        <BulletList items={c.riskFactors} marker="bg-primary" />
      </Section>

      <Section id="sintomi" title="Sintomi">
        <SubHeading>Tipici</SubHeading>
        <BulletList items={c.symptoms.typical} />
        <SubHeading>Meno comuni</SubHeading>
        <BulletList items={c.symptoms.lessCommon} marker="bg-primary" />
      </Section>

      <Section id="cure" title="Cure possibili">
        <ul className="divide-y divide-line border-y border-line">
          {c.treatments.options.map((o) => (
            <li key={o.title} className="space-y-0.5 py-3">
              <p className="font-bold">{o.title}</p>
              <p className="text-ink-muted">{o.text}</p>
            </li>
          ))}
        </ul>
        <SubHeading>Cosa puoi fare tu</SubHeading>
        <BulletList items={c.treatments.selfCare} marker="bg-calm" />
        <Callout tone="info" title="Farmaci: chiedi sempre al medico o al farmacista">
          Questa scheda descrive solo i tipi di cura. Quale farmaco usare, in che dose e per quanto tempo lo decide
          un professionista che conosce la tua situazione.
        </Callout>
      </Section>

      <Section id="quando-andare" title="Quando andare dal medico">
        <div className="space-y-3 rounded-2xl border-2 border-amber bg-amber-soft p-4">
          <p className="flex items-start gap-2 font-bold text-amber">
            <Stethoscope aria-hidden className="mt-0.5 size-5 shrink-0" />
            Senti il medico di base o la guardia medica (116117 dove attivo) se:
          </p>
          <BulletList items={c.whenToSeeDoctor.routine} marker="bg-amber" />
        </div>
        <div className="space-y-3 rounded-2xl border-2 border-red bg-red-soft p-4">
          <p className="flex items-start gap-2 font-bold text-red">
            <Siren aria-hidden className="mt-0.5 size-5 shrink-0" />
            Chiedi aiuto subito, con il 112 o al pronto soccorso, se:
          </p>
          <BulletList items={c.whenToSeeDoctor.urgent} marker="bg-red" />
          <ButtonAnchor href="tel:112" variant="danger" className="w-full" icon={<Phone aria-hidden className="size-5" />}>
            Chiama il 112
          </ButtonAnchor>
        </div>
      </Section>

      <Section id="prevenzione" title="Prevenzione">
        <BulletList items={c.prevention} marker="bg-calm" />
      </Section>

      <Section id="specialista" title="Specialista di riferimento">
        <div className="space-y-3 rounded-2xl bg-primary-soft p-5">
          <div className="flex items-center gap-3">
            <p className="min-w-0 flex-1 text-heading font-bold text-primary">{specialist.label}</p>
            {SPECIALIST_ILLUSTRATIONS[c.specialist.id] && (
              <TiltIllustration src={SPECIALIST_ILLUSTRATIONS[c.specialist.id]!} sizes="80px" className="w-20 shrink-0" />
            )}
          </div>
          <p>{c.specialist.why}</p>
          <p className="text-small text-ink-muted">{specialist.description}</p>
          {emergency ? (
            <div className="grid gap-2">
              <ButtonAnchor href="tel:112" variant="danger" icon={<Phone aria-hidden className="size-5" />}>
                Chiama il 112
              </ButtonAnchor>
              <ButtonLink href={medicLink("pronto-soccorso", c.id)} variant="secondary" icon={<MapPin aria-hidden className="size-5" />}>
                Trova il pronto soccorso vicino a me
              </ButtonLink>
            </div>
          ) : (
            <ButtonLink href={medicLink(c.specialist.id, c.id)} icon={<MapPin aria-hidden className="size-5" />} className="w-full">
              Trova vicino a me
            </ButtonLink>
          )}
        </div>
        {!emergency && c.specialist.id !== "medico-di-base" && (
          <div className="space-y-2">
            <p>
              {c.specialist.id === "pediatra"
                ? "Per un adulto il primo passo è il medico di base."
                : "Di solito il primo passo è il medico di base: ti visita e, se serve, ti indirizza dallo specialista."}
            </p>
            <ButtonLink href={medicLink("medico-di-base", c.id)} variant="secondary" icon={<Stethoscope aria-hidden className="size-5" />}>
              Trova il medico di base
            </ButtonLink>
          </div>
        )}
      </Section>

      <Section id="fonti" title="Fonti">
        <p className="text-small text-ink-muted">
          La scheda si basa su queste fonti autorevoli. Ultimo aggiornamento: {formatItalianDate(c.updatedAt)}. Link verificati il{" "}
          {formatItalianDate(SOURCES_CHECKED_AT)}.
        </p>
        <ul className="divide-y divide-line border-y border-line">
          {c.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group -mx-2 flex min-h-11 items-start gap-3 rounded-xl px-2 py-3 transition-colors duration-150 ease-out hover:bg-surface-2"
              >
                <ExternalLink aria-hidden className="mt-1 size-4 shrink-0 text-primary" />
                <span>
                  <span className="block text-small font-bold text-ink-muted">
                    {s.publisher}
                    {s.lang === "en" && " (in inglese)"}
                  </span>
                  <span className="block font-bold text-primary group-hover:underline">{s.title}</span>
                  <span className="sr-only">(si apre in una nuova scheda)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </article>
  );
}
