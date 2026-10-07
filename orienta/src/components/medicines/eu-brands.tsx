"use client";

import { ExternalLink, Globe2 } from "lucide-react";
import { useId, useState } from "react";
import type { EuBrand } from "@/lib/medicines/eu-brands";
import { formatItalianDay } from "@/lib/medicines/text";

const TOP = 15;

/**
 * Lo stesso principio attivo negli altri Paesi europei: i marchi più diffusi e, scegliendo un
 * Paese, quelli autorizzati lì. Utile in viaggio, ma dosaggi e regole di vendita cambiano da Paese
 * a Paese: all'estero si chiede al farmacista.
 */
export function EuBrands({
  ingredient,
  brands,
  countries,
  sameRoute,
  routeLabel,
  updated,
  sourceUrl,
}: {
  ingredient: string;
  brands: EuBrand[];
  countries: string[];
  sameRoute: boolean;
  routeLabel: string | null;
  updated: string | null;
  sourceUrl: string;
}) {
  const [country, setCountry] = useState("");
  const [all, setAll] = useState(false);
  const selectId = useId();
  const choices = countries.filter((c) => c !== "Italia" && c !== "Tutta l'UE");
  const inCountry = country ? brands.filter((b) => b.countries.includes(country) || b.countries.includes("Tutta l'UE")).sort((a, b) => a.name.localeCompare(b.name, "it")) : [];
  const widespread = brands.filter((b) => b.countries.length >= 2);
  const topList = all ? brands : (widespread.length ? widespread : brands).slice(0, TOP);

  return (
    <section id="in-europa" aria-labelledby="europa-titolo" className="scroll-mt-20 space-y-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Globe2 aria-hidden className="size-6 text-primary" />
          <h2 id="europa-titolo" className="text-heading font-bold">
            In Europa
          </h2>
        </div>
        <p className="text-small text-ink-muted">
          Lo stesso principio attivo ({ingredient.toLowerCase()}) è autorizzato in {countries.length} Paesi europei: qui {brands.length === 1 ? "1 marchio" : `${brands.length} marchi`}
          {sameRoute && routeLabel && <> da usare {routeLabel}</>}. I nomi generici, fatti di principio attivo e azienda, non sono elencati.
        </p>
      </div>

      <label htmlFor={selectId} className="block space-y-1.5">
        <span className="block font-bold">Scegli un Paese</span>
        <select
          id={selectId}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="min-h-11 w-full rounded-2xl border-2 border-line bg-surface px-3 text-small font-bold"
        >
          <option value="">I marchi più diffusi</option>
          {choices.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      {country ? (
        <div aria-live="polite" className="space-y-2">
          <p className="text-small font-bold">
            {inCountry.length === 0 ? `Nessun marchio commerciale trovato in ${country}.` : `${inCountry.length === 1 ? "1 marchio" : `${inCountry.length} marchi`} in ${country}`}
          </p>
          {inCountry.length > 0 && (
            <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
              {inCountry.map((b) => (
                <li key={b.name} className="px-4 py-2.5">
                  <p className="font-bold">{b.name}</p>
                  <p className="text-[0.8125rem] text-ink-muted">
                    {b.routes.join(", ")}
                    {b.holders.length > 0 && <> · {b.holders.join(" · ")}</>}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <ul className="flex flex-wrap gap-2" aria-label="Marchi più diffusi in Europa">
            {topList.map((b) => (
              <li key={b.name} className="rounded-full border border-line bg-surface px-3 py-1.5 text-small">
                <span className="font-bold">{b.name}</span>
                <span className="text-ink-muted"> · {b.countries.includes("Tutta l'UE") ? "tutta l'UE" : b.countries.length === 1 ? b.countries[0] : `${b.countries.length} Paesi`}</span>
              </li>
            ))}
          </ul>
          {!all && brands.length > topList.length && (
            <button type="button" onClick={() => setAll(true)} className="min-h-11 text-small font-bold text-primary underline underline-offset-2">
              Mostra tutti i {brands.length} marchi
            </button>
          )}
        </div>
      )}

      <p className="text-small text-ink-muted">
        Dosaggi, forme e regole di vendita (con o senza ricetta) cambiano da Paese a Paese: all&apos;estero chiedi al farmacista. Fonte:{" "}
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline underline-offset-2">
          elenco EMA dei medicinali autorizzati nell&apos;UE e nel SEE
          <ExternalLink aria-hidden className="ml-1 inline size-3.5 align-[-2px]" />
          <span className="sr-only"> (si apre in una nuova scheda)</span>
        </a>
        {updated && <>, aggiornato al {formatItalianDay(updated)}</>}.
      </p>
    </section>
  );
}
