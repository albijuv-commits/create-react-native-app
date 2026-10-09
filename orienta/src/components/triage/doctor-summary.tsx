"use client";

import { Check, ClipboardCopy, FileDown, LoaderCircle, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import riepilogo from "@/assets/illustrations/riepilogo-medico.webp";
import { Button } from "@/components/ui/button";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { downloadSummaryPdf } from "@/lib/triage/pdf";

type Status = "idle" | "copiato" | "copia-fallita" | "pdf-in-corso" | "pdf-pronto" | "pdf-fallito";

const MESSAGES: Record<Status, string> = {
  idle: "",
  copiato: "Riepilogo copiato: puoi incollarlo in un messaggio o in una email.",
  "copia-fallita": "Non riusciamo a copiare da qui: seleziona il testo qui sotto e copialo a mano.",
  "pdf-in-corso": "Preparo il PDF…",
  "pdf-pronto": "PDF scaricato.",
  "pdf-fallito": "Non riusciamo a creare il PDF. Puoi copiare il testo.",
};

/** Il riepilogo da portare al medico: si legge qui, si copia, si scarica in PDF o si condivide. */
export function DoctorSummary({ text, generatedAt }: { text: string; generatedAt: Date }) {
  const [status, setStatus] = useState<Status>("idle");
  const [open, setOpen] = useState(false);
  const reset = useRef<number | null>(null);
  // Questa parte compare solo nel browser, dopo l'intervista: navigator è sempre disponibile
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(
    () => () => {
      if (reset.current !== null) window.clearTimeout(reset.current);
    },
    [],
  );

  const show = (next: Status, clearAfter?: number) => {
    setStatus(next);
    if (reset.current !== null) window.clearTimeout(reset.current);
    reset.current = clearAfter ? window.setTimeout(() => setStatus("idle"), clearAfter) : null;
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      show("copiato", 2500);
    } catch {
      setOpen(true);
      show("copia-fallita");
    }
  };

  const pdf = async () => {
    show("pdf-in-corso");
    try {
      await downloadSummaryPdf(text, generatedAt);
      show("pdf-pronto", 2500);
    } catch {
      show("pdf-fallito");
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: "Riepilogo per il medico", text });
    } catch {
      // La persona ha chiuso la finestra di condivisione: niente da segnalare
    }
  };

  return (
    <section aria-labelledby="riepilogo-titolo" className="space-y-3 rounded-3xl border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <h2 id="riepilogo-titolo" className="text-heading font-bold">
            Riepilogo per il medico
          </h2>
          <p className="text-small text-ink-muted">
            Racconta in modo ordinato cosa hai descritto e cosa hai risposto. Mostralo al medico o mandaglielo.
          </p>
        </div>
        <TiltIllustration src={riepilogo} sizes="80px" className="w-20 shrink-0" />
      </div>
      <div className={canShare ? "grid grid-cols-3 gap-2" : "grid grid-cols-2 gap-2"}>
        <Button variant="secondary" onClick={copy} icon={status === "copiato" ? <Check aria-hidden className="size-5" /> : <ClipboardCopy aria-hidden className="size-5" />}>
          {status === "copiato" ? "Copiato" : "Copia"}
        </Button>
        <Button
          variant="secondary"
          onClick={pdf}
          disabled={status === "pdf-in-corso"}
          icon={status === "pdf-in-corso" ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : <FileDown aria-hidden className="size-5" />}
        >
          PDF
        </Button>
        {canShare && (
          <Button variant="secondary" onClick={share} icon={<Share2 aria-hidden className="size-5" />}>
            Condividi
          </Button>
        )}
      </div>
      <p aria-live="polite" className="min-h-[1.45em] text-small font-bold text-primary">
        {MESSAGES[status]}
      </p>
      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="rounded-2xl bg-surface-2">
        <summary className="flex min-h-11 cursor-pointer items-center px-4 font-bold text-primary">Leggi il riepilogo</summary>
        <pre className="whitespace-pre-wrap px-4 pb-4 font-sans text-small">{text}</pre>
      </details>
    </section>
  );
}
