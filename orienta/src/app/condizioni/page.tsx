import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Condizioni" };

export default function CondizioniPage() {
  return (
    <>
      <PageHeader title="Condizioni" lead="Schede chiare su cause, sintomi e cure, con un'animazione al microscopio." />
      <ComingSoon phase={2}>Base di conoscenza con oltre 40 condizioni, ricerca e filtro per area del corpo.</ComingSoon>
    </>
  );
}
