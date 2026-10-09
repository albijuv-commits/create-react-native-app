import { ArrowLeft, ExternalLink, FileDown, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { atcGroupLabel } from "@/lib/medicines/atc";
import type { EuBrandsView } from "@/lib/medicines/eu-brands-data";
import { FORM_FAMILY_LABEL } from "@/lib/medicines/forms";
import type { IngredientInfo } from "@/lib/medicines/ingredients";
import { supplyBadge, SUPPLY_BADGE_LABEL, SUPPLY_CODE_DESCRIPTION, type SupplyCode } from "@/lib/medicines/regime";
import type { Medicine } from "@/lib/medicines/schema";
import { displayCompany, formatEuro, formatItalianDay, sentenceCase } from "@/lib/medicines/text";
import type { BrandsInfo, CatalogInfo, MedicineSummary } from "@/lib/medicines/types";
import { ReimbursableBadge, SupplyBadge } from "./badges";
import { BrandsSection } from "./brands-section";
import { EuBrands } from "./eu-brands";
import { IngredientSection } from "./ingredient-section";
import { ExampleDataNotice } from "./notices";
import { MedicineImage, PhotoCredit } from "./medicine-card";
import { CompareButton, FavoriteButton } from "./list-buttons";
import { Price } from "./price";

const ONLINE_CHECK = "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm";
const EQUIVALENTS_FAQ = "https://www.aifa.gov.it/domande-e-risposte-su-farmaci-equivalenti";
const EQUIVALENTS_FIRST = 8;

function EquivalentRow({ g, self, lowest, markLowest }: { g: MedicineSummary; self: boolean; lowest: number | null; markLowest: boolean }) {
  const isLowest = lowest !== null && g.price === lowest;
  return (
    <li className={cn("flex items-center gap-3 px-4 py-3", self && "bg-primary-soft")}>
      <div className="min-w-0 flex-1">
        {self ? (
          <p className="font-bold">
            {g.name} <span className="text-small font-normal text-ink-muted">(questa confezione)</span>
          </p>
        ) : (
          <Link href={`/mercato/${g.aic}`} prefetch={false} className="font-bold text-primary underline-offset-2 hover:underline">
            {g.name}
          </Link>
        )}
        <p className="text-[0.8125rem] text-ink-muted">{displayCompany(g.company)}</p>
        {isLowest && markLowest && <p className="text-[0.8125rem] font-bold text-accent">Prezzo più basso del gruppo</p>}
      </div>
      <p className={cn("shrink-0 text-right font-bold tabular-nums", isLowest && !markLowest && "text-accent")}>
        {g.price !== null ? formatEuro(g.price) : <span className="text-small font-normal text-ink-muted">Prezzo non indicato</span>}
      </p>
    </li>
  );
}

function asSummary(m: Medicine): MedicineSummary {
  return {
    aic: m.aic,
    name: m.name,
    description: m.description,
    activeIngredient: m.activeIngredient,
    ingredientKey: m.ingredientKey,
    strength: m.strength,
    company: m.company,
    form: m.form,
    formFamily: m.formFamily as MedicineSummary["formFamily"],
    supplyCode: m.supplyCode as SupplyCode | null,
    reimbursementClass: m.reimbursementClass === "A" || m.reimbursementClass === "H" ? m.reimbursementClass : null,
    price: m.price,
    priceDate: m.priceDate,
    units: m.units,
    imageUrl: m.imageUrl,
    imageCredit: m.imageCredit,
    imageSource: m.imageSource,
    imageCaption: m.imageCaption,
    imageCountry: m.imageCountry,
    stats: null,
  };
}

/** Dove si trova e cosa serve, secondo il regime di fornitura */
function whereToGet(code: SupplyCode | null): string {
  switch (supplyBadge(code)) {
    case "senza-ricetta":
      return "Si compra in farmacia o in parafarmacia. Online solo nei siti autorizzati dal Ministero della Salute, riconoscibili dal logo identificativo.";
    case "con-ricetta":
      return "Si ritira in farmacia con la ricetta. I medicinali con ricetta non si possono vendere online.";
    case "ospedaliero":
    case "specialista":
      return "Non si compra in farmacia.";
    default:
      return "Il regime di fornitura non è indicato nei dati AIFA: chiedi al farmacista.";
  }
}

export interface MedicineDetailProps {
  medicine: Medicine;
  equivalents: MedicineSummary[];
  info: CatalogInfo;
  ingredient: IngredientInfo | null;
  brands: BrandsInfo | null;
  europe: EuBrandsView | null;
}

/**
 * La scheda di una confezione: informazioni principali, foglietto illustrativo ufficiale, avviso di
 * chiedere consiglio, il principio attivo, farmaci equivalenti dal più economico, marchi e aziende,
 * gli stessi principi attivi in Europa. Niente linguaggio pubblicitario.
 */
export function MedicineDetail({ medicine: m, equivalents, info, ingredient, brands, europe }: MedicineDetailProps) {
  const summary = asSummary(m);
  const code = summary.supplyCode;
  const sorted = [summary, ...equivalents].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity) || a.name.localeCompare(b.name, "it"));
  // La confezione aperta resta sempre visibile tra le prime righe dell'elenco
  const selfIndex = sorted.findIndex((g) => g.aic === m.aic);
  const group = selfIndex >= EQUIVALENTS_FIRST ? [...sorted.slice(0, EQUIVALENTS_FIRST - 1), sorted[selfIndex]!, ...sorted.filter((_, i) => i >= EQUIVALENTS_FIRST - 1 && i !== selfIndex)] : sorted;
  const lowest = group.find((g) => g.price !== null)?.price ?? null;
  const lowestCount = lowest === null ? 0 : group.filter((g) => g.price === lowest).length;
  const atcLabel = atcGroupLabel(m.atcGroup);
  const otc = code === "OTC" || code === "SOP";
  const sections = [
    { id: "prezzo-titolo", label: "Prezzo" },
    ingredient && { id: "principio-attivo", label: "Principio attivo" },
    { id: "equivalenti", label: "Equivalenti" },
    brands && brands.brands.length > 1 && { id: "marchi", label: "Marchi e aziende" },
    europe && { id: "in-europa", label: "In Europa" },
  ].filter((s): s is { id: string; label: string } => Boolean(s));

  return (
    <article className="space-y-6">
      <Link href="/mercato" className="inline-flex min-h-11 items-center gap-1.5 font-bold text-primary">
        <ArrowLeft aria-hidden className="size-5" />
        Catalogo
      </Link>

      {info.source === "esempio" && <ExampleDataNotice count={info.count} />}

      <header className="space-y-3">
        <div className="flex items-start gap-4">
          <div className={cn("shrink-0 rounded-3xl p-2", m.imageUrl ? "bg-white" : "bg-surface-2")}>
            <MedicineImage medicine={summary} className={m.imageUrl ? "size-32" : "size-28"} />
          </div>
          <div className="min-w-0 space-y-1.5 pt-1">
            <p className="text-small font-bold text-primary">{m.activeIngredient}</p>
            <h1 className="text-title font-bold leading-tight">{m.name}</h1>
            <p className="text-small">{m.description}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <SupplyBadge code={code} />
              {m.reimbursementClass === "A" && <ReimbursableBadge />}
            </div>
          </div>
        </div>
        {m.imageUrl && (
          <div className="space-y-0.5">
            {m.imageCaption && <p className="text-small">Nella foto: {m.imageCaption}.</p>}
            <PhotoCredit medicine={summary} />
          </div>
        )}
      </header>

      <div className="flex flex-wrap gap-2">
        <FavoriteButton aic={m.aic} name={m.name} />
        <CompareButton aic={m.aic} name={m.name} />
      </div>

      {sections.length > 2 && (
        <nav aria-label="In questa scheda" className="-mx-4 overflow-x-auto px-4">
          <ul className="flex w-max gap-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="inline-flex min-h-11 items-center rounded-full border-2 border-line bg-surface px-4 text-small font-bold text-primary hover:border-primary"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <section aria-labelledby="prezzo-titolo" className="space-y-2 rounded-3xl border border-line bg-surface p-5">
        <h2 id="prezzo-titolo" className="scroll-mt-20 font-bold">
          Prezzo
        </h2>
        <Price medicine={summary} size="lg" />
        {m.referencePrice !== null && (
          <p className="text-small">
            Prezzo di riferimento SSN: <span className="font-bold tabular-nums">{formatEuro(m.referencePrice)}</span>. È il limite di rimborso del Servizio
            sanitario per i farmaci equivalenti: se si sceglie una confezione più cara, la differenza è a carico di chi la acquista.{" "}
            <a href={EQUIVALENTS_FAQ} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline underline-offset-2">
              Domande e risposte AIFA
              <span className="sr-only"> (si apre in una nuova scheda)</span>
            </a>
          </p>
        )}
      </section>

      <section aria-labelledby="ricetta-titolo" className="space-y-2 rounded-3xl bg-surface-2 p-5">
        <h2 id="ricetta-titolo" className="font-bold">
          {SUPPLY_BADGE_LABEL[supplyBadge(code)]}
          {code && <span className="font-normal text-ink-muted"> ({code})</span>}
        </h2>
        {code && <p className="text-small">{SUPPLY_CODE_DESCRIPTION[code]}</p>}
        <p className="text-small">{whereToGet(code)}</p>
        {supplyBadge(code) === "senza-ricetta" && (
          <a href={ONLINE_CHECK} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-small font-bold text-primary underline underline-offset-2">
            Verifica un sito di vendita online
            <ExternalLink aria-hidden className="size-4" />
            <span className="sr-only"> (Ministero della Salute, si apre in una nuova scheda)</span>
          </a>
        )}
      </section>

      <div className="flex gap-3 rounded-3xl border-2 border-primary bg-primary-soft p-4">
        <Info aria-hidden className="mt-0.5 size-6 shrink-0 text-primary" />
        <div className="space-y-1">
          <p className="font-bold">Chiedi consiglio al medico o al farmacista.</p>
          <p className="text-small">Prima di usare un medicinale leggi il foglietto illustrativo. Orienta non consiglia farmaci per i tuoi sintomi.</p>
        </div>
      </div>

      {m.leafletUrl && (
        <a
          href={m.leafletUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-14 items-center gap-3 rounded-3xl border-2 border-primary bg-surface px-5 py-3 font-bold text-primary transition-colors hover:bg-primary-soft"
        >
          <FileDown aria-hidden className="size-6 shrink-0" />
          <span className="min-w-0 flex-1">
            Foglietto illustrativo ufficiale
            <span className="block text-small font-normal text-ink-muted">PDF dalla Banca Dati Farmaci dell&apos;AIFA</span>
          </span>
          <span className="sr-only"> (si apre in una nuova scheda)</span>
        </a>
      )}

      <section aria-labelledby="info-titolo" className="space-y-3">
        <h2 id="info-titolo" className="text-heading font-bold">
          Informazioni principali
        </h2>
        <dl className="divide-y divide-line rounded-3xl border border-line bg-surface">
          {[
            ["Principio attivo", m.activeIngredient],
            ["Dosaggio e confezione", m.description],
            ["Forma farmaceutica", `${m.form} (${FORM_FAMILY_LABEL[summary.formFamily].toLowerCase()})`],
            ["Titolare dell'autorizzazione", displayCompany(m.company)],
            ["Codice AIC", m.aic],
            ["Categoria terapeutica (ATC)", [m.atc, atcLabel, m.atcClass ? sentenceCase(m.atcClass) : null].filter(Boolean).join(" · ") || "Non indicata"],
            [
              "Classe di rimborsabilità",
              m.reimbursementClass === "A"
                ? "A: rimborsabile dal Servizio sanitario nazionale"
                : m.reimbursementClass === "H"
                  ? "H: a carico del Servizio sanitario, in ambito ospedaliero"
                  : "Non presente nelle liste di Classe A e H",
            ],
          ].map(([label, value]) => (
            <div key={label} className="space-y-0.5 px-4 py-3">
              <dt className="text-small text-ink-muted">{label}</dt>
              <dd className="font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ingredient && <IngredientSection info={ingredient} />}

      <section id="equivalenti" aria-labelledby="equivalenti-titolo" className="scroll-mt-20 space-y-3">
        <div className="space-y-1">
          <h2 id="equivalenti-titolo" className="text-heading font-bold">
            Farmaci equivalenti
          </h2>
          <p className="text-small text-ink-muted">Stesso principio attivo, dosaggio e forma, dal prezzo più basso.</p>
        </div>
        {equivalents.length === 0 ? (
          <p className="rounded-3xl bg-surface-2 p-4 text-small">Nel catalogo non ci sono equivalenti di questa confezione.</p>
        ) : (
          <>
            {lowestCount > 3 && lowest !== null && (
              <p className="text-small">
                <span className="font-bold text-accent">{lowestCount} confezioni</span> hanno il prezzo più basso del gruppo,{" "}
                <span className="font-bold tabular-nums">{formatEuro(lowest)}</span>.
              </p>
            )}
            <ol className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
              {group.slice(0, EQUIVALENTS_FIRST).map((g) => (
                <EquivalentRow key={g.aic} g={g} self={g.aic === m.aic} lowest={lowest} markLowest={lowestCount <= 3} />
              ))}
            </ol>
            {group.length > EQUIVALENTS_FIRST && (
              <details className="group">
                <summary className="flex min-h-11 cursor-pointer items-center font-bold text-primary">Mostra gli altri {group.length - EQUIVALENTS_FIRST} equivalenti</summary>
                <ol start={EQUIVALENTS_FIRST + 1} className="mt-2 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
                  {group.slice(EQUIVALENTS_FIRST).map((g) => (
                    <EquivalentRow key={g.aic} g={g} self={g.aic === m.aic} lowest={lowest} markLowest={lowestCount <= 3} />
                  ))}
                </ol>
              </details>
            )}
          </>
        )}
      </section>

      {brands && brands.brands.length > 1 && <BrandsSection brands={brands} selfName={m.name} otc={otc} />}

      {europe && (
        <EuBrands
          ingredient={ingredient?.name ?? m.activeIngredient}
          brands={europe.brands}
          countries={europe.countries}
          sameRoute={europe.sameRoute}
          routeLabel={europe.sameRoute ? (europe.brands[0]?.routes.find((r) => europe.brands.every((b) => b.routes.includes(r))) ?? null) : null}
          updated={europe.updated}
          sourceUrl={europe.url}
        />
      )}

      <p className="text-small text-ink-muted">
        Fonte: AIFA, Open Data (licenza CC BY 4.0).
        {info.registryDate && <> Anagrafica al {formatItalianDay(info.registryDate)}.</>}
        {m.priceDate && <> Prezzo al {formatItalianDay(m.priceDate)}.</>}
      </p>
    </article>
  );
}
