"use client";

import { Building2, ChevronDown, Globe2, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { CatalogRequestError, fetchBrands } from "@/lib/medicines/client";
import { FORM_FAMILY_LABEL } from "@/lib/medicines/forms";
import { displayCompany, formatEuro, formatPriceDates, formatPriceRange, groupScope } from "@/lib/medicines/text";
import type { BrandsResponse, MedicineSummary } from "@/lib/medicines/types";

const VISIBLE = 6;

/**
 * Sotto ogni confezione: un riquadro da aprire con i marchi e le aziende che hanno lo stesso
 * principio attivo, la fascia di prezzo a parità di dosaggio e forma, una frase sul principio attivo
 * e i marchi più diffusi in Europa. I dati arrivano solo quando lo si apre.
 */
export function BrandsDisclosure({ medicine: m }: { medicine: MedicineSummary }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<{ data?: BrandsResponse; error?: string } | null>(null);
  const [all, setAll] = useState(false);
  const stats = m.stats;

  useEffect(() => {
    if (!open || state) return;
    const c = new AbortController();
    fetchBrands(m.aic, c.signal).then(
      (data) => setState({ data }),
      (e: unknown) => {
        if (!c.signal.aborted) setState({ error: e instanceof CatalogRequestError ? e.message : "Non riusciamo a caricare i marchi." });
      },
    );
    return () => c.abort();
  }, [open, state, m.aic]);

  if (!stats || stats.brands < 1) return null;
  const range = stats.priceMin !== null && stats.priceMax !== null ? formatPriceRange(stats.priceMin, stats.priceMax) : null;

  return (
    <details className="group rounded-2xl bg-surface-2" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-2xl px-3 py-2 [&::-webkit-details-marker]:hidden">
        <Building2 aria-hidden className="size-5 shrink-0 text-primary" />
        <span className="min-w-0 flex-1">
          <span className="block text-small font-bold">Marchi, aziende e prezzi</span>
          <span className="block text-[0.8125rem] text-ink-muted">
            {stats.brands === 1 ? "1 marchio" : `${stats.brands} marchi`}
            {range && <> · {range}</>}
          </span>
        </span>
        <ChevronDown aria-hidden className="size-5 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
      </summary>

      <div className="space-y-3 px-3 pb-3 pt-1 text-small">
        {!state && (
          <p aria-live="polite" className="flex items-center gap-2 text-ink-muted">
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
            Carico i marchi…
          </p>
        )}
        {state?.error && (
          <p role="alert" className="font-bold text-red">
            {state.error}
          </p>
        )}
        {state?.data && <BrandsBody data={state.data} medicine={m} all={all} onShowAll={() => setAll(true)} />}
      </div>
    </details>
  );
}

function BrandsBody({ data, medicine: m, all, onShowAll }: { data: BrandsResponse; medicine: MedicineSummary; all: boolean; onShowAll: () => void }) {
  const { brands, summary, europe } = data;
  const r = brands.range;
  const shown = all ? brands.brands : brands.brands.slice(0, VISIBLE);
  const otc = m.supplyCode === "OTC" || m.supplyCode === "SOP";
  const scope = groupScope(brands.dosage, FORM_FAMILY_LABEL[brands.formFamily], brands.form, brands.formFamily);
  const dates = formatPriceDates(brands.priceDates.from, brands.priceDates.to);

  return (
    <div className="space-y-3 animate-[sheet-fade_200ms_ease-out] motion-reduce:animate-none">
      {summary && (
        <p>
          <span className="font-bold">{summary.name}.</span> {summary.text}{" "}
          <Link href={`/mercato/${m.aic}#principio-attivo`} prefetch={false} className="font-bold text-primary underline underline-offset-2">
            Scheda del principio attivo
          </Link>
        </p>
      )}

      <div className="rounded-xl bg-surface p-3">
        <p className="font-bold">Fascia di prezzo{scope && <span className="font-normal text-ink-muted"> · {scope}</span>}</p>
        {r.priceMin !== null && r.priceMax !== null ? (
          <>
            <p className="text-heading font-bold tabular-nums">{formatPriceRange(r.priceMin, r.priceMax)}</p>
            <p className="text-[0.8125rem] text-ink-muted">
              {r.priced === 1 ? "1 confezione" : `${r.priced} confezioni`} con prezzo nelle liste AIFA
              {dates && <> ({dates})</>}. Il prezzo cambia anche con il numero di unità.
            </p>
          </>
        ) : (
          <p className="text-ink-muted">
            Le liste AIFA non riportano prezzi per questo dosaggio e forma.{otc && " Senza ricetta il prezzo lo decide la farmacia: chiedilo lì."}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="font-bold">
          {brands.brands.length === 1 ? "1 marchio" : `${brands.brands.length} marchi`} di {brands.companies === 1 ? "1 azienda" : `${brands.companies} aziende`}
        </p>
        <ul className="divide-y divide-line overflow-hidden rounded-xl bg-surface">
          {shown.map((b) => (
            <li key={b.name} className="flex items-start gap-3 px-3 py-2">
              <div className="min-w-0 flex-1">
                <Link href={`/mercato/${b.aic}`} prefetch={false} className="font-bold text-primary underline-offset-2 hover:underline">
                  {b.name}
                </Link>
                <p className="text-[0.8125rem] text-ink-muted">{b.companies.map(displayCompany).join(" · ")}</p>
              </div>
              <p className={cn("shrink-0 text-right text-[0.8125rem]", b.priceMin !== null ? "font-bold tabular-nums" : "text-ink-muted")}>
                {b.priceMin !== null && b.priceMax !== null
                  ? b.priceMin === b.priceMax
                    ? formatEuro(b.priceMin)
                    : `${formatEuro(b.priceMin)}–${formatEuro(b.priceMax)}`
                  : b.sameDosage
                    ? "prezzo non indicato"
                    : "altro dosaggio o forma"}
              </p>
            </li>
          ))}
        </ul>
        {!all && brands.brands.length > VISIBLE && (
          <button type="button" onClick={onShowAll} className="min-h-11 font-bold text-primary underline underline-offset-2">
            Mostra tutti i {brands.brands.length} marchi
          </button>
        )}
      </div>

      {europe && europe.names.length > 0 && (
        <p className="flex gap-2">
          <Globe2 aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            In Europa anche come <span className="font-bold">{europe.names.join(", ")}</span>
            {europe.total > europe.names.length && <> e altri {europe.total - europe.names.length} marchi</>}, in {europe.countries} Paesi.{" "}
            <Link href={`/mercato/${m.aic}#in-europa`} prefetch={false} className="font-bold text-primary underline underline-offset-2">
              Cerca per Paese
            </Link>
          </span>
        </p>
      )}
    </div>
  );
}
