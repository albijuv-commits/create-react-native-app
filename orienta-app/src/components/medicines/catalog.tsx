import { Image } from "expo-image";
import { router } from "expo-router";
import { ArrowLeftRight, ChevronDown, Heart, LayoutGrid, Search, SlidersHorizontal, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import mercato from "@/assets/illustrations/sezione-mercato.webp";
import nessunRisultato from "@/assets/illustrations/stato-nessun-risultato.webp";
import { ATC_GROUPS } from "@/lib/medicines/atc";
import { CatalogRequestError } from "@/lib/medicines/client";
import { FORM_FAMILIES, FORM_FAMILY_LABEL, type FormFamily } from "@/lib/medicines/forms";
import {
  catalogQuerySchema,
  PRICE_BAND_LABEL,
  PRICE_BANDS,
  RECIPE_FILTER_LABEL,
  RECIPE_FILTERS,
  SORT_LABEL,
  SORTS,
  type CatalogInfo,
  type CatalogPage,
  type MedicineSummary,
  type PriceBand,
  type RecipeFilter,
  type Sort,
} from "@/lib/medicines/types";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/ui/layout";
import { Txt } from "~/components/ui/text";
import { announceOnIOS } from "~/lib/a11y";
import { medicinesByAic, searchCatalog } from "~/lib/catalog";
import { useMedicineList } from "~/lib/medicine-lists";
import { useTheme } from "~/theme/theme";
import { textStyle } from "~/theme/type";
import { FormArt } from "./form-art";
import { MedicineCard } from "./medicine-card";
import { CatalogNotice, CatalogSource, ExampleDataNotice } from "./notices";

type Fetched = { key: string; page?: CatalogPage; error?: string };
type CatalogView = "catalogo" | "preferiti";

const number = (n: number) => n.toLocaleString("it-IT");
const countLabel = (n: number) => (n === 1 ? "1 confezione" : `${number(n)} confezioni`);

/**
 * Il catalogo dei medicinali, come nella web app: ricerca per nome o principio attivo, forme
 * illustrate, filtri (ricetta, fascia di prezzo, categoria ATC) e ordinamento; preferiti e
 * confronto salvati sul telefono. Un catalogo informativo, non un negozio.
 */
export function MedicineCatalog() {
  const { colors, scale } = useTheme();
  const favorites = useMedicineList("preferiti");
  const compare = useMedicineList("confronto");

  const [view, setView] = useState<CatalogView>("catalogo");
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [ricetta, setRicetta] = useState<RecipeFilter | null>(null);
  const [forma, setForma] = useState<FormFamily | null>(null);
  const [atc, setAtc] = useState<string | null>(null);
  const [prezzo, setPrezzo] = useState<PriceBand | null>(null);
  const [ordine, setOrdine] = useState<Sort>("nome");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [fetched, setFetched] = useState<Fetched | null>(null);
  const [info, setInfo] = useState<CatalogInfo | null>(null);
  const [more, setMore] = useState<{ key: string; items: MedicineSummary[]; page: number; loading: boolean } | null>(null);
  const [favItems, setFavItems] = useState<{ key: string; items: MedicineSummary[]; error?: string } | null>(null);
  const [favAttempt, setFavAttempt] = useState(0);

  // La ricerca parte quando si smette di scrivere
  useEffect(() => {
    const t = setTimeout(() => setQ(text.trim().slice(0, 80)), 300);
    return () => clearTimeout(t);
  }, [text]);

  const query = useMemo(() => catalogQuerySchema.parse({ q, ricetta, forma, atc, prezzo, ordine }), [q, ricetta, forma, atc, prezzo, ordine]);
  const key = JSON.stringify(query);

  useEffect(() => {
    if (view !== "catalogo") return;
    const c = new AbortController();
    searchCatalog(query, c.signal).then(
      (r) => {
        if (c.signal.aborted) return;
        setInfo(r.info);
        setFetched({ key, page: r.page });
        announceOnIOS(countLabel(r.page.total));
      },
      (e: unknown) => {
        if (!c.signal.aborted) setFetched({ key, error: e instanceof CatalogRequestError ? e.message : "Il catalogo non è disponibile." });
      },
    );
    return () => c.abort();
  }, [query, key, view]);

  const favoriteList = favorites.list;
  const favKey = `${favoriteList.join(",")}|${favAttempt}`;
  useEffect(() => {
    if (view !== "preferiti" || !favoriteList.length) return;
    const c = new AbortController();
    const k = `${favoriteList.join(",")}|${favAttempt}`;
    medicinesByAic(favoriteList, c.signal).then(
      (items) => {
        if (!c.signal.aborted) setFavItems({ key: k, items });
      },
      (e: unknown) => {
        if (!c.signal.aborted) setFavItems({ key: k, items: [], error: e instanceof CatalogRequestError ? e.message : "Non riusciamo a caricare i preferiti." });
      },
    );
    return () => c.abort();
  }, [favoriteList, view, favAttempt]);
  const fav = favItems?.key === favKey ? favItems : null;

  const current = fetched?.key === key ? fetched : null;
  const loading = view === "catalogo" && !current;
  const extra = more?.key === key ? more : null;
  const items = [...(current?.page?.items ?? []), ...(extra?.items ?? [])];
  const total = current?.page?.total ?? 0;
  // Mentre si cerca restano visibili (più chiari) i risultati di prima
  const shown = loading ? (fetched?.page?.items ?? []) : items;

  const loadMore = async () => {
    const nextPage = (extra?.page ?? 1) + 1;
    setMore({ key, items: extra?.items ?? [], page: extra?.page ?? 1, loading: true });
    try {
      const r = await searchCatalog({ ...query, pagina: nextPage });
      setMore((prev) => (prev?.key === key ? { key, items: [...prev.items, ...r.page.items], page: nextPage, loading: false } : prev));
    } catch {
      setMore((prev) => (prev?.key === key ? { ...prev, loading: false } : prev));
    }
  };

  const activeFilters = [ricetta, forma, atc, prezzo].filter(Boolean).length;
  const resetFilters = () => {
    setRicetta(null);
    setForma(null);
    setAtc(null);
    setPrezzo(null);
  };

  return (
    <View style={[styles.fill, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.content, compare.list.length > 0 && styles.contentWithBar]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <PageHeader title="Mercato" lead="Catalogo informativo dei medicinali: prezzi, regime di fornitura ed equivalenti." illustration={mercato} />
        {info?.source === "esempio" && <ExampleDataNotice count={info.count} />}
        <CatalogNotice />

        <View role="tablist" accessibilityLabel="Catalogo o preferiti" style={[styles.tabs, { backgroundColor: colors.surface2 }]}>
          {(["catalogo", "preferiti"] as const).map((v) => {
            const on = view === v;
            const Icon = v === "catalogo" ? LayoutGrid : Heart;
            return (
              <Pressable
                key={v}
                role="tab"
                accessibilityState={{ selected: on }}
                onPress={() => setView(v)}
                style={[styles.tab, on && [styles.tabOn, { backgroundColor: colors.surface, shadowColor: colors.ink }]]}
              >
                <Icon color={on ? colors.primary : colors.inkMuted} size={20} />
                <Txt variant="small" bold tone={on ? "primary" : "inkMuted"}>
                  {v === "catalogo" ? "Catalogo" : `Preferiti${favorites.list.length ? ` (${favorites.list.length})` : ""}`}
                </Txt>
              </Pressable>
            );
          })}
        </View>

        {view === "catalogo" ? (
          <>
            <View style={styles.group}>
              <Txt bold aria-hidden>
                Cerca per nome o principio attivo
              </Txt>
              <View style={styles.searchBox}>
                <Search color={colors.inkMuted} size={20} style={styles.searchIcon} pointerEvents="none" />
                <TextInput
                  value={text}
                  onChangeText={setText}
                  maxLength={80}
                  accessibilityLabel="Cerca per nome o principio attivo"
                  placeholder="Es. paracetamolo 500 mg"
                  placeholderTextColor={colors.inkMuted}
                  returnKeyType="search"
                  autoCorrect={false}
                  autoCapitalize="none"
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  style={[
                    styles.input,
                    textStyle("body", scale, false),
                    { color: colors.ink, backgroundColor: colors.surface, borderColor: focused ? colors.primary : colors.line },
                    Platform.select({ web: { outlineWidth: 0 }, default: {} }),
                  ]}
                />
                {text !== "" && (
                  <Pressable role="button" accessibilityLabel="Cancella la ricerca" onPress={() => setText("")} style={styles.clear}>
                    <X color={colors.inkMuted} size={20} />
                  </Pressable>
                )}
              </View>
            </View>

            <FormPicker value={forma} onChange={setForma} />

            <View style={styles.filterRow}>
              <Button
                label={`Filtri${activeFilters ? ` (${activeFilters})` : ""}`}
                icon={SlidersHorizontal}
                variant="secondary"
                onPress={() => setFiltersOpen((o) => !o)}
                hint={filtersOpen ? "Chiude i filtri" : "Apre ricetta, prezzo, categoria e ordine"}
              />
              {activeFilters > 0 && <Button label="Azzera filtri" variant="ghost" onPress={resetFilters} />}
            </View>

            {filtersOpen && (
              <View style={[styles.filters, { backgroundColor: colors.surface2 }]}>
                <ChipGroup
                  legend="Ricetta"
                  options={[{ value: null, label: "Tutti" }, ...RECIPE_FILTERS.map((r) => ({ value: r, label: RECIPE_FILTER_LABEL[r] }))]}
                  value={ricetta}
                  onChange={setRicetta}
                />
                <ChipGroup
                  legend="Fascia di prezzo"
                  options={[{ value: null, label: "Tutte" }, ...PRICE_BANDS.map((p) => ({ value: p, label: PRICE_BAND_LABEL[p] }))]}
                  value={prezzo}
                  onChange={setPrezzo}
                />
                <SelectList
                  legend="Categoria terapeutica (ATC)"
                  options={[{ value: null, label: "Tutte le categorie" }, ...Object.entries(ATC_GROUPS).map(([code, label]) => ({ value: code, label: `${code} · ${label}` }))]}
                  value={atc}
                  onChange={setAtc}
                />
                <ChipGroup legend="Ordina per" options={SORTS.map((s) => ({ value: s, label: SORT_LABEL[s] }))} value={ordine} onChange={(s) => setOrdine(s ?? "nome")} />
              </View>
            )}

            <View style={styles.group}>
              <View accessibilityLiveRegion="polite" style={styles.status}>
                {loading && <ActivityIndicator color={colors.primary} />}
                <Txt bold>{loading ? "Cerco…" : current?.error ? "" : countLabel(total)}</Txt>
              </View>
              {current?.error && (
                <View accessibilityRole="alert" style={[styles.error, { backgroundColor: colors.redSoft }]}>
                  <Txt bold tone="red">
                    {current.error}
                  </Txt>
                </View>
              )}
              {!loading && !current?.error && total === 0 && (
                <View style={[styles.empty, { backgroundColor: colors.surface2 }]}>
                  <Image source={nessunRisultato} style={styles.emptyArt} contentFit="contain" accessible={false} />
                  <View style={styles.flexGap}>
                    <Txt bold>Nessuna confezione trovata.</Txt>
                    <Txt variant="small" tone="inkMuted">
                      Prova con il principio attivo, con meno parole o togliendo qualche filtro.
                    </Txt>
                  </View>
                </View>
              )}
              <View role="list" aria-busy={loading} style={[styles.list, loading && styles.dim]}>
                {shown.map((m) => (
                  <View key={m.aic} role="listitem">
                    <MedicineCard medicine={m} />
                  </View>
                ))}
              </View>
              {!loading && items.length < total && (
                <Button
                  label={`Mostra altre confezioni (${number(total - items.length)})`}
                  variant="secondary"
                  busy={extra?.loading}
                  onPress={() => void loadMore()}
                />
              )}
            </View>
          </>
        ) : (
          <View style={styles.group}>
            <Txt variant="small" tone="inkMuted">
              I preferiti restano solo su questo telefono.
            </Txt>
            {favorites.list.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.surface2 }]}>
                <Txt bold>Non hai ancora preferiti.</Txt>
                <Txt variant="small" tone="inkMuted">
                  Tocca il cuore su una confezione per ritrovarla qui.
                </Txt>
              </View>
            ) : fav?.error ? (
              <View accessibilityRole="alert" style={[styles.error, { backgroundColor: colors.redSoft }]}>
                <Txt bold tone="red">
                  {fav.error}
                </Txt>
                <Button label="Riprova" variant="secondary" onPress={() => setFavAttempt((n) => n + 1)} />
              </View>
            ) : !fav ? (
              <View accessibilityLiveRegion="polite" style={styles.status}>
                <ActivityIndicator color={colors.primary} />
                <Txt bold>Carico i preferiti…</Txt>
              </View>
            ) : (
              <View role="list" style={styles.list}>
                {fav.items.map((m) => (
                  <View key={m.aic} role="listitem">
                    <MedicineCard medicine={m} />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {info && <CatalogSource info={info} />}
      </ScrollView>

      {compare.list.length > 0 && (
        <View pointerEvents="box-none" style={styles.barWrap}>
          <View style={[styles.bar, { backgroundColor: colors.surface, borderColor: colors.line, shadowColor: colors.ink }]}>
            <ArrowLeftRight color={colors.primary} size={20} />
            <Txt variant="small" bold style={styles.flex}>
              {compare.list.length} su {compare.max} nel confronto
            </Txt>
            <Button label="Svuota" variant="ghost" onPress={compare.clear} style={styles.barButton} />
            <Button label="Confronta" onPress={() => router.push("/mercato/confronto")} style={styles.barButton} />
          </View>
        </View>
      )}
    </View>
  );
}

/** Le forme farmaceutiche come riquadri illustrati da scorrere: pulsanti di scelta */
function FormPicker({ value, onChange }: { value: FormFamily | null; onChange: (f: FormFamily | null) => void }) {
  const { colors } = useTheme();
  const options: { value: FormFamily | null; label: string }[] = [{ value: null, label: "Tutte" }, ...FORM_FAMILIES.map((f) => ({ value: f, label: FORM_FAMILY_LABEL[f] }))];
  return (
    <View style={styles.group}>
      <Txt bold header>
        Forma
      </Txt>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formRow} contentContainerStyle={styles.formRowContent}>
        <View role="radiogroup" accessibilityLabel="Forma" style={styles.forms}>
          {options.map((o) => {
            const on = value === o.value;
            return (
              <Pressable
                key={o.value ?? "tutte"}
                role="radio"
                accessibilityLabel={o.label}
                accessibilityState={{ checked: on }}
                onPress={() => onChange(o.value)}
                style={({ pressed }) => [
                  styles.formTile,
                  { borderColor: on ? colors.primary : colors.line, backgroundColor: on ? colors.primarySoft : colors.surface, transform: [{ scale: pressed ? 0.96 : 1 }] },
                ]}
              >
                <View style={styles.formArt}>{o.value ? <FormArt family={o.value} size={48} /> : <LayoutGrid color={colors.primary} size={32} />}</View>
                <Txt variant="small" bold style={styles.center}>
                  {o.label}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function ChipGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { value: T | null; label: string }[];
  value: T | null;
  onChange: (v: T | null) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.chipGroup}>
      <Txt bold header>
        {legend}
      </Txt>
      <View role="radiogroup" accessibilityLabel={legend} style={styles.chips}>
        {options.map((o) => {
          const on = value === o.value;
          return (
            <Pressable
              key={o.value ?? "tutti"}
              role="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={o.label}
              onPress={() => onChange(o.value)}
              style={({ pressed }) => [
                styles.chip,
                { borderColor: on ? colors.primary : colors.line, backgroundColor: on ? colors.primary : colors.surface, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
            >
              <Txt variant="small" bold style={{ color: on ? colors.onPrimary : colors.ink }}>
                {o.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Una scelta con molte voci lunghe (le categorie ATC): chiusa mostra la voce scelta, aperta
 * l'elenco intero, una voce per riga. Come un menu a tendina, ma con aree di tocco ampie.
 */
function SelectList<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { value: T | null; label: string }[];
  value: T | null;
  onChange: (v: T | null) => void;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)?.label ?? options[0]?.label ?? "";
  return (
    <View style={styles.chipGroup}>
      <Txt bold header>
        {legend}
      </Txt>
      <Pressable
        role="button"
        accessibilityLabel={`${legend}: ${current}`}
        accessibilityHint={open ? "Chiude l'elenco" : "Apre l'elenco delle categorie"}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        style={({ pressed }) => [styles.select, { borderColor: open ? colors.primary : colors.line, backgroundColor: colors.surface, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
      >
        <Txt variant="small" bold style={styles.flex}>
          {current}
        </Txt>
        <ChevronDown color={colors.inkMuted} size={20} style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }} />
      </Pressable>
      {open && (
        <View role="radiogroup" accessibilityLabel={legend} style={[styles.options, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          {options.map((o, i) => {
            const on = value === o.value;
            return (
              <Pressable
                key={o.value ?? "tutte"}
                role="radio"
                accessibilityLabel={o.label}
                accessibilityState={{ checked: on }}
                onPress={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                style={({ pressed }) => [
                  styles.option,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
                  { backgroundColor: pressed ? colors.surface2 : on ? colors.primarySoft : "transparent" },
                ]}
              >
                <View style={[styles.radio, { borderColor: on ? colors.primary : colors.inkMuted }]}>{on && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}</View>
                <Txt variant="small" bold={on} style={styles.flex}>
                  {o.label}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 20, paddingBottom: 48, gap: 24, width: "100%", maxWidth: 640, alignSelf: "center" },
  contentWithBar: { paddingBottom: 120 },
  tabs: { flexDirection: "row", gap: 4, borderRadius: 18, padding: 4 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 48, borderRadius: 14 },
  tabOn: { shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  group: { gap: 12 },
  searchBox: { justifyContent: "center" },
  searchIcon: { position: "absolute", left: 16, zIndex: 1 },
  input: { minHeight: 52, borderWidth: 2, borderRadius: 16, paddingLeft: 48, paddingRight: 48 },
  clear: { position: "absolute", right: 4, width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  formRow: { marginHorizontal: -20 },
  formRowContent: { paddingHorizontal: 20, paddingBottom: 4 },
  forms: { flexDirection: "row", gap: 8 },
  formTile: { minWidth: 88, maxWidth: 120, alignItems: "center", gap: 4, borderWidth: 2, borderRadius: 24, paddingHorizontal: 6, paddingVertical: 8 },
  formArt: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  center: { textAlign: "center" },
  filterRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  filters: { gap: 16, borderRadius: 24, padding: 16 },
  chipGroup: { gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { minHeight: 44, justifyContent: "center", borderWidth: 2, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6 },
  select: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 48, borderWidth: 2, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 },
  options: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  option: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48, paddingHorizontal: 14, paddingVertical: 8 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  status: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 24 },
  error: { gap: 12, borderRadius: 24, padding: 16 },
  empty: { flexDirection: "row", alignItems: "center", gap: 16, borderRadius: 24, padding: 20 },
  emptyArt: { width: 88, height: 88 },
  emptyBox: { gap: 4, borderRadius: 24, padding: 20 },
  flexGap: { flex: 1, gap: 4 },
  flex: { flex: 1 },
  list: { gap: 12 },
  dim: { opacity: 0.6 },
  barWrap: { position: "absolute", left: 16, right: 16, bottom: 12, alignItems: "center" },
  bar: {
    width: "100%",
    maxWidth: 520,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  barButton: { minHeight: 44, paddingHorizontal: 12 },
});
