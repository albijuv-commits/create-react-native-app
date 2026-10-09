"use client";

import { ChevronDown, ClipboardCopy, Clock, FileDown, House, LoaderCircle, Siren, Stethoscope, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, type ComponentType, type SVGProps } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { URGENCY, type UrgencyLevel } from "@/lib/design/urgency";
import { clearSessions, deleteSession, type HistoryEntry } from "@/lib/storage/history";
import { useHistory } from "@/lib/storage/use-history";
import { downloadSummaryPdf } from "@/lib/triage/pdf";

const ICONS: Record<UrgencyLevel, ComponentType<SVGProps<SVGSVGElement>>> = { home: House, gp: Stethoscope, soon: Clock, er: Siren };
const COMPATIBILITY = { alta: "compatibilità alta", media: "compatibilità media", bassa: "compatibilità bassa" } as const;
const when = new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeStyle: "short" });

function Entry({ entry }: { entry: HistoryEntry }) {
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const meta = URGENCY[entry.urgency];
  const Icon = ICONS[entry.urgency];
  const at = new Date(entry.createdAt);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(entry.summary);
      setMessage("Riepilogo copiato.");
    } catch {
      setMessage("Non riusciamo a copiare da qui: seleziona il testo e copialo a mano.");
    }
  };
  const pdf = async () => {
    setBusy(true);
    try {
      await downloadSummaryPdf(entry.summary, at);
      setMessage("PDF scaricato.");
    } catch {
      setMessage("Non riusciamo a creare il PDF. Puoi copiare il testo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="space-y-3 rounded-3xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-full", meta.tone.bg, meta.tone.text)}>
          <Icon aria-hidden className="size-6" />
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-small text-ink-muted">
            <time dateTime={entry.createdAt}>{when.format(at)}</time> · {entry.age} anni · {entry.source === "ai" ? "con l'AI" : "metodo semplificato"}
          </p>
          <p className={cn("font-bold", meta.tone.text)}>{meta.label}</p>
          {entry.unidentified || entry.conditions.length === 0 ? (
            <p className="text-small">Nessuna corrispondenza chiara con le schede di Orienta.</p>
          ) : (
            <ul className="text-small">
              {entry.conditions.map((c) => (
                <li key={c.id}>
                  <Link href={`/condizioni/${c.id}`} className="font-bold text-primary underline-offset-2 hover:underline">
                    {c.name}
                  </Link>
                  <span className="text-ink-muted">, {COMPATIBILITY[c.compatibility]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <details className="group rounded-2xl bg-surface-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 font-bold text-primary [&::-webkit-details-marker]:hidden">
          <span className="flex-1">Riepilogo per il medico</span>
          <ChevronDown aria-hidden className="size-5 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
        <div className="space-y-3 px-4 pb-4">
          <pre className="whitespace-pre-wrap font-sans text-small">{entry.summary}</pre>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => void copy()} icon={<ClipboardCopy aria-hidden className="size-5" />}>
              Copia
            </Button>
            <Button
              variant="secondary"
              onClick={() => void pdf()}
              disabled={busy}
              icon={busy ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : <FileDown aria-hidden className="size-5" />}
            >
              PDF
            </Button>
          </div>
        </div>
      </details>

      {confirm ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-red-soft p-3">
          <p className="w-full text-small font-bold">Eliminare questa sessione dallo storico?</p>
          <Button variant="danger" onClick={() => void deleteSession(entry.id).catch(() => setMessage("Non riusciamo a eliminarla. Riprova."))}>
            Sì, elimina
          </Button>
          <Button variant="ghost" onClick={() => setConfirm(false)}>
            Annulla
          </Button>
        </div>
      ) : (
        <Button variant="ghost" onClick={() => setConfirm(true)} icon={<Trash2 aria-hidden className="size-5" />}>
          Elimina
        </Button>
      )}
      <p aria-live="polite" className="text-small font-bold text-primary empty:hidden">
        {message}
      </p>
    </li>
  );
}

/** Le sessioni salvate su questo dispositivo, dalla più recente */
export function HistoryList() {
  const history = useHistory();
  const [confirmAll, setConfirmAll] = useState(false);

  if (history.status === "loading") {
    return (
      <p aria-live="polite" className="flex items-center gap-2 text-small text-ink-muted">
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
        Apro lo storico…
      </p>
    );
  }
  if (history.status === "unavailable") {
    return <p className="rounded-2xl bg-surface-2 p-4 text-small">Questo browser non permette di conservare lo storico (per esempio in navigazione privata).</p>;
  }
  if (history.sessions.length === 0) {
    return (
      <div className="space-y-3 rounded-2xl bg-surface-2 p-4">
        <p className="text-small">
          Non hai sessioni salvate. Alla fine di un&apos;intervista puoi salvarla con «Salva nello storico»: resta solo su questo dispositivo.
        </p>
        <ButtonLink href="/sintomi/intervista" variant="secondary">
          Inizia un&apos;intervista
        </ButtonLink>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-small text-ink-muted">
        {history.sessions.length === 1 ? "1 sessione salvata" : `${history.sessions.length} sessioni salvate`} su questo dispositivo.
      </p>
      <ul className="space-y-3">
        {history.sessions.map((e) => (
          <Entry key={e.id} entry={e} />
        ))}
      </ul>
      {confirmAll ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-red-soft p-3">
          <p className="w-full text-small font-bold">Eliminare tutte le sessioni dello storico?</p>
          <Button variant="danger" onClick={() => void clearSessions().finally(() => setConfirmAll(false))}>
            Sì, svuota lo storico
          </Button>
          <Button variant="ghost" onClick={() => setConfirmAll(false)}>
            Annulla
          </Button>
        </div>
      ) : (
        <Button variant="ghost" onClick={() => setConfirmAll(true)} icon={<Trash2 aria-hidden className="size-5" />}>
          Svuota lo storico
        </Button>
      )}
    </div>
  );
}
