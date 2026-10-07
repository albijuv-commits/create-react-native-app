import { Building2 } from "lucide-react";
import Link from "next/link";
import { FORM_FAMILY_LABEL } from "@/lib/medicines/forms";
import { displayCompany, formatEuro, formatPriceDates, formatPriceRange, groupScope } from "@/lib/medicines/text";
import type { BrandEntry, BrandsInfo } from "@/lib/medicines/types";

const FIRST = 10;

function BrandRow({ b, selfName }: { b: BrandEntry; selfName: string }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        {b.name === selfName ? (
          <p className="font-bold">
            {b.name} <span className="text-small font-normal text-ink-muted">(questo marchio)</span>
          </p>
        ) : (
          <Link href={`/mercato/${b.aic}`} className="font-bold text-primary underline-offset-2 hover:underline">
            {b.name}
          </Link>
        )}
        <p className="text-[0.8125rem] text-ink-muted">
          {b.companies.map(displayCompany).join(" · ")} · {b.packages === 1 ? "1 confezione" : `${b.packages} confezioni`}
        </p>
      </div>
      <p className="shrink-0 text-right text-small">
        {b.priceMin !== null && b.priceMax !== null ? (
          <span className="font-bold tabular-nums">{b.priceMin === b.priceMax ? formatEuro(b.priceMin) : `${formatEuro(b.priceMin)}–${formatEuro(b.priceMax)}`}</span>
        ) : (
          <span className="text-ink-muted">{b.sameDosage ? "prezzo non indicato" : "altro dosaggio o forma"}</span>
        )}
      </p>
    </li>
  );
}

/**
 * Tutti i marchi e le aziende con lo stesso principio attivo, con la fascia di prezzo a parità di
 * dosaggio e forma. Ordine: prima chi ha lo stesso dosaggio e la stessa forma, poi alfabetico.
 */
export function BrandsSection({ brands, selfName, otc }: { brands: BrandsInfo; selfName: string; otc: boolean }) {
  const r = brands.range;
  const scope = groupScope(brands.dosage, FORM_FAMILY_LABEL[brands.formFamily], brands.form, brands.formFamily);
  const dates = formatPriceDates(brands.priceDates.from, brands.priceDates.to);
  const first = brands.brands.slice(0, FIRST);
  const rest = brands.brands.slice(FIRST);
  return (
    <section id="marchi" aria-labelledby="marchi-titolo" className="scroll-mt-20 space-y-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Building2 aria-hidden className="size-6 text-primary" />
          <h2 id="marchi-titolo" className="text-heading font-bold">
            Marchi e aziende
          </h2>
        </div>
        <p className="text-small text-ink-muted">
          {brands.brands.length === 1 ? "1 marchio" : `${brands.brands.length} marchi`} e {brands.companies === 1 ? "1 azienda" : `${brands.companies} aziende`}{" "}
          con lo stesso principio attivo ({brands.ingredient.toLowerCase()}), in {brands.packages === 1 ? "1 confezione" : `${brands.packages} confezioni`}.
        </p>
      </div>

      <div className="rounded-3xl bg-surface-2 p-5">
        <p className="font-bold">
          Fascia di prezzo{scope && <span className="font-normal text-ink-muted"> · {scope}</span>}
        </p>
        {r.priceMin !== null && r.priceMax !== null ? (
          <>
            <p className="text-title font-bold tabular-nums">{formatPriceRange(r.priceMin, r.priceMax)}</p>
            <p className="text-small text-ink-muted">
              Su {r.priced === 1 ? "1 confezione" : `${r.priced} confezioni`} con prezzo nelle liste AIFA{dates && <>, {dates}</>}.
              Dentro la fascia ci sono confezioni con un numero di unità diverso: per un confronto alla pari guarda i farmaci equivalenti.
            </p>
          </>
        ) : (
          <p className="text-small text-ink-muted">
            Le liste AIFA non riportano prezzi per questo dosaggio e forma.{otc && " Senza ricetta il prezzo lo decide la farmacia: chiedilo lì."}
          </p>
        )}
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
        {first.map((b) => (
          <BrandRow key={b.name} b={b} selfName={selfName} />
        ))}
      </ul>
      {rest.length > 0 && (
        <details className="group">
          <summary className="flex min-h-11 cursor-pointer items-center font-bold text-primary">Mostra gli altri {rest.length} marchi</summary>
          <ul className="mt-2 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
            {rest.map((b) => (
              <BrandRow key={b.name} b={b} selfName={selfName} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
