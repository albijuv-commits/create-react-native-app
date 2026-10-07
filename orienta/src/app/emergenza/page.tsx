import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { ButtonAnchor } from "@/components/ui/button";

export const metadata: Metadata = { title: "Emergenza" };

/**
 * Schermata Emergenza generica. Nella fase 3 riceverà il motivo dal controllo dei
 * segnali d'allarme e mostrerà istruzioni specifiche per il caso.
 */
export default function EmergenzaPage() {
  return (
    <div className="space-y-6 pt-2">
      <header className="space-y-2">
        <h1 className="text-display font-bold text-red">Emergenza</h1>
        <p>Se pensi che la tua vita o quella di qualcun altro sia in pericolo, chiama subito.</p>
      </header>

      <ButtonAnchor
        href="tel:112"
        variant="danger"
        className="min-h-20 w-full text-title"
        icon={<Phone aria-hidden className="size-8" />}
      >
        Chiama il 112
      </ButtonAnchor>

      <section aria-labelledby="cosa-fare" className="space-y-3 rounded-2xl bg-red-soft p-5">
        <h2 id="cosa-fare" className="text-heading font-bold">
          Mentre aspetti i soccorsi
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Resta calmo e rispondi alle domande dell&apos;operatore: ti guiderà passo per passo.</li>
          <li>Di&apos; dove ti trovi nel modo più preciso possibile.</li>
          <li>Non restare da solo: chiedi aiuto a chi è vicino.</li>
          <li>Non prendere farmaci, cibo o bevande se non te lo dice l&apos;operatore.</li>
        </ul>
      </section>

      <p className="text-small text-ink-muted">
        Il 112 è il numero unico europeo per le emergenze ed è gratuito anche senza credito. Per problemi non urgenti
        di notte e nei festivi, dove attivo, puoi chiamare la guardia medica al 116117.
      </p>
    </div>
  );
}
