import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronRight, Search, X } from "lucide-react-native";
import { useCallback, useRef, useState, type ReactElement } from "react";
import { Platform, Pressable, ScrollView, SectionList, StyleSheet, TextInput, View, type ViewToken } from "react-native";
import nessunRisultato from "@/assets/illustrations/stato-nessun-risultato.webp";
import tutte from "@/assets/illustrations/vetrino-cellule.webp";
import { BODY_AREAS, type BodyAreaId } from "@data/vocab/body";
import { searchConditions, type ConditionListItem } from "@/lib/conditions/search";
import { SlidePreview } from "~/components/slide/slide-preview";
import { Txt } from "~/components/ui/text";
import { AREA_ILLUSTRATIONS } from "~/lib/illustrations";
import { useTheme } from "~/theme/theme";
import { textStyle } from "~/theme/type";

function groupByLetter(items: ConditionListItem[]) {
  const groups = new Map<string, ConditionListItem[]>();
  for (const item of items) {
    const letter = item.name.normalize("NFD").charAt(0).toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), item]);
  }
  return [...groups.entries()].map(([title, data]) => ({ title, data }));
}

const TILES = [{ id: null, label: "Tutte le condizioni", short: "Tutte", image: tutte }, ...BODY_AREAS.map((a) => ({ id: a.id, label: a.label, short: a.short, image: AREA_ILLUSTRATIONS[a.id] }))];

/**
 * Elenco delle condizioni: ricerca per nome o sintomo, filtro per area del corpo e righe con
 * l'anteprima animata del vetrino. Senza ricerca le righe sono raggruppate per iniziale.
 */
export function ConditionList({
  items,
  header,
  footer,
  query,
  area,
  onQuery,
  onArea,
}: {
  items: readonly ConditionListItem[];
  header?: ReactElement;
  footer?: ReactElement;
  query: string;
  area: BodyAreaId | null;
  onQuery: (q: string) => void;
  onArea: (a: BodyAreaId | null) => void;
}) {
  const { colors, scale } = useTheme();
  const [visible, setVisible] = useState<ReadonlySet<string>>(new Set());
  const [focused, setFocused] = useState(false);
  const chips = useRef<ScrollView>(null);
  const chipX = useRef(new Map<string, number>());
  const results = searchConditions(items, query, area);
  const searching = query.trim().length > 0;
  const areaLabel = BODY_AREAS.find((a) => a.id === area)?.label;
  // Senza risultati niente sezioni, così compare il messaggio «Nessuna condizione trovata»
  const sections = results.length === 0 ? [] : searching ? [{ title: "", data: results }] : groupByLetter(results);

  // Le anteprime si muovono quando la loro riga è visibile per almeno il 60% (la funzione non deve cambiare)
  const onViewable = useCallback(({ viewableItems }: { viewableItems: ViewToken<ConditionListItem>[] }) => {
    setVisible(new Set(viewableItems.map((v) => v.item.id)));
  }, []);

  const selectArea = (id: BodyAreaId | null) => {
    onArea(id);
    // Il riquadro scelto resta visibile nella fila
    const x = chipX.current.get(id ?? "tutte");
    if (x !== undefined) chips.current?.scrollTo({ x: Math.max(0, x - 16), animated: true });
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
      onViewableItemsChanged={onViewable}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.content}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <View style={styles.top}>
          {header}
          <View style={styles.searchBlock}>
            <Txt bold nativeID="cerca-condizioni">
              Cerca per nome o sintomo
            </Txt>
            <View style={[styles.searchField, { borderColor: focused ? colors.primary : colors.line, backgroundColor: colors.surface }]}>
              <Search color={colors.inkMuted} size={20} />
              <TextInput
                value={query}
                onChangeText={onQuery}
                placeholder="Ad esempio tosse o prurito…"
                placeholderTextColor={colors.inkMuted}
                accessibilityLabel="Cerca per nome o sintomo"
                accessibilityLabelledBy="cerca-condizioni"
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                enterKeyHint="search"
                inputMode="search"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={[styles.input, textStyle("body", scale, false), { color: colors.ink }]}
              />
              {query ? (
                <Pressable role="button" accessibilityLabel="Cancella la ricerca" onPress={() => onQuery("")} style={styles.clear}>
                  <X color={colors.inkMuted} size={20} />
                </Pressable>
              ) : null}
            </View>
          </View>

          <ScrollView ref={chips} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} accessibilityLabel="Filtra per area del corpo" style={styles.chipsRow}>
            {TILES.map((tile) => {
              const active = area === tile.id;
              return (
                <Pressable
                  key={tile.id ?? "tutte"}
                  role="button"
                  accessibilityLabel={tile.label}
                  accessibilityState={{ selected: active }}
                  onPress={() => selectArea(tile.id)}
                  onLayout={(e) => chipX.current.set(tile.id ?? "tutte", e.nativeEvent.layout.x)}
                  style={({ pressed }) => [
                    styles.tile,
                    { borderColor: active ? colors.primary : colors.line, backgroundColor: active ? colors.primarySoft : colors.surface, transform: [{ scale: pressed ? 0.96 : 1 }] },
                  ]}
                >
                  <Image source={tile.image} style={[styles.tileImage, active && styles.tileImageActive]} contentFit="contain" accessible={false} />
                  <Txt variant="small" bold tone={active ? "primary" : "ink"} style={styles.tileLabel}>
                    {tile.short}
                  </Txt>
                </Pressable>
              );
            })}
          </ScrollView>

          <Txt variant="small" tone="inkMuted" accessibilityLiveRegion="polite">
            {results.length === 1 ? "1 condizione" : `${results.length} condizioni`}
            {areaLabel ? ` in «${areaLabel}»` : ""}
            {searching ? ` per «${query.trim()}»` : ""}
          </Txt>
        </View>
      }
      ListEmptyComponent={
        <View style={[styles.empty, { backgroundColor: colors.surface2 }]}>
          <Image source={nessunRisultato} style={styles.emptyImage} contentFit="contain" accessible={false} />
          <View style={styles.emptyText}>
            <Txt bold>Nessuna condizione trovata.</Txt>
            <Txt variant="small" tone="inkMuted">
              Prova con un&apos;altra parola o con un sintomo, ad esempio «tosse». Se non sai da dove partire,{" "}
              <Txt variant="small" bold tone="primary" role="link" onPress={() => router.navigate("/")} style={styles.link}>
                descrivi cosa senti
              </Txt>
              .
            </Txt>
          </View>
        </View>
      }
      renderSectionHeader={({ section }) =>
        section.title ? (
          <Txt variant="title" tone="accent" header style={styles.letter}>
            {section.title}
          </Txt>
        ) : null
      }
      ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.line }]} />}
      renderItem={({ item }) => <Row item={item} visible={visible.has(item.id)} />}
      ListFooterComponent={footer}
    />
  );
}

function Row({ item, visible }: { item: ConditionListItem; visible: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable
      role="link"
      accessibilityLabel={item.name}
      accessibilityHint={item.teaser}
      onPress={() => router.push({ pathname: "/condizioni/[id]", params: { id: item.id } })}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surface2 }]}
    >
      <SlidePreview spec={item.animation} visible={visible} />
      <View style={styles.rowText}>
        <Txt variant="heading">{item.name}</Txt>
        <Txt variant="small" tone="inkMuted" numberOfLines={2}>
          {item.teaser}
        </Txt>
      </View>
      <ChevronRight color={colors.inkMuted} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48, maxWidth: 672, width: "100%", alignSelf: "center" },
  top: { gap: 20, paddingBottom: 8 },
  searchBlock: { gap: 8 },
  searchField: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 52, borderWidth: 2, borderRadius: 18, paddingLeft: 12 },
  // Sul web il bordo del campo diventa viola con il fuoco: il contorno del browser sarebbe doppio
  input: { flex: 1, minHeight: 48, paddingVertical: 8, ...Platform.select({ web: { outlineWidth: 0 }, default: {} }) },
  clear: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  chipsRow: { marginHorizontal: -16 },
  chips: { gap: 8, paddingHorizontal: 16, paddingBottom: 4 },
  tile: { width: 92, alignItems: "center", gap: 4, borderWidth: 2, borderRadius: 24, paddingHorizontal: 6, paddingTop: 6, paddingBottom: 8 },
  tileImage: { width: 56, height: 56 },
  tileImageActive: { transform: [{ scale: 1.1 }] },
  tileLabel: { textAlign: "center", fontSize: 13, lineHeight: 16 },
  letter: { paddingTop: 16, paddingBottom: 4 },
  separator: { height: StyleSheet.hairlineWidth },
  row: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 12, paddingHorizontal: 8, marginHorizontal: -8, borderRadius: 16 },
  rowText: { flex: 1, gap: 2 },
  empty: { flexDirection: "row", alignItems: "center", gap: 16, borderRadius: 16, padding: 20 },
  emptyImage: { width: 88, height: 88 },
  emptyText: { flex: 1, gap: 8 },
  link: { textDecorationLine: "underline" },
});
