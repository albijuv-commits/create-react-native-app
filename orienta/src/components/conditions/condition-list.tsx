"use client";

import { ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef } from "react";
import type { BodyAreaId } from "@data/vocab/body";
import { SlidePreview } from "@/components/slide/slide-preview";
import { cn } from "@/lib/cn";
import { searchConditions, type ConditionListItem } from "@/lib/conditions/search";
import { useUrlParams } from "@/lib/use-url-params";

interface Area {
  id: BodyAreaId;
  label: string;
}

function groupByLetter(items: ConditionListItem[]) {
  const groups = new Map<string, ConditionListItem[]>();
  for (const item of items) {
    const letter = item.name.normalize("NFD").charAt(0).toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), item]);
  }
  return [...groups.entries()];
}

export function ConditionList({ items, areas }: { items: ConditionListItem[]; areas: Area[] }) {
  // Ricerca e filtro stanno nell'indirizzo (?q=…&area=…): si possono condividere e sopravvivono al ricaricamento
  const [params, updateParams] = useUrlParams();
  const query = params.get("q") ?? "";
  const area = areas.find((a) => a.id === params.get("area"))?.id ?? null;
  const setQuery = (q: string) => updateParams({ q: q || null });
  const setArea = (id: BodyAreaId | null) => updateParams({ area: id });
  const inputId = useId();
  const chipsRef = useRef<HTMLDivElement>(null);

  // Il filtro attivo resta visibile nella fila di chip, anche quando arriva da un link
  useEffect(() => {
    chipsRef.current
      ?.querySelector<HTMLElement>('[aria-pressed="true"]')
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "instant" });
  }, [area]);
  const results = useMemo(() => searchConditions(items, query, area), [items, query, area]);
  const searching = query.trim().length > 0;
  const areaLabel = areas.find((a) => a.id === area)?.label;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label htmlFor={inputId} className="block font-bold">
          Cerca per nome o sintomo
        </label>
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-muted" />
          <input
            id={inputId}
            name="q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ad esempio tosse o prurito…"
            autoComplete="off"
            enterKeyHint="search"
            className="min-h-12 w-full rounded-2xl border-2 border-line bg-surface py-2 pl-11 pr-12 text-body text-ink placeholder:text-ink-muted focus:border-primary"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-xl text-ink-muted hover:bg-surface-2 hover:text-ink"
            >
              <X aria-hidden className="size-5" />
              <span className="sr-only">Cancella la ricerca</span>
            </button>
          )}
        </div>
      </div>

      <div ref={chipsRef} role="group" aria-label="Filtra per area del corpo" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {[{ id: null, label: "Tutte" } as const, ...areas].map((a) => {
          const active = area === a.id;
          return (
            <button
              key={a.id ?? "tutte"}
              type="button"
              aria-pressed={active}
              onClick={() => setArea(a.id)}
              className={cn(
                "min-h-11 shrink-0 whitespace-nowrap rounded-full border-2 px-4 py-2 text-small font-bold transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97]",
                active ? "border-primary bg-primary text-on-primary" : "border-line bg-surface text-ink hover:border-primary",
              )}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="text-small text-ink-muted">
        {results.length === 1 ? "1 condizione" : `${results.length} condizioni`}
        {areaLabel && ` in «${areaLabel}»`}
        {searching && ` per «${query.trim()}»`}
      </p>

      {results.length === 0 ? (
        <div className="space-y-2 rounded-2xl bg-surface-2 p-5">
          <p className="font-bold">Nessuna condizione trovata.</p>
          <p className="text-small text-ink-muted">
            Prova con un&apos;altra parola o con un sintomo, ad esempio «tosse». Se non sai da dove partire,{" "}
            <Link href="/sintomi/intervista" className="font-bold text-primary underline underline-offset-2">
              descrivi cosa senti
            </Link>
            .
          </p>
        </div>
      ) : searching ? (
        <ul className="divide-y divide-line">
          {results.map((item) => (
            <Row key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <div className="space-y-4">
          {groupByLetter(results).map(([letter, group]) => (
            <section key={letter}>
              <h2 className="pb-1 text-title font-bold text-accent">{letter}</h2>
              <ul className="divide-y divide-line">
                {group.map((item) => (
                  <Row key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ item }: { item: ConditionListItem }) {
  const id = useId();
  return (
    // Le righe fuori schermo non vengono disegnate finché non servono (40 vetrini SVG)
    <li className="[contain-intrinsic-size:auto_6rem] [content-visibility:auto]">
      <Link
        href={`/condizioni/${item.id}`}
        aria-labelledby={`${id}-nome`}
        aria-describedby={`${id}-anteprima`}
        className="group -mx-2 flex items-center gap-4 rounded-2xl px-2 py-3 transition-colors duration-150 ease-out hover:bg-surface-2 active:bg-surface-2"
      >
        <SlidePreview spec={item.animation} className="size-18" />
        <span className="min-w-0 flex-1 space-y-0.5">
          <span id={`${id}-nome`} className="block text-heading font-bold text-ink group-hover:text-primary">
            {item.name}
          </span>
          <span id={`${id}-anteprima`} className="line-clamp-2 text-small text-ink-muted">
            {item.teaser}
          </span>
        </span>
        <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-muted" />
      </Link>
    </li>
  );
}
