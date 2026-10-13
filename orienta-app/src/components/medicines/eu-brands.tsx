import { Globe2 } from "lucide-react-native";
import { useState, type Ref } from "react";
import { Pressable, ScrollView, StyleSheet, View, type Text } from "react-native";
import type { EuBrand } from "@/lib/medicines/eu-brand";
import { formatItalianDay } from "@/lib/medicines/text";
import { Txt } from "~/components/ui/text";
import { openSource } from "~/lib/links";
import { useTheme } from "~/theme/theme";

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
  headingRef,
}: {
  ingredient: string;
  brands: EuBrand[];
  countries: string[];
  sameRoute: boolean;
  routeLabel: string | null;
  updated: string | null;
  sourceUrl: string;
  headingRef?: Ref<Text>;
}) {
  const { colors } = useTheme();
  const [country, setCountry] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const choices = countries.filter((c) => c !== "Italia" && c !== "Tutta l'UE");
  const inCountry = country ? brands.filter((b) => b.countries.includes(country) || b.countries.includes("Tutta l'UE")).sort((a, b) => a.name.localeCompare(b.name, "it")) : [];
  const widespread = brands.filter((b) => b.countries.length >= 2);
  const topList = all ? brands : (widespread.length ? widespread : brands).slice(0, TOP);
  const options: { value: string | null; label: string }[] = [{ value: null, label: "I marchi più diffusi" }, ...choices.map((c) => ({ value: c, label: c }))];

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <View style={styles.titleRow}>
          <Globe2 color={colors.primary} size={24} />
          <Txt ref={headingRef} variant="heading" header style={styles.flex}>
            In Europa
          </Txt>
        </View>
        <Txt variant="small" tone="inkMuted">
          Lo stesso principio attivo ({ingredient.toLowerCase()}) è autorizzato in {countries.length} Paesi europei: qui{" "}
          {brands.length === 1 ? "1 marchio" : `${brands.length} marchi`}
          {sameRoute && routeLabel ? ` da usare ${routeLabel}` : ""}. I nomi generici, fatti di principio attivo e azienda, non sono elencati.
        </Txt>
      </View>

      <View style={styles.group}>
        <Txt bold header>
          Scegli un Paese
        </Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipRowContent}>
          <View role="radiogroup" accessibilityLabel="Scegli un Paese" style={styles.chips}>
            {options.map((o) => {
              const on = country === o.value;
              return (
                <Pressable
                  key={o.value ?? "diffusi"}
                  role="radio"
                  aria-checked={on}
                  onPress={() => setCountry(o.value)}
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
        </ScrollView>
      </View>

      {country ? (
        <View accessibilityLiveRegion="polite" style={styles.group}>
          <Txt variant="small" bold>
            {inCountry.length === 0 ? `Nessun marchio commerciale trovato in ${country}.` : `${inCountry.length === 1 ? "1 marchio" : `${inCountry.length} marchi`} in ${country}`}
          </Txt>
          {inCountry.length > 0 && (
            <View role="list" style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.line }]}>
              {inCountry.map((b, i) => (
                <View key={b.name} role="listitem" style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line }]}>
                  <Txt bold>{b.name}</Txt>
                  <Txt variant="small" tone="inkMuted">
                    {b.routes.join(", ")}
                    {b.holders.length > 0 ? ` · ${b.holders.join(" · ")}` : ""}
                  </Txt>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.group}>
          <View role="list" accessibilityLabel="Marchi più diffusi in Europa" style={styles.pills}>
            {topList.map((b) => (
              <View key={b.name} role="listitem" style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.line }]}>
                <Txt variant="small">
                  <Txt variant="small" bold>
                    {b.name}
                  </Txt>
                  <Txt variant="small" tone="inkMuted">
                    {` · ${b.countries.includes("Tutta l'UE") ? "tutta l'UE" : b.countries.length === 1 ? b.countries[0] : `${b.countries.length} Paesi`}`}
                  </Txt>
                </Txt>
              </View>
            ))}
          </View>
          {!all && brands.length > topList.length && (
            <Pressable role="button" onPress={() => setAll(true)} style={styles.more}>
              <Txt variant="small" bold tone="primary" style={styles.link}>
                Mostra tutti i {brands.length} marchi
              </Txt>
            </Pressable>
          )}
        </View>
      )}

      <Txt variant="small" tone="inkMuted">
        Dosaggi, forme e regole di vendita (con o senza ricetta) cambiano da Paese a Paese: all&apos;estero chiedi al farmacista. Fonte:{" "}
        <Txt variant="small" bold tone="primary" role="link" accessibilityHint="Si apre nel browser" onPress={() => openSource(sourceUrl)} style={styles.link}>
          elenco EMA dei medicinali autorizzati nell&apos;UE e nel SEE
        </Txt>
        {updated ? `, aggiornato al ${formatItalianDay(updated)}` : ""}.
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  head: { gap: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  group: { gap: 8 },
  chipRow: { marginHorizontal: -20 },
  chipRowContent: { paddingHorizontal: 20, paddingBottom: 4 },
  chips: { flexDirection: "row", gap: 8 },
  chip: { minHeight: 44, justifyContent: "center", borderWidth: 2, borderRadius: 999, paddingHorizontal: 16 },
  list: { borderWidth: 1, borderRadius: 24, overflow: "hidden" },
  row: { gap: 2, paddingHorizontal: 16, paddingVertical: 10 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  more: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  link: { textDecorationLine: "underline" },
});
