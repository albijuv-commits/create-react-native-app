import { router } from "expo-router";
import { Building2, ChevronDown, Globe2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { CatalogRequestError } from "@/lib/medicines/client";
import { FORM_FAMILY_LABEL } from "@/lib/medicines/forms";
import { displayCompany, formatEuro, formatPriceDates, formatPriceRange, groupScope } from "@/lib/medicines/text";
import type { BrandsResponse, MedicineSummary } from "@/lib/medicines/types";
import { FieldError } from "~/components/triage/parts";
import { Txt } from "~/components/ui/text";
import { brandsFor } from "~/lib/catalog";
import { useTheme } from "~/theme/theme";

const VISIBLE = 6;

export function openMedicine(aic: string) {
  router.push({ pathname: "/mercato/[aic]", params: { aic } });
}

/**
 * Sotto ogni confezione: un riquadro da aprire con i marchi e le aziende che hanno lo stesso
 * principio attivo, la fascia di prezzo a parità di dosaggio e forma, una frase sul principio
 * attivo e i marchi più diffusi in Europa. I dati arrivano solo quando lo si apre.
 */
export function BrandsDisclosure({ medicine: m }: { medicine: MedicineSummary }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<{ data?: BrandsResponse; error?: string } | null>(null);
  const [all, setAll] = useState(false);
  const stats = m.stats;

  useEffect(() => {
    if (!open || state) return;
    const c = new AbortController();
    brandsFor(m.aic, c.signal).then(
      (data) => setState({ data }),
      (e: unknown) => {
        if (!c.signal.aborted) setState({ error: e instanceof CatalogRequestError ? e.message : "Non riusciamo a caricare i marchi." });
      },
    );
    return () => c.abort();
  }, [open, state, m.aic]);

  if (!stats || stats.brands < 1) return null;
  const range = stats.priceMin !== null && stats.priceMax !== null ? formatPriceRange(stats.priceMin, stats.priceMax) : null;

  return (
    <View style={[styles.box, { backgroundColor: colors.surface2 }]}>
      <Pressable
        role="button"
        aria-expanded={open}
        onPress={() => {
          // Riaprendo dopo un errore si riprova
          if (!open && state?.error) setState(null);
          setOpen((o) => !o);
        }}
        style={styles.head}
      >
        <Building2 color={colors.primary} size={20} />
        <View style={styles.flex}>
          <Txt variant="small" bold>
            Marchi, aziende e prezzi
          </Txt>
          <Txt variant="small" tone="inkMuted">
            {stats.brands === 1 ? "1 marchio" : `${stats.brands} marchi`}
            {range ? ` · ${range}` : ""}
          </Txt>
        </View>
        <ChevronDown color={colors.inkMuted} size={20} style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }} />
      </Pressable>
      {open && (
        <View style={styles.body}>
          {!state && (
            <View accessibilityLiveRegion="polite" style={styles.row}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Txt variant="small" tone="inkMuted">
                Carico i marchi…
              </Txt>
            </View>
          )}
          {state?.error && <FieldError>{state.error}</FieldError>}
          {state?.data && <BrandsBody data={state.data} medicine={m} all={all} onShowAll={() => setAll(true)} />}
        </View>
      )}
    </View>
  );
}

function BrandsBody({ data, medicine: m, all, onShowAll }: { data: BrandsResponse; medicine: MedicineSummary; all: boolean; onShowAll: () => void }) {
  const { colors } = useTheme();
  const { brands, summary, europe } = data;
  const r = brands.range;
  const shown = all ? brands.brands : brands.brands.slice(0, VISIBLE);
  const otc = m.supplyCode === "OTC" || m.supplyCode === "SOP";
  const scope = groupScope(brands.dosage, FORM_FAMILY_LABEL[brands.formFamily], brands.form, brands.formFamily);
  const dates = formatPriceDates(brands.priceDates.from, brands.priceDates.to);

  return (
    <View style={styles.inner}>
      {summary && (
        <Txt variant="small">
          <Txt variant="small" bold>
            {summary.name}.
          </Txt>{" "}
          {summary.text}{" "}
          <Txt variant="small" bold tone="primary" role="link" onPress={() => openMedicine(m.aic)} style={styles.underline}>
            Scheda del principio attivo
          </Txt>
        </Txt>
      )}

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Txt variant="small" bold>
          Fascia di prezzo
          {scope ? <Txt variant="small" tone="inkMuted">{` · ${scope}`}</Txt> : null}
        </Txt>
        {r.priceMin !== null && r.priceMax !== null ? (
          <>
            <Txt variant="heading" style={styles.tabular}>
              {formatPriceRange(r.priceMin, r.priceMax)}
            </Txt>
            <Txt variant="small" tone="inkMuted">
              {r.priced === 1 ? "1 confezione" : `${r.priced} confezioni`} con prezzo nelle liste AIFA{dates ? ` (${dates})` : ""}. Il prezzo cambia anche
              con il numero di unità.
            </Txt>
          </>
        ) : (
          <Txt variant="small" tone="inkMuted">
            Le liste AIFA non riportano prezzi per questo dosaggio e forma.{otc ? " Senza ricetta il prezzo lo decide la farmacia: chiedilo lì." : ""}
          </Txt>
        )}
      </View>

      <View style={styles.list}>
        <Txt variant="small" bold>
          {brands.brands.length === 1 ? "1 marchio" : `${brands.brands.length} marchi`} di {brands.companies === 1 ? "1 azienda" : `${brands.companies} aziende`}
        </Txt>
        <View role="list" style={[styles.rows, { backgroundColor: colors.surface }]}>
          {shown.map((b, i) => (
            <View key={b.name} role="listitem" style={[styles.brand, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line }]}>
              <View style={styles.flex}>
                <Txt variant="small" bold tone="primary" role="link" onPress={() => openMedicine(b.aic)} style={styles.underline}>
                  {b.name}
                </Txt>
                <Txt variant="small" tone="inkMuted">
                  {b.companies.map(displayCompany).join(" · ")}
                </Txt>
              </View>
              <Txt variant="small" bold={b.priceMin !== null} tone={b.priceMin !== null ? "ink" : "inkMuted"} style={styles.price}>
                {b.priceMin !== null && b.priceMax !== null
                  ? b.priceMin === b.priceMax
                    ? formatEuro(b.priceMin)
                    : `${formatEuro(b.priceMin)}–${formatEuro(b.priceMax)}`
                  : b.sameDosage
                    ? "prezzo non indicato"
                    : "altro dosaggio o forma"}
              </Txt>
            </View>
          ))}
        </View>
        {!all && brands.brands.length > VISIBLE && (
          <Pressable role="button" onPress={onShowAll} style={styles.more}>
            <Txt variant="small" bold tone="primary" style={styles.underline}>
              Mostra tutti i {brands.brands.length} marchi
            </Txt>
          </Pressable>
        )}
      </View>

      {europe && europe.names.length > 0 && (
        <View style={styles.row}>
          <Globe2 color={colors.primary} size={16} style={styles.icon} />
          <Txt variant="small" style={styles.flex}>
            In Europa anche come <Txt variant="small" bold>{europe.names.join(", ")}</Txt>
            {europe.total > europe.names.length ? ` e altri ${europe.total - europe.names.length} marchi` : ""}, in {europe.countries} Paesi.{" "}
            <Txt variant="small" bold tone="primary" role="link" onPress={() => openMedicine(m.aic)} style={styles.underline}>
              Cerca per Paese
            </Txt>
          </Txt>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 16 },
  head: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 48, paddingHorizontal: 12, paddingVertical: 8 },
  flex: { flex: 1 },
  body: { paddingHorizontal: 12, paddingBottom: 12 },
  inner: { gap: 12 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  icon: { marginTop: 3 },
  card: { gap: 2, borderRadius: 12, padding: 12 },
  tabular: { fontVariant: ["tabular-nums"] },
  list: { gap: 6 },
  rows: { borderRadius: 12, overflow: "hidden" },
  brand: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 12, paddingVertical: 8 },
  price: { textAlign: "right", fontVariant: ["tabular-nums"], flexShrink: 0, maxWidth: "45%" },
  more: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  underline: { textDecorationLine: "underline" },
});
