import { ExternalLink, Store } from "lucide-react";
import { formatItalianDay } from "@/lib/medicines/text";
import type { CatalogInfo } from "@/lib/medicines/types";

const ONLINE_CHECK = "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm";
const AIFA_LISTS = "https://www.aifa.gov.it/liste-dei-farmaci";

/** Il campione per lo sviluppo: dati AIFA veri ma pochi e fermi a una data */
export function ExampleDataNotice({ count }: { count: number }) {
  return (
    <div role="note" className="space-y-1 rounded-2xl border-2 border-dashed border-amber bg-amber-soft p-4">
      <p className="font-bold text-amber">DATI DI ESEMPIO</p>
      <p className="text-small">
        {count} confezioni prese dalle liste dell&apos;AIFA per provare il Mercato: non è il catalogo completo e i prezzi non si aggiornano.
      </p>
    </div>
  );
}

/** Catalogo informativo, non un negozio */
export function CatalogNotice() {
  return (
    <div className="flex gap-3 rounded-3xl bg-surface-2 p-4">
      <Store aria-hidden className="mt-0.5 size-6 shrink-0 text-primary" />
      <div className="space-y-1.5 text-small">
        <p className="font-bold text-body">Qui non si compra: è un catalogo informativo.</p>
        <p>
          I farmaci con ricetta non si possono vendere online; quelli senza ricetta solo da farmacie e parafarmacie autorizzate. Orienta non suggerisce
          farmaci per i tuoi sintomi: per scegliere, chiedi al medico o al farmacista.
        </p>
        <a href={ONLINE_CHECK} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-bold text-primary underline underline-offset-2">
          Verifica un sito di vendita online
          <ExternalLink aria-hidden className="size-4" />
          <span className="sr-only"> (Ministero della Salute, si apre in una nuova scheda)</span>
        </a>
      </div>
    </div>
  );
}

/** Fonte e date dei dati, sempre visibili */
export function CatalogSource({ info }: { info: CatalogInfo }) {
  return (
    <p className="text-small text-ink-muted">
      Fonte:{" "}
      <a href={AIFA_LISTS} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline underline-offset-2">
        AIFA, Open Data
        <span className="sr-only"> (si apre in una nuova scheda)</span>
      </a>{" "}
      (licenza CC BY 4.0).
      {info.registryDate && <> Anagrafica dei farmaci al {formatItalianDay(info.registryDate)}.</>}
      {info.transparencyDate && <> Prezzi della lista di trasparenza al {formatItalianDay(info.transparencyDate)}</>}
      {info.classADate && <>{info.transparencyDate ? ", " : " Prezzi "}delle liste di Classe A e H al {formatItalianDay(info.classADate)}</>}
      {(info.transparencyDate || info.classADate) && "."}
    </p>
  );
}
