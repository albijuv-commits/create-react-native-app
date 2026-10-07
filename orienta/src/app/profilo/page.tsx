import type { Metadata } from "next";
import { PreferencesPanel } from "@/components/profile/preferences-panel";
import profilo from "@/assets/illustrations/sezione-profilo.webp";
import privacy from "@/assets/illustrations/stato-privacy.webp";
import { ComingSoon } from "@/components/ui/coming-soon";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Profilo" };

export default function ProfiloPage() {
  return (
    <>
      <PageHeader title="Profilo" lead="Nessun account: le tue preferenze restano su questo dispositivo." illustration={profilo} />
      <section aria-labelledby="preferenze" className="space-y-4 rounded-2xl bg-surface p-5">
        <h2 id="preferenze" className="text-heading font-bold">
          Preferenze
        </h2>
        <PreferencesPanel />
      </section>
      <div className="mt-6">
        <ComingSoon phase={6} illustration={privacy}>Città predefinita, storico delle sessioni, eliminazione dei dati, informativa privacy, avvertenze mediche e fonti.</ComingSoon>
      </div>
    </>
  );
}
