import { AlertTriangle, Atom, ExternalLink } from "lucide-react";
import { formulaWithSubscripts, INGREDIENTS_CHECKED_ON, type IngredientInfo } from "@/lib/medicines/ingredients";
import { formatItalianDay } from "@/lib/medicines/text";

const grams = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 });

/**
 * La scheda del principio attivo: cos'è dal punto di vista chimico, come agisce, gli effetti
 * indesiderati più frequenti secondo l'RCP, le fonti. Informazione generale, non un consiglio.
 */
export function IngredientSection({ info }: { info: IngredientInfo }) {
  return (
    <section id="principio-attivo" aria-labelledby="principio-titolo" className="scroll-mt-20 space-y-4">
      <div className="flex items-center gap-2">
        <Atom aria-hidden className="size-6 text-primary" />
        <h2 id="principio-titolo" className="text-heading font-bold">
          Il principio attivo: {info.name.toLowerCase()}
        </h2>
      </div>

      <div className="space-y-3 rounded-3xl border border-line bg-surface p-5">
        <h3 className="font-bold">Che cos&apos;è</h3>
        <p>{info.chemistry}</p>
        <ul className="flex flex-wrap gap-2" aria-label="Formula e massa molare">
          {info.molecules.map((mol) => (
            <li key={mol.pubchemCid} className="rounded-2xl bg-surface-2 px-3 py-2 text-small">
              {info.molecules.length > 1 && <span className="block font-bold">{mol.name}</span>}
              <span className="font-bold tabular-nums" aria-label={`Formula ${mol.formula.split("").join(" ")}`}>
                {formulaWithSubscripts(mol.formula)}
              </span>
              <span className="text-ink-muted"> · {grams.format(mol.molarMass)} g/mol</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2 rounded-3xl border border-line bg-surface p-5">
        <h3 className="font-bold">Come agisce e quali effetti ha</h3>
        <p>{info.action}</p>
      </div>

      <div className="space-y-2 rounded-3xl border border-line bg-surface p-5">
        <h3 className="font-bold">Effetti indesiderati</h3>
        <ul className="list-disc space-y-1.5 pl-5">
          {info.sideEffects.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="text-small text-ink-muted">
          Comune: fino a 1 persona su 10. Non comune: fino a 1 su 100. Raro: fino a 1 su 1.000. L&apos;elenco completo è nel foglietto illustrativo.
        </p>
      </div>

      {info.caution && (
        <p className="flex gap-3 rounded-3xl bg-amber-soft p-4 font-bold">
          <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-amber" />
          {info.caution}
        </p>
      )}

      <div className="space-y-1.5 text-small text-ink-muted">
        <p>
          Riassunto dal Riassunto delle Caratteristiche del Prodotto (RCP) ufficiale e da PubChem, verificati il {formatItalianDay(INGREDIENTS_CHECKED_ON)}. Sono
          informazioni generali sul principio attivo: non sostituiscono il foglietto illustrativo né il parere del medico o del farmacista.
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {info.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 font-bold text-primary underline underline-offset-2">
                {s.label}
                <ExternalLink aria-hidden className="size-3.5" />
                <span className="sr-only"> (si apre in una nuova scheda)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
