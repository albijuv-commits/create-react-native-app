"use client";

import { Archive, Check, LoaderCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteSession, saveSession, type HistoryEntry } from "@/lib/storage/history";

type Status = "idle" | "saving" | "saved" | "removed" | "failed";

/**
 * Salvare la sessione è una scelta della persona: il consenso dell'intervista vale solo per
 * l'intervista. Lo storico resta su questo dispositivo e si può eliminare in qualsiasi momento.
 */
export function SaveToHistory({ entry }: { entry: HistoryEntry }) {
  const [status, setStatus] = useState<Status>("idle");

  const save = async () => {
    setStatus("saving");
    try {
      await saveSession(entry);
      setStatus("saved");
    } catch {
      setStatus("failed");
    }
  };

  const remove = async () => {
    try {
      await deleteSession(entry.id);
      setStatus("removed");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <section aria-labelledby="storico-titolo" className="space-y-3 rounded-3xl bg-surface-2 p-5">
      <h2 id="storico-titolo" className="font-bold">
        Storico delle sessioni
      </h2>
      {status === "saved" ? (
        <>
          <p className="flex items-start gap-2 text-small">
            <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
            <span>
              Salvata solo su questo dispositivo. La ritrovi nel{" "}
              <Link href="/profilo#storico" className="font-bold text-primary underline underline-offset-2">
                Profilo
              </Link>
              .
            </span>
          </p>
          <Button variant="ghost" onClick={() => void remove()} icon={<Trash2 aria-hidden className="size-5" />}>
            Elimina dallo storico
          </Button>
        </>
      ) : (
        <>
          <p className="text-small">
            {status === "removed"
              ? "Eliminata dallo storico: su questo dispositivo non resta."
              : "Puoi salvare questa sessione per rileggerla più avanti. Resta solo su questo dispositivo e la elimini quando vuoi."}
          </p>
          {status !== "removed" && (
            <Button
              variant="secondary"
              onClick={() => void save()}
              disabled={status === "saving"}
              icon={status === "saving" ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : <Archive aria-hidden className="size-5" />}
            >
              Salva nello storico
            </Button>
          )}
        </>
      )}
      <p aria-live="polite" className="text-small font-bold text-red empty:hidden">
        {status === "failed" ? "Non riusciamo a salvare qui: il browser non permette di conservare dati (per esempio in navigazione privata)." : ""}
      </p>
    </section>
  );
}
