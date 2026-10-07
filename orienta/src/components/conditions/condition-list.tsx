"use client";

import { ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import type { BodyAreaId } from "@data/vocab/body";
import { SlidePreview } from "@/components/slide/slide-preview";
import { cn } from "@/lib/cn";
import { searchConditions, type ConditionListItem } from "@/lib/conditions/search";

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
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<BodyAreaId | null>(null);
  const inputId = useId();
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
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ad esempio: tosse o prurito"
            autoComplete="off"
            enterKeyHint="search"
            className="min-h-12 w-full rounded-2xl border-2 border-line bg-surface pl-11 pr-12 text-body text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-xl text-ink-muted hover:text-ink"
            >
              <X aria-hidden className="size-5" />
              <span className="sr-only">Cancella la ricerca</span>
            </button>
          )}
        </div>
      </div>

      <div role="group" aria-label="Filtra per area del corpo" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {[{ id: null, label: "Tutte" } as const, ...areas].map((a) => {
          const active = area === a.id;
          return (
            <button
              key={a.id ?? "tutte"}
              type="button"
              aria-pressed={active}
              onClick={() => setArea(a.id)}
              className={cn(
                "min-h-11 shrink-0 rounded-full border-2 px-4 text-small font-bold transition-colors",
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
            <section key={letter} aria-label={`Lettera ${letter}`}>
              <h2 aria-hidden className="pb-1 text-title font-bold text-accent">
                {letter}
              </h2>
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
  return (
    <li>
      <Link
        href={`/condizioni/${item.id}`}
        className="group -mx-2 flex items-center gap-4 rounded-2xl px-2 py-3 hover:bg-surface-2"
      >
        <SlidePreview spec={item.animation} className="size-18" />
        <span className="min-w-0 flex-1 space-y-0.5">
          <span className="block text-heading font-bold text-ink group-hover:text-primary">{item.name}</span>
          <span className="line-clamp-2 text-small text-ink-muted">{item.teaser}</span>
        </span>
        <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-muted" />
      </Link>
    </li>
  );
}
