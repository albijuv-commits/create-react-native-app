import type { Metadata } from "next";
import { BODY_AREAS } from "@data/vocab/body";
import { ConditionList } from "@/components/conditions/condition-list";
import { PageHeader } from "@/components/ui/page-header";
import { conditionListItems } from "@/lib/conditions/catalog";

export const metadata: Metadata = {
  title: "Condizioni",
  description: "Schede chiare su cause, sintomi, cure e prevenzione di oltre 40 condizioni comuni, con un'animazione al microscopio.",
};

export default function CondizioniPage() {
  return (
    <>
      <PageHeader
        title="Condizioni"
        lead="Cause, sintomi, cure e quando andare dal medico, con un'animazione al microscopio per capire cosa succede nel corpo."
      />
      <ConditionList items={conditionListItems()} areas={BODY_AREAS.map((a) => ({ id: a.id, label: a.label }))} />
      <p className="pt-8 text-small text-ink-muted">
        Le schede sono informative: non sostituiscono il parere di un medico o di un farmacista.
      </p>
    </>
  );
}
