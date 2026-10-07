import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Medici" };

export default function MediciPage() {
  return (
    <>
      <PageHeader title="Medici" lead="Specialisti vicino a te, da contattare con un tocco." />
      <ComingSoon phase={4}>Ricerca per posizione o città, lista e mappa, chiamata, email e indicazioni.</ComingSoon>
    </>
  );
}
