import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Intervista sui sintomi" };

export default function IntervistaPage() {
  return (
    <>
      <PageHeader title="Intervista" lead="Consenso, dati di base, descrizione e domande mirate." />
      <ComingSoon phase={3}>
        Qui arriveranno l&apos;intervista guidata, il controllo dei segnali d&apos;allarme e i risultati.
      </ComingSoon>
    </>
  );
}
