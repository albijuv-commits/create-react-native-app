import type { Metadata } from "next";
import { BODY_AREAS } from "@data/vocab/body";
import { ConditionList } from "@/components/conditions/condition-list";
import microscopio from "@/assets/illustrations/microscopio.webp";
import { ModelViewer } from "@/components/three/model-viewer";
import { conditionListItems } from "@/lib/conditions/catalog";

export const metadata: Metadata = {
  title: "Condizioni",
  description: "Schede chiare su cause, sintomi, cure e prevenzione di oltre 40 condizioni comuni, con un'animazione al microscopio.",
};

export default function CondizioniPage() {
  return (
    <>
      <header className="space-y-2 pb-4 pt-2">
        <div className="flex items-center gap-3">
          <h1 className="min-w-0 flex-1 text-display font-bold text-primary">Condizioni</h1>
          <ModelViewer
            src="/models/microscopio.glb"
            poster={microscopio}
            label="Un microscopio"
            initialRotation={[0, -Math.PI / 2, 0]}
            sizes="128px"
            priority
            hint="icon"
            className="w-32 shrink-0"
          />
        </div>
        <p className="text-body text-ink-muted">
          Cause, sintomi, cure e quando andare dal medico, con un&apos;animazione al microscopio per capire cosa succede nel corpo.
        </p>
      </header>
      <ConditionList items={conditionListItems()} areas={BODY_AREAS.map((a) => ({ id: a.id, label: a.label }))} />
      <p className="pt-8 text-small text-ink-muted">
        Le schede sono informative: non sostituiscono il parere di un medico o di un farmacista.
      </p>
    </>
  );
}
