"use client";

import { LoaderCircle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import confronto from "@/assets/illustrations/stato-confronto.webp";
import { Button, ButtonLink } from "@/components/ui/button";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { cn } from "@/lib/cn";
import { CatalogRequestError, fetchMedicines } from "@/lib/medicines/client";
import { useDeviceList } from "@/lib/medicines/device-lists";
import { FORM_FAMILY_LABEL } from "@/lib/medicines/forms";
import { formatEuro, formatItalianDay } from "@/lib/medicines/text";
import { isIndicativePrice, MAX_COMPARE, type MedicineSummary } from "@/lib/medicines/types";
import { ReimbursableBadge, SupplyBadge } from "./badges";
import { MedicineImage } from "./medicine-card";

/**
 * Il confronto: fino a tre confezioni scelte dal catalogo, affiancate in una tabella. L'elenco resta
 * sul dispositivo; al server arrivano solo i codici AIC, nel corpo della richiesta.
 */
export function ComparePanel() {
  const compare = useDeviceList("confronto");
  const list = compare.list;
  const listKey = list.join(",");
  const [state, setState] = useState<{ key: string; items?: MedicineSummary[]; error?: string } | null>(null);

  useEffect(() => {
    if (!list.length) return;
    const c = new AbortController();
    fetchMedicines(list, c.signal).then(
      (items) => setState({ key: list.join(","), items }),
      (e: unknown) => {
        if (!c.signal.aborted) setState({ key: list.join(","), error: e instanceof CatalogRequestError ? e.message : "Il catalogo non è disponibile." });
      },
    );
    return () => c.abort();
  }, [list]);

  if (!list.length) {
    return (
      <div className="flex items-center gap-4 rounded-3xl bg-surface-2 p-5">
        <TiltIllustration src={confronto} sizes="96px" className="w-24 shrink-0" />
        <div className="space-y-2">
          <p className="font-bold">Non hai ancora scelto farmaci da confrontare.</p>
          <p className="text-small text-ink-muted">Nel catalogo tocca il pulsante del confronto su una confezione, fino a {MAX_COMPARE}.</p>
          <ButtonLink href="/mercato" variant="secondary">
            Vai al catalogo
          </ButtonLink>
        </div>
      </div>
    );
  }

  const current = state?.key === listKey ? state : null;
  if (!current) {
    return (
      <p aria-live="polite" className="flex items-center gap-2 font-bold">
        <LoaderCircle aria-hidden className="size-5 animate-spin text-primary" />
        Preparo il confronto…
      </p>
    );
  }
  if (current.error || !current.items) {
    return (
      <p role="alert" className="rounded-3xl bg-red-soft p-4 font-bold text-red">
        {current.error}
      </p>
    );
  }

  const items = current.items;
  const lowest = Math.min(...items.map((m) => m.price ?? Infinity));
  const rows: Array<[string, (m: MedicineSummary) => ReactNode]> = [
    [
      "Prezzo",
      (m) =>
        m.price === null ? (
          <span className="text-small text-ink-muted">Non presente nelle liste AIFA</span>
        ) : (
          <span className="space-y-0.5">
            <span className="block font-bold tabular-nums">{formatEuro(m.price)}</span>
            {isIndicativePrice(m) && <span className="block text-[0.8125rem] font-bold text-amber">prezzo indicativo</span>}
            {m.price === lowest && items.filter((x) => x.price !== null).length > 1 && (
              <span className="block text-[0.8125rem] font-bold text-accent">Il più basso tra questi</span>
            )}
            {m.priceDate && <span className="block text-[0.75rem] text-ink-muted">al {formatItalianDay(m.priceDate)}</span>}
          </span>
        ),
    ],
    ["Prezzo a unità", (m) => (m.price !== null && m.units ? <span className="tabular-nums">{formatEuro(m.price / m.units)}</span> : <span className="text-ink-muted">—</span>)],
    ["Principio attivo", (m) => m.activeIngredient],
    ["Dosaggio e confezione", (m) => m.description],
    ["Forma", (m) => `${m.form} (${FORM_FAMILY_LABEL[m.formFamily].toLowerCase()})`],
    ["Ricetta", (m) => <SupplyBadge code={m.supplyCode} />],
    ["Rimborsabile SSN", (m) => (m.reimbursementClass === "A" ? <ReimbursableBadge /> : <span className="text-ink-muted">No</span>)],
    ["Titolare", (m) => <span className="text-small">{m.company}</span>],
  ];

  return (
    <div className="space-y-4">
      <div className="-mx-4 overflow-x-auto px-4 pb-2">
        <table className="w-full min-w-[34rem] border-separate border-spacing-0 text-left text-small">
          <caption className="sr-only">Confronto tra {items.length} confezioni</caption>
          <thead>
            <tr>
              <td className="w-28" />
              {items.map((m) => (
                <th key={m.aic} scope="col" className="min-w-36 px-2 pb-3 align-top font-normal">
                  <div className="space-y-2 rounded-3xl bg-surface-2 p-3">
                    <div className="flex items-start justify-between gap-1">
                      <MedicineImage medicine={m} className="size-14" />
                      <button
                        type="button"
                        onClick={() => compare.remove(m.aic)}
                        className="-mr-1 -mt-1 grid size-11 place-items-center rounded-full text-ink-muted hover:bg-surface"
                      >
                        <X aria-hidden className="size-5" />
                        <span className="sr-only">Togli {m.name} dal confronto</span>
                      </button>
                    </div>
                    <Link href={`/mercato/${m.aic}`} className="block font-bold text-primary underline-offset-2 hover:underline">
                      {m.name}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, cell]) => (
              <tr key={label}>
                <th scope="row" className="border-t border-line py-3 pr-2 align-top text-[0.8125rem] font-bold text-ink-muted">
                  {label}
                </th>
                {items.map((m) => (
                  <td key={m.aic} className={cn("border-t border-line px-2 py-3 align-top")}>
                    {cell(m)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/mercato" variant="secondary">
          Aggiungi dal catalogo
        </ButtonLink>
        <Button variant="ghost" onClick={compare.clear}>
          Svuota il confronto
        </Button>
      </div>
      <p className="text-small text-ink-muted">Per scegliere un farmaco chiedi consiglio al medico o al farmacista.</p>
    </div>
  );
}
