import { formFamily } from "./forms";
import { ingredientKey } from "./ingredient-key";
import { supplyCodeFrom } from "./regime";
import type { NewMedicine } from "./schema";
import { cleanDescription, displayName, normalizeSearch, padAic, parsePrice, sentenceCase, strengthKey, unitsFromGroup } from "./text";

/**
 * Unisce i file Open Data dell'AIFA tramite il codice AIC:
 * - anagrafica delle confezioni (confezioni_fornitura.csv): nome, ditta, forma, ATC, principi
 *   attivi, regime di fornitura, link al foglietto illustrativo;
 * - nomi ATC (atc.csv);
 * - liste di Classe A e di Classe H: prezzo al pubblico, gruppo di equivalenza, unità;
 * - lista di trasparenza (farmaci equivalenti): prezzo più recente e prezzo di riferimento SSN.
 * Esclude i medicinali omeopatici e le confezioni non autorizzate.
 */
export interface AifaSources {
  registry: Record<string, string>[];
  atc: Record<string, string>[];
  classA: Record<string, string>[];
  classH: Record<string, string>[];
  transparency: Record<string, string>[];
}

export interface AifaDates {
  classA: string | null;
  classH: string | null;
  transparency: string | null;
}

interface PriceInfo {
  price: number | null;
  date: string | null;
  source: "classe-a" | "classe-h" | "trasparenza";
  group: string | null;
  units: number | null;
  activeIngredient: string | null;
  referencePrice: number | null;
}

const LEAFLET_URL = /^https:\/\/api\.aifa\.gov\.it\/[\w\-./?=&%]+$/;

function value(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== "") return v;
  }
  return "";
}

function valueByPrefix(row: Record<string, string>, prefix: RegExp): string {
  const key = Object.keys(row).find((k) => prefix.test(k));
  return key ? (row[key] ?? "") : "";
}

/** La colonna del prezzo della lista di trasparenza cambia nome ogni mese («Prezzo Pubblico 15 settembre 2026») */
export function transparencyPriceKey(row: Record<string, string>): string | null {
  return Object.keys(row).find((k) => /^prezzo pubblico/i.test(k)) ?? null;
}

export function buildCatalog(src: AifaSources, dates: AifaDates, only?: ReadonlySet<string>): NewMedicine[] {
  const atcNames = new Map(src.atc.map((r) => [r.CODICE_ATC ?? "", r.DESCRIZIONE ?? ""]));
  const reimbursement = new Map<string, "A" | "H">();
  const prices = new Map<string, PriceInfo>();

  // Classe H, poi Classe A, poi trasparenza: vince la fonte più recente
  for (const [rows, cls, date] of [
    [src.classH, "H", dates.classH],
    [src.classA, "A", dates.classA],
  ] as const) {
    for (const r of rows) {
      const aic = padAic(value(r, "AIC", "Codice AIC"));
      if (!aic) continue;
      reimbursement.set(aic, cls);
      prices.set(aic, {
        price: parsePrice(valueByPrefix(r, /^prezzo al pubblico/i)),
        date,
        source: cls === "A" ? "classe-a" : "classe-h",
        group: value(r, "Codice Gruppo Equivalenza") || null,
        units: unitsFromGroup(value(r, "Descrizione gruppo")),
        activeIngredient: value(r, "Principio attivo") || null,
        referencePrice: null,
      });
    }
  }
  for (const r of src.transparency) {
    const aic = padAic(value(r, "AIC"));
    if (!aic) continue;
    const key = transparencyPriceKey(r);
    const previous = prices.get(aic);
    const price = key ? parsePrice(r[key]) : null;
    prices.set(aic, {
      price: price ?? previous?.price ?? null,
      date: price !== null ? dates.transparency : (previous?.date ?? null),
      source: price !== null ? "trasparenza" : (previous?.source ?? "trasparenza"),
      group: value(r, "Codice gruppo equivalenza") || previous?.group || null,
      units: previous?.units ?? unitsFromGroup(value(r, "Confezione di riferimento")),
      activeIngredient: previous?.activeIngredient ?? (value(r, "Principio attivo") || null),
      referencePrice: parsePrice(value(r, "Prezzo riferimento SSN")),
    });
  }

  const out: NewMedicine[] = [];
  for (const r of src.registry) {
    const aic = padAic(r.CODICE_AIC);
    if (!aic || (only && !only.has(aic))) continue;
    if (r.STATO_AMMINISTRATIVO !== "Autorizzata" || r.TIPO_PROCEDURA === "Omeopatico") continue;
    const officialName = (r.DENOMINAZIONE ?? "").trim();
    const rawDescription = (r.DESCRIZIONE ?? "").trim();
    if (!officialName || !rawDescription) continue;
    const p = prices.get(aic);
    const atc = (r.CODICE_ATC ?? "").trim().toUpperCase() || null;
    const activeIngredient = p?.activeIngredient ?? sentenceCase(r.PA_ASSOCIATI || officialName);
    const company = (r.RAGIONE_SOCIALE ?? "").trim() || "Titolare non indicato";
    const leaflet = (r.LINK_FI ?? "").trim();
    out.push({
      aic,
      name: displayName(officialName),
      officialName,
      description: cleanDescription(rawDescription),
      company,
      form: (r.FORMA ?? "").trim() || "Non nota",
      formFamily: formFamily(r.FORMA ?? "", rawDescription),
      activeIngredient,
      // La dicitura dell'anagrafica è la più completa: le liste dei prezzi a volte omettono il sale
      ingredientKey: ingredientKey(r.PA_ASSOCIATI || activeIngredient),
      strength: strengthKey(rawDescription),
      atc,
      atcGroup: atc && /^[A-Z]/.test(atc) ? atc.charAt(0) : null,
      atcClass: atc && atc.length >= 4 ? (atcNames.get(atc.slice(0, 4)) ?? null) : null,
      supplyCode: supplyCodeFrom(r.FORNITURA),
      reimbursementClass: reimbursement.get(aic) ?? null,
      price: p?.price ?? null,
      priceDate: p?.price !== null && p?.price !== undefined ? p.date : null,
      priceSource: p?.price !== null && p?.price !== undefined ? p.source : null,
      referencePrice: p?.referencePrice ?? null,
      units: p?.units ?? null,
      equivalenceGroup: p?.group ?? null,
      leafletUrl: LEAFLET_URL.test(leaflet) ? leaflet : null,
      imageUrl: null,
      imageCredit: null,
      imageSource: null,
      imageCaption: null,
      imageCountry: null,
      searchText: normalizeSearch(`${officialName} ${activeIngredient} ${r.PA_ASSOCIATI ?? ""} ${rawDescription} ${company}`),
    });
  }
  return out;
}
