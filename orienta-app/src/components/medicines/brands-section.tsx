import { Building2 } from "lucide-react-native";
import { useState, type Ref } from "react";
import { Pressable, StyleSheet, View, type Text } from "react-native";
import { FORM_FAMILY_LABEL } from "@/lib/medicines/forms";
import { displayCompany, formatEuro, formatPriceDates, formatPriceRange, groupScope } from "@/lib/medicines/text";
import type { BrandEntry, BrandsInfo } from "@/lib/medicines/types";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";
import { openMedicine } from "./brands-disclosure";

const FIRST = 10;

function BrandRow({ b, selfName, first }: { b: BrandEntry; selfName: string; first: boolean }) {
  const { colors } = useTheme();
  return (
    <View role="listitem" style={[styles.row, !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line }]}>
      <View style={styles.flex}>
        {b.name === selfName ? (
          <Txt bold>
            {b.name}{" "}
            <Txt variant="small" tone="inkMuted">
              (questo marchio)
            </Txt>
          </Txt>
        ) : (
          <Txt bold tone="primary" role="link" accessibilityHint="Apre la scheda" onPress={() => openMedicine(b.aic)} style={styles.link}>
            {b.name}
          </Txt>
        )}
        <Txt variant="small" tone="inkMuted">
          {b.companies.map(displayCompany).join(" · ")} · {b.packages === 1 ? "1 confezione" : `${b.packages} confezioni`}
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
  );
}

/**
 * Tutti i marchi e le aziende con lo stesso principio attivo, con la fascia di prezzo a parità di
 * dosaggio e forma. Ordine: prima chi ha lo stesso dosaggio e la stessa forma, poi alfabetico.
 */
export function BrandsSection({ brands, selfName, otc, headingRef }: { brands: BrandsInfo; selfName: string; otc: boolean; headingRef?: Ref<Text> }) {
  const { colors } = useTheme();
  const [all, setAll] = useState(false);
  const r = brands.range;
  const scope = groupScope(brands.dosage, FORM_FAMILY_LABEL[brands.formFamily], brands.form, brands.formFamily);
  const dates = formatPriceDates(brands.priceDates.from, brands.priceDates.to);
  const shown = all ? brands.brands : brands.brands.slice(0, FIRST);
  const rest = brands.brands.length - FIRST;
  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <View style={styles.titleRow}>
          <Building2 color={colors.primary} size={24} />
          <Txt ref={headingRef} variant="heading" header style={styles.flex}>
            Marchi e aziende
          </Txt>
        </View>
        <Txt variant="small" tone="inkMuted">
          {brands.brands.length === 1 ? "1 marchio" : `${brands.brands.length} marchi`} e {brands.companies === 1 ? "1 azienda" : `${brands.companies} aziende`} con
          lo stesso principio attivo ({brands.ingredient.toLowerCase()}), in {brands.packages === 1 ? "1 confezione" : `${brands.packages} confezioni`}.
        </Txt>
      </View>

      <View style={[styles.range, { backgroundColor: colors.surface2 }]}>
        <Txt bold>
          Fascia di prezzo
          {scope ? <Txt tone="inkMuted">{` · ${scope}`}</Txt> : null}
        </Txt>
        {r.priceMin !== null && r.priceMax !== null ? (
          <>
            <Txt variant="title" style={styles.tabular}>
              {formatPriceRange(r.priceMin, r.priceMax)}
            </Txt>
            <Txt variant="small" tone="inkMuted">
              Su {r.priced === 1 ? "1 confezione" : `${r.priced} confezioni`} con prezzo nelle liste AIFA{dates ? `, ${dates}` : ""}. Dentro la fascia ci sono
              confezioni con un numero di unità diverso: per un confronto alla pari guarda i farmaci equivalenti.
            </Txt>
          </>
        ) : (
          <Txt variant="small" tone="inkMuted">
            Le liste AIFA non riportano prezzi per questo dosaggio e forma.{otc ? " Senza ricetta il prezzo lo decide la farmacia: chiedilo lì." : ""}
          </Txt>
        )}
      </View>

      <View role="list" style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        {shown.map((b, i) => (
          <BrandRow key={b.name} b={b} selfName={selfName} first={i === 0} />
        ))}
      </View>
      {!all && rest > 0 && (
        <Pressable role="button" onPress={() => setAll(true)} style={styles.more}>
          <Txt bold tone="primary" style={styles.link}>
            Mostra gli altri {rest} marchi
          </Txt>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  head: { gap: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  range: { gap: 4, borderRadius: 24, padding: 20 },
  tabular: { fontVariant: ["tabular-nums"] },
  list: { borderWidth: 1, borderRadius: 24, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  price: { textAlign: "right", fontVariant: ["tabular-nums"], flexShrink: 0, maxWidth: "45%" },
  more: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  link: { textDecorationLine: "underline" },
});
