"use client";

import { Accessibility, Clock, Globe, Mail, Navigation, Phone, Star } from "lucide-react";
import { Button, ButtonAnchor } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { directionsUrl, type Platform } from "@/lib/doctors/contact";
import { formatDistance } from "@/lib/doctors/geo";
import type { Doctor, DoctorSource } from "@/lib/doctors/schema";

const RATING = new Intl.NumberFormat("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/**
 * Un professionista con i contatti a portata di pollice. Ogni pulsante compare solo se il dato
 * esiste davvero: niente email inventate, niente numeri di riempimento.
 */
export function DoctorCard({
  doctor: d,
  index,
  distance,
  source,
  platform,
  onEmail,
  highlighted = false,
}: {
  doctor: Doctor;
  index: number;
  distance: number;
  source: DoctorSource;
  platform: Platform;
  onEmail: (doctor: Doctor) => void;
  highlighted?: boolean;
}) {
  const titleId = `medico-${d.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  return (
    <article
      aria-labelledby={titleId}
      className={cn("space-y-3 rounded-3xl border bg-surface p-4", highlighted ? "border-2 border-primary" : "border-line")}
    >
      <div className="flex gap-3">
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-bold tabular-nums text-on-primary">
          {index}
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 id={titleId} className="font-bold leading-snug">
            <span className="sr-only">{index}. </span>
            {d.name}
            {d.unnamed && <span className="font-normal text-ink-muted"> (nome non indicato)</span>}
          </h3>
          <p className="text-small text-ink-muted">
            {d.category} · a {formatDistance(distance)}
          </p>
          {d.specialties.length > 0 && (
            <ul aria-label="Specialità" className="flex flex-wrap gap-1.5">
              {d.specialties.map((s) => (
                <li key={s} className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[0.8125rem] font-bold text-primary">
                  {s}
                </li>
              ))}
            </ul>
          )}
          {d.address && <p className="text-small">{d.address}</p>}
          {d.phone && <p className="text-small tabular-nums">Tel. {d.phone.display}</p>}
          {d.rating && (
            <p className="flex items-center gap-1.5 text-small">
              <Star aria-hidden className="size-4 fill-amber text-amber" />
              {RATING.format(d.rating.value)} su 5 · {d.rating.count === 1 ? "1 recensione" : `${d.rating.count} recensioni`} su Google
            </p>
          )}
          {d.openNow !== null && (
            <p className={cn("flex items-center gap-1.5 text-small font-bold", d.openNow ? "text-calm" : "text-ink-muted")}>
              <Clock aria-hidden className="size-4" />
              {d.openNow ? "Aperto adesso" : "Chiuso adesso"}
            </p>
          )}
          {d.hours && (
            <details className="text-small">
              <summary className="inline-flex min-h-11 cursor-pointer items-center font-bold text-primary">Orari</summary>
              <ul className="space-y-0.5 pb-1">
                {d.hours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </details>
          )}
          {d.wheelchair && (
            <p className="flex items-center gap-1.5 text-small">
              <Accessibility aria-hidden className="size-4 text-primary" />
              Ingresso accessibile in sedia a rotelle
            </p>
          )}
          {source === "esempio" && (
            <p className="inline-block rounded-md border-2 border-dashed border-amber px-2 py-0.5 text-[0.8125rem] font-bold text-amber">DATI DI ESEMPIO</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 [&>*:last-child:nth-child(odd)]:col-span-2">
        {d.phone && (
          <ButtonAnchor href={d.phone.href} icon={<Phone aria-hidden className="size-5" />}>
            Chiama
          </ButtonAnchor>
        )}
        {d.email && (
          <Button variant="secondary" onClick={() => onEmail(d)} icon={<Mail aria-hidden className="size-5" />}>
            Email
          </Button>
        )}
        {d.website && (
          <ButtonAnchor href={d.website} target="_blank" rel="noopener noreferrer" variant="secondary" icon={<Globe aria-hidden className="size-5" />}>
            Sito<span className="sr-only"> (si apre in una nuova scheda)</span>
          </ButtonAnchor>
        )}
        <ButtonAnchor
          href={directionsUrl(d, platform)}
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          icon={<Navigation aria-hidden className="size-5" />}
        >
          Indicazioni<span className="sr-only"> (si apre nell&apos;app delle mappe)</span>
        </ButtonAnchor>
      </div>

      {d.attributions.length > 0 && (
        <p className="text-[0.8125rem] text-ink-muted">
          Dati:{" "}
          {d.attributions.map((a, i) => (
            <span key={a.provider}>
              {i > 0 && ", "}
              {a.uri ? (
                <a href={a.uri} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  {a.provider}
                </a>
              ) : (
                a.provider
              )}
            </span>
          ))}
        </p>
      )}
    </article>
  );
}
