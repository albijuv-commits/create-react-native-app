"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { eraseAllMyData, type ErasePart } from "@/lib/storage/erase";

type Status = { kind: "idle" } | { kind: "busy" } | { kind: "done"; failed: ErasePart[] };

/** «Elimina tutti i miei dati»: con una conferma, perché non si può annullare */
export function EraseData() {
  const dialog = useRef<HTMLDialogElement>(null);
  const result = useRef<HTMLParagraphElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const confirm = async () => {
    setStatus({ kind: "busy" });
    const { failed } = await eraseAllMyData();
    dialog.current?.close();
    setStatus({ kind: "done", failed });
    window.setTimeout(() => result.current?.focus(), 0);
  };

  return (
    <div className="space-y-3">
      <Button variant="danger" onClick={() => dialog.current?.showModal()} icon={<Trash2 aria-hidden className="size-5" />}>
        Elimina tutti i miei dati
      </Button>
      {status.kind === "done" && (
        <p ref={result} tabIndex={-1} role="status" className="rounded-2xl bg-surface-2 p-4 text-small font-bold focus:outline-none">
          {status.failed.length === 0
            ? "Fatto: su questo dispositivo non resta nessun dato di Orienta."
            : `Quasi tutto eliminato. Non siamo riusciti a cancellare: ${status.failed.join(", ")}. Puoi farlo dalle impostazioni del browser, cancellando i dati del sito.`}
        </p>
      )}

      <dialog
        ref={dialog}
        aria-labelledby="elimina-titolo"
        aria-describedby="elimina-testo"
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-3xl bg-surface p-5 text-ink shadow-xl backdrop:bg-ink/50"
      >
        <div className="space-y-3">
          <h2 id="elimina-titolo" className="text-heading font-bold">
            Eliminare tutti i tuoi dati?
          </h2>
          <div id="elimina-testo" className="space-y-2 text-small">
            <p>Da questo dispositivo spariscono:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>lo storico delle sessioni;</li>
              <li>le preferenze e la città predefinita;</li>
              <li>i preferiti e il confronto del Mercato;</li>
              <li>il riepilogo pronto per l&apos;email al medico;</li>
              <li>le pagine salvate per l&apos;uso senza rete (restano Emergenza e la pagina offline).</li>
            </ul>
            <p className="font-bold">Non si può annullare.</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              variant="danger"
              onClick={() => void confirm()}
              disabled={status.kind === "busy"}
              icon={status.kind === "busy" ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : <Trash2 aria-hidden className="size-5" />}
            >
              Sì, elimina tutto
            </Button>
            <Button variant="ghost" onClick={() => dialog.current?.close()} autoFocus>
              Annulla
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
