"use client";

import { Check, ClipboardCopy, Mail, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button, ButtonAnchor } from "@/components/ui/button";
import { buildDoctorEmail, mailtoHref } from "@/lib/doctors/email";
import type { Doctor } from "@/lib/doctors/schema";

/**
 * Prima di aprire l'app di posta la persona vede a chi scrive e cosa: può togliere il riepilogo
 * dei sintomi, leggere il testo o copiarlo. Poi lo rivede e lo invia lei, dalla sua app.
 */
export function EmailSheet({
  doctor,
  specialtyLabel,
  summary,
  onClose,
}: {
  doctor: Doctor | null;
  specialtyLabel: string | null;
  summary: string | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [include, setInclude] = useState(true);
  const [copied, setCopied] = useState(false);
  const reset = useRef<number | null>(null);
  const titleId = useId();
  const checkboxId = useId();

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (doctor && !el.open) el.showModal();
    if (!doctor && el.open) el.close();
  }, [doctor]);

  useEffect(
    () => () => {
      if (reset.current !== null) window.clearTimeout(reset.current);
    },
    [],
  );

  const to = doctor?.email ?? null;
  const email = buildDoctorEmail({ specialtyLabel, summary: include ? summary : null });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`A: ${to}\nOggetto: ${email.subject}\n\n${email.body}`);
      setCopied(true);
      if (reset.current !== null) window.clearTimeout(reset.current);
      reset.current = window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      className="sheet mx-auto mb-0 mt-auto max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface p-0 text-ink backdrop:bg-black/50"
    >
      {doctor && to && (
        <div className="space-y-4 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex items-start gap-3">
            <h2 id={titleId} className="min-w-0 flex-1 text-heading font-bold">
              Email a {doctor.name}
            </h2>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="-mr-2 -mt-1 grid size-11 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-surface-2"
            >
              <X aria-hidden className="size-6" />
              <span className="sr-only">Chiudi</span>
            </button>
          </div>
          <p className="text-small text-ink-muted">Si apre la tua app di posta con il testo già scritto: rileggilo, completalo con il tuo nome e invialo tu.</p>

          <dl className="space-y-1 rounded-2xl bg-surface-2 p-4 text-small">
            <div className="flex gap-2">
              <dt className="font-bold">A:</dt>
              <dd className="min-w-0 break-all">{to}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-bold">Oggetto:</dt>
              <dd className="min-w-0">{email.subject}</dd>
            </div>
          </dl>

          {summary && (
            <label htmlFor={checkboxId} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border-2 border-line p-3">
              <input id={checkboxId} type="checkbox" checked={include} onChange={(e) => setInclude(e.target.checked)} className="mt-0.5 size-6 shrink-0 accent-primary" />
              <span>
                <span className="block font-bold">Aggiungi il riepilogo dei sintomi</span>
                <span className="block text-small text-ink-muted">Quello preparato con l&apos;intervista. Lo vedrai prima di inviare.</span>
              </span>
            </label>
          )}

          <details className="rounded-2xl bg-surface-2">
            <summary className="flex min-h-11 cursor-pointer items-center px-4 font-bold text-primary">Leggi il testo</summary>
            <pre className="whitespace-pre-wrap px-4 pb-4 font-sans text-small">{email.body}</pre>
          </details>

          <div className="grid gap-2">
            <ButtonAnchor href={mailtoHref(to, email)} size="lg" icon={<Mail aria-hidden className="size-6" />}>
              Apri l&apos;app di posta
            </ButtonAnchor>
            <Button variant="secondary" onClick={copy} icon={copied ? <Check aria-hidden className="size-5" /> : <ClipboardCopy aria-hidden className="size-5" />}>
              {copied ? "Testo copiato" : "Copia il testo"}
            </Button>
          </div>
          <p aria-live="polite" className="sr-only">
            {copied ? "Testo dell'email copiato." : ""}
          </p>
        </div>
      )}
    </dialog>
  );
}
