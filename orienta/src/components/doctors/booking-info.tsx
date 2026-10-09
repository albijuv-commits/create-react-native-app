import prenota from "@/assets/illustrations/stato-prenota.webp";
import { TiltIllustration } from "@/components/ui/tilt-illustration";

/** Fonte verificata il 7 ottobre 2026: le prestazioni specialistiche si prescrivono sulla ricetta del SSN e si prenotano al CUP */
export const BOOKING_SOURCE = "https://www.salute.gov.it/new/it/tema/ricetta-elettronica-e-cup/";
const SOURCE = BOOKING_SOURCE;

export function BookingInfo() {
  return (
    <section aria-labelledby="come-prenotare" className="space-y-4 rounded-3xl border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <h2 id="come-prenotare" className="text-heading font-bold">
            Come prenotare
          </h2>
          <p className="text-small text-ink-muted">Dipende da come vuoi fare la visita.</p>
        </div>
        <TiltIllustration src={prenota} sizes="80px" className="w-20 shrink-0" />
      </div>
      <div className="space-y-3">
        <div className="space-y-1 rounded-2xl bg-surface-2 p-4">
          <h3 className="font-bold">Visita privata</h3>
          <p className="text-small">Contatta direttamente il medico o lo studio, per telefono o per email.</p>
        </div>
        <div className="space-y-2 rounded-2xl bg-surface-2 p-4">
          <h3 className="font-bold">Con il Servizio sanitario nazionale</h3>
          <ol className="space-y-2 text-small">
            <li className="flex gap-2">
              <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-[0.8125rem] font-bold text-on-primary">
                1
              </span>
              <span>Serve prima la ricetta del medico di base, la cosiddetta impegnativa.</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-[0.8125rem] font-bold text-on-primary">
                2
              </span>
              <span>
                Poi prenoti tramite il CUP, il Centro unico di prenotazione della tua regione: a seconda della regione allo sportello, per telefono,
                online o in farmacia.
              </span>
            </li>
          </ol>
        </div>
      </div>
      <p className="text-small text-ink-muted">
        Fonte:{" "}
        <a href={SOURCE} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline underline-offset-2">
          Ministero della Salute, Ricetta elettronica e CUP
          <span className="sr-only"> (si apre in una nuova scheda)</span>
        </a>
      </p>
    </section>
  );
}
