import type { Metadata } from "next";
import medici from "@/assets/illustrations/sezione-medici.webp";
import mappa from "@/assets/illustrations/stato-mappa.webp";
import { SpecialistGrid } from "@/components/doctors/specialist-grid";
import { ComingSoon } from "@/components/ui/coming-soon";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Medici" };

export default function MediciPage() {
  return (
    <>
      <PageHeader title="Medici" lead="Specialisti vicino a te, da contattare con un tocco." illustration={medici} />
      <div className="space-y-8">
        <SpecialistGrid />
        <ComingSoon phase={4} illustration={mappa}>Ricerca per posizione o città, lista e mappa, chiamata, email e indicazioni.</ComingSoon>
      </div>
    </>
  );
}
