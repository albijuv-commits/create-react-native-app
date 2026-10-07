import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { displayCompany } from "@/lib/medicines/text";
import type { MedicineSummary } from "@/lib/medicines/types";
import { ReimbursableBadge, SupplyBadge } from "./badges";
import { BrandsDisclosure } from "./brands-disclosure";
import { FormArt } from "./form-art";
import { CompareButton, FavoriteButton } from "./list-buttons";
import { Price } from "./price";

/** L'immagine del farmaco: una foto con licenza libera se c'è, altrimenti l'illustrazione della forma */
export function MedicineImage({ medicine: m, className }: { medicine: Pick<MedicineSummary, "imageUrl" | "formFamily">; className?: string }) {
  if (m.imageUrl) return <Image src={m.imageUrl} alt="" width={320} height={320} className={cn("rounded-xl bg-white object-contain", className)} />;
  return <FormArt family={m.formFamily} className={className} />;
}

/** Autore, licenza e fonte della foto; se la confezione è estera lo si dice */
export function PhotoCredit({ medicine: m, className }: { medicine: Pick<MedicineSummary, "imageCredit" | "imageSource" | "imageCountry">; className?: string }) {
  if (!m.imageCredit) return null;
  const foreign = m.imageCountry && m.imageCountry !== "Italia";
  return (
    <p className={cn("text-[0.75rem] text-ink-muted", className)}>
      {foreign && <span className="font-bold text-ink">Foto di una confezione venduta in {m.imageCountry}: può essere diversa da quella italiana. </span>}
      Foto:{" "}
      {m.imageSource ? (
        <a href={m.imageSource} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          {m.imageCredit}
          <span className="sr-only"> (si apre in una nuova scheda)</span>
        </a>
      ) : (
        m.imageCredit
      )}
    </p>
  );
}

/**
 * Una confezione nel catalogo: immagine, nome commerciale, principio attivo, dosaggio e confezione,
 * forma, produttore, prezzo con la sua data e badge. Linguaggio neutro: niente offerte né classifiche.
 */
export function MedicineCard({ medicine: m, note, className }: { medicine: MedicineSummary; note?: ReactNode; className?: string }) {
  const titleId = `farmaco-${m.aic}`;
  return (
    <article aria-labelledby={titleId} className={cn("space-y-3 rounded-3xl border border-line bg-surface p-4", className)}>
      <div className="flex gap-3">
        <Link
          href={`/mercato/${m.aic}`}
          tabIndex={-1}
          aria-hidden
          className="shrink-0 self-start rounded-2xl bg-surface-2 p-1 transition-transform duration-150 ease-out active:scale-95"
        >
          <MedicineImage medicine={m} className="size-18" />
        </Link>
        <div className="min-w-0 flex-1 space-y-1">
          {note}
          <h3 id={titleId} className="font-bold leading-snug">
            <Link href={`/mercato/${m.aic}`} className="underline-offset-2 hover:underline">
              {m.name}
            </Link>
          </h3>
          <p className="text-small font-bold text-primary">{m.activeIngredient}</p>
          <p className="text-small">{m.description}</p>
          <p className="text-[0.8125rem] text-ink-muted">
            {m.form} · {displayCompany(m.company)}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <SupplyBadge code={m.supplyCode} />
        {m.reimbursementClass === "A" && <ReimbursableBadge />}
      </div>
      <div className="flex items-end justify-between gap-3">
        <Price medicine={m} className="min-w-0" />
        <div className="flex shrink-0 gap-2">
          <FavoriteButton aic={m.aic} name={m.name} compact />
          <CompareButton aic={m.aic} name={m.name} compact />
        </div>
      </div>
      <PhotoCredit medicine={m} />
      <BrandsDisclosure medicine={m} />
    </article>
  );
}
