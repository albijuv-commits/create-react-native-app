"use client";

import { ArrowLeftRight, Heart, LayoutGrid, LoaderCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import nessunRisultato from "@/assets/illustrations/stato-nessun-risultato.webp";
import { Button, ButtonLink } from "@/components/ui/button";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { cn } from "@/lib/cn";
import { ATC_GROUPS } from "@/lib/medicines/atc";
import { CatalogRequestError, fetchCatalog, fetchMedicines } from "@/lib/medicines/client";
import { useDeviceList } from "@/lib/medicines/device-lists";
import { FORM_FAMILIES, FORM_FAMILY_LABEL, type FormFamily } from "@/lib/medicines/forms";
import {
  catalogQuerySchema,
  MAX_COMPARE,
  PRICE_BAND_LABEL,
  PRICE_BANDS,
  RECIPE_FILTER_LABEL,
  RECIPE_FILTERS,
  SORT_LABEL,
  SORTS,
  type CatalogPage,
  type CatalogQuery,
  type MedicineSummary,
} from "@/lib/medicines/types";
import { useUrlParams } from "@/lib/use-url-params";
import { FormArt } from "./form-art";
import { MedicineCard } from "./medicine-card";

type Fetched = { key: string; page?: CatalogPage; error?: string };

/** I filtri vivono nell'indirizzo (un link li conserva); valori sconosciuti vengono ignorati */
function queryFromParams(params: URLSearchParams): CatalogQuery {
  const pick = <T extends string>(name: string, allowed: readonly T[]): T | null => {
    const v = params.get(name);
    return v && (allowed as readonly string[]).includes(v) ? (v as T) : null;
  };
  const atc = params.get("atc");
  return catalogQuerySchema.parse({
    q: (params.get("q") ?? "").slice(0, 80),
    ricetta: pick("ricetta", RECIPE_FILTERS),
    forma: pick("forma", FORM_FAMILIES),
    atc: atc && atc in ATC_GROUPS ? atc : null,
    prezzo: pick("prezzo", PRICE_BANDS),
    ordine: pick("ordine", SORTS) ?? "nome",
  });
}

/**
 * Il catalogo dei medicinali: ricerca per nome o principio attivo, filtri (ricetta, forma, categoria
 * ATC, fascia di prezzo), ordinamento, preferiti e confronto salvati sul dispositivo.
 */
export function MedicineCatalog() {
  const [params, updateParams] = useUrlParams();
  const query = useMemo(() => queryFromParams(params), [params]);
  const key = JSON.stringify(query);
  const view = params.get("vista") === "preferiti" ? "preferiti" : "catalogo";
  const favorites = useDeviceList("preferiti");
  const compare = useDeviceList("confronto");

  const [text, setText] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fetched, setFetched] = useState<Fetched | null>(null);
  const [more, setMore] = useState<{ key: string; items: MedicineSummary[]; page: number; loading: boolean } | null>(null);
  const [favItems, setFavItems] = useState<{ key: string; items: MedicineSummary[] } | null>(null);

  // La ricerca parte quando si smette di scrivere
  const typed = text ?? query.q;
  useEffect(() => {
    if (text === null || text.trim() === query.q) return;
    const t = window.setTimeout(() => updateParams({ q: text.trim() || null }), 300);
    return () => window.clearTimeout(t);
  }, [text, query.q, updateParams]);

  useEffect(() => {
    if (view !== "catalogo") return;
    const c = new AbortController();
    fetchCatalog(query, c.signal).then(
      (r) => setFetched({ key, page: r.page }),
      (e: unknown) => {
        if (!c.signal.aborted) setFetched({ key, error: e instanceof CatalogRequestError ? e.message : "Il catalogo non è disponibile." });
      },
    );
    return () => c.abort();
  }, [query, key, view]);

  const favoriteList = favorites.list;
  const favKey = favoriteList.join(",");
  useEffect(() => {
    if (view !== "preferiti" || !favoriteList.length) return;
    const c = new AbortController();
    fetchMedicines(favoriteList, c.signal).then(
      (items) => setFavItems({ key: favoriteList.join(","), items }),
      () => undefined,
    );
    return () => c.abort();
  }, [favoriteList, view]);

  const current = fetched?.key === key ? fetched : null;
  const loading = view === "catalogo" && !current;
  const extra = more?.key === key ? more : null;
  const items = [...(current?.page?.items ?? []), ...(extra?.items ?? [])];
  const total = current?.page?.total ?? 0;

  const loadMore = async () => {
    const nextPage = (extra?.page ?? 1) + 1;
    setMore({ key, items: extra?.items ?? [], page: extra?.page ?? 1, loading: true });
    try {
      const r = await fetchCatalog({ ...query, pagina: nextPage });
      setMore((prev) => (prev?.key === key ? { key, items: [...prev.items, ...r.page.items], page: nextPage, loading: false } : prev));
    } catch {
      setMore((prev) => (prev?.key === key ? { ...prev, loading: false } : prev));
    }
  };

  const activeFilters = [query.ricetta, query.forma, query.atc, query.prezzo].filter(Boolean).length;
  const set = (updates: Record<string, string | null>) => updateParams(updates);

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Catalogo o preferiti" className="flex gap-1 rounded-2xl bg-surface-2 p-1">
        {(["catalogo", "preferiti"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => set({ vista: v === "preferiti" ? "preferiti" : null })}
            className={cn(
              "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-small font-bold transition-[background-color,color] duration-150",
              view === v ? "bg-surface text-primary shadow-sm" : "text-ink-muted hover:text-ink",
            )}
          >
            {v === "catalogo" ? <LayoutGrid aria-hidden className="size-5" /> : <Heart aria-hidden className="size-5" />}
            {v === "catalogo" ? "Catalogo" : `Preferiti${favorites.list.length ? ` (${favorites.list.length})` : ""}`}
          </button>
        ))}
      </div>

      {view === "catalogo" ? (
        <>
          <div className="space-y-3">
            <label htmlFor="cerca-farmaco" className="block font-bold">
              Cerca per nome o principio attivo
            </label>
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-muted" />
              <input
                id="cerca-farmaco"
                type="search"
                value={typed}
                onChange={(e) => setText(e.target.value)}
                maxLength={80}
                enterKeyHint="search"
                autoComplete="off"
                placeholder="Es. paracetamolo 500 mg"
                className="min-h-12 w-full rounded-2xl border-2 border-line bg-surface pl-12 pr-12 text-body placeholder:text-ink-muted/80 focus:border-primary focus:outline-none focus-visible:outline-3 focus-visible:outline-focus"
              />
              {typed && (
                <button
                  type="button"
                  onClick={() => {
                    setText("");
                    set({ q: null });
                  }}
                  className="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-surface-2"
                >
                  <X aria-hidden className="size-5" />
                  <span className="sr-only">Cancella la ricerca</span>
                </button>
              )}
            </div>
          </div>

          <FormPicker value={query.forma} onChange={(f) => set({ forma: f })} />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              aria-expanded={filtersOpen}
              aria-controls="filtri-farmaci"
              onClick={() => setFiltersOpen((o) => !o)}
              icon={<SlidersHorizontal aria-hidden className="size-5" />}
            >
              Filtri{activeFilters ? ` (${activeFilters})` : ""}
            </Button>
            <label className="flex min-h-11 items-center gap-2 text-small font-bold">
              <span className="sr-only sm:not-sr-only">Ordina per</span>
              <select
                value={query.ordine}
                onChange={(e) => set({ ordine: e.target.value === "nome" ? null : e.target.value })}
                aria-label="Ordina per"
                className="min-h-11 rounded-2xl border-2 border-line bg-surface px-3 text-small font-bold"
              >
                {SORTS.map((s) => (
                  <option key={s} value={s}>
                    {SORT_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            {activeFilters > 0 && (
              <Button variant="ghost" onClick={() => set({ ricetta: null, forma: null, atc: null, prezzo: null })}>
                Azzera filtri
              </Button>
            )}
          </div>

          {filtersOpen && (
            <div id="filtri-farmaci" className="space-y-4 rounded-3xl bg-surface-2 p-4">
              <ChipGroup
                legend="Ricetta"
                options={[{ value: null, label: "Tutti" }, ...RECIPE_FILTERS.map((r) => ({ value: r, label: RECIPE_FILTER_LABEL[r] }))]}
                value={query.ricetta}
                onChange={(v) => set({ ricetta: v })}
              />
              <ChipGroup
                legend="Fascia di prezzo"
                options={[{ value: null, label: "Tutte" }, ...PRICE_BANDS.map((p) => ({ value: p, label: PRICE_BAND_LABEL[p] }))]}
                value={query.prezzo}
                onChange={(v) => set({ prezzo: v })}
              />
              <label className="block space-y-1.5">
                <span className="block font-bold">Categoria terapeutica (ATC)</span>
                <select
                  value={query.atc ?? ""}
                  onChange={(e) => set({ atc: e.target.value || null })}
                  className="min-h-11 w-full rounded-2xl border-2 border-line bg-surface px-3 text-small"
                >
                  <option value="">Tutte le categorie</option>
                  {Object.entries(ATC_GROUPS).map(([code, label]) => (
                    <option key={code} value={code}>
                      {code} · {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <section aria-labelledby="risultati-farmaci" className="space-y-3">
            <h2 id="risultati-farmaci" className="sr-only">
              Risultati
            </h2>
            <p aria-live="polite" className="flex items-center gap-2 font-bold">
              {loading && <LoaderCircle aria-hidden className="size-5 animate-spin text-primary" />}
              {loading ? "Cerco…" : current?.error ? "" : total === 1 ? "1 confezione" : `${total.toLocaleString("it-IT")} confezioni`}
            </p>
            {current?.error && (
              <p role="alert" className="rounded-3xl bg-red-soft p-4 font-bold text-red">
                {current.error}
              </p>
            )}
            {!loading && !current?.error && total === 0 && (
              <div className="flex items-center gap-4 rounded-3xl bg-surface-2 p-5">
                <TiltIllustration src={nessunRisultato} sizes="88px" className="w-22 shrink-0" />
                <div className="space-y-1">
                  <p className="font-bold">Nessuna confezione trovata.</p>
                  <p className="text-small text-ink-muted">Prova con il principio attivo, con meno parole o togliendo qualche filtro.</p>
                </div>
              </div>
            )}
            <ul className={cn("space-y-3 transition-opacity duration-200", loading && fetched ? "opacity-60" : undefined)}>
              {(loading && fetched?.page ? fetched.page.items : items).map((m) => (
                <li key={m.aic}>
                  <MedicineCard medicine={m} />
                </li>
              ))}
            </ul>
            {!loading && items.length < total && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => void loadMore()}
                disabled={extra?.loading}
                icon={extra?.loading ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : undefined}
              >
                Mostra altre confezioni ({(total - items.length).toLocaleString("it-IT")})
              </Button>
            )}
          </section>
        </>
      ) : (
        <section aria-label="Preferiti" className="space-y-3">
          <p className="text-small text-ink-muted">I preferiti restano solo su questo dispositivo.</p>
          {favorites.list.length === 0 ? (
            <div className="rounded-3xl bg-surface-2 p-5">
              <p className="font-bold">Non hai ancora preferiti.</p>
              <p className="text-small text-ink-muted">Tocca il cuore su una confezione per ritrovarla qui.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {(favItems?.key === favKey ? favItems.items : []).map((m) => (
                <li key={m.aic}>
                  <MedicineCard medicine={m} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {compare.list.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 px-4">
          <div className="pointer-events-auto mx-auto flex max-w-lg items-center gap-2 rounded-3xl border border-line bg-surface p-2 pl-4 shadow-lg">
            <ArrowLeftRight aria-hidden className="size-5 shrink-0 text-primary" />
            <p className="min-w-0 flex-1 text-small font-bold">
              {compare.list.length} su {MAX_COMPARE} nel confronto
            </p>
            <Button variant="ghost" onClick={compare.clear} className="px-3">
              Svuota
            </Button>
            <ButtonLink href="/mercato/confronto" className="px-4">
              Confronta
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}

/** Le forme farmaceutiche come riquadri illustrati da scorrere: sono pulsanti di scelta veri */
function FormPicker({ value, onChange }: { value: FormFamily | null; onChange: (f: FormFamily | null) => void }) {
  const options: Array<{ value: FormFamily | null; label: string; art: ReactNode }> = [
    { value: null, label: "Tutte", art: <LayoutGrid aria-hidden className="size-8 text-primary" /> },
    ...FORM_FAMILIES.map((f) => ({ value: f, label: FORM_FAMILY_LABEL[f], art: <FormArt family={f} className="size-12" /> })),
  ];
  return (
    <fieldset className="min-w-0 space-y-2">
      <legend className="font-bold">Forma</legend>
      <div className="relative -mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]">
        <div className="flex w-max gap-2">
          {options.map((o) => (
            <label
              key={o.value ?? "tutte"}
              className={cn(
                "relative flex w-22 shrink-0 cursor-pointer flex-col items-center gap-1 rounded-3xl border-2 px-1 py-2 text-center",
                "transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.96]",
                "has-checked:border-primary has-checked:bg-primary-soft has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus",
                "border-line bg-surface hover:border-primary/60",
              )}
            >
              <input type="radio" name="forma" checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
              <span className="grid size-12 place-items-center">{o.art}</span>
              <span className="text-[0.8125rem] font-bold leading-tight">{o.label}</span>
            </label>
          ))}
        </div>
      </div>
    </fieldset>
  );
}

function ChipGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: Array<{ value: T | null; label: string }>;
  value: T | null;
  onChange: (v: T | null) => void;
}) {
  return (
    <fieldset className="min-w-0 space-y-1.5">
      <legend className="font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value ?? "tutti"}
            className={cn(
              "relative inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 px-4 text-small font-bold",
              "has-checked:border-primary has-checked:bg-primary has-checked:text-on-primary has-focus-visible:outline-3 has-focus-visible:outline-focus",
              "border-line bg-surface hover:border-primary/60",
            )}
          >
            <input type="radio" name={legend} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
