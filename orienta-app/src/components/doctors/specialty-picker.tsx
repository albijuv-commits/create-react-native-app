import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SPECIALTIES, getSpecialty, type SpecialtyId } from "@data/vocab/specialties";
import { Txt } from "~/components/ui/text";
import { SPECIALIST_ILLUSTRATIONS } from "~/lib/illustrations";
import { useTheme } from "~/theme/theme";

/** I riquadri si allargano quanto serve alla parola più lunga («Otorinolaringoiatra»), senza tagliarla */
const TILE = 104;
const TILE_MAX = 168;
const GUTTER = 20;

/** Medico di base sempre per primo, poi lo specialista consigliato, il pediatra e gli altri; il pronto soccorso in fondo */
export function orderedSpecialties(recommended: SpecialtyId | null): SpecialtyId[] {
  const first: SpecialtyId[] = ["medico-di-base", ...(recommended ? [recommended] : []), "pediatra"];
  const rest = SPECIALTIES.map((s) => s.id).filter((id) => id !== "pronto-soccorso" && !first.includes(id));
  return [...new Set<SpecialtyId>([...first, ...rest, "pronto-soccorso"])];
}

/**
 * I professionisti in una fila di riquadri illustrati da scorrere, come nella web app. Sono pulsanti
 * di scelta; quello scelto (anche quando arriva dai risultati) resta visibile nella fila. Sotto,
 * cosa fa.
 */
export function SpecialtyPicker({
  value,
  onChange,
  recommended,
  reduced,
}: {
  value: SpecialtyId;
  onChange: (id: SpecialtyId) => void;
  recommended: SpecialtyId | null;
  reduced: boolean;
}) {
  const { colors } = useTheme();
  const scroller = useRef<ScrollView>(null);
  const tiles = useRef(new Map<SpecialtyId, { x: number; width: number }>());
  const [rowWidth, setRowWidth] = useState(0);
  const selected = getSpecialty(value);

  const reveal = (id: SpecialtyId, animated: boolean) => {
    const tile = tiles.current.get(id);
    if (!tile || rowWidth === 0) return;
    scroller.current?.scrollTo({ x: Math.max(0, tile.x - (rowWidth - tile.width) / 2), animated });
  };

  // Si scorre solo la fila, mai la pagina
  useEffect(() => {
    const tile = tiles.current.get(value);
    if (!tile || rowWidth === 0) return;
    scroller.current?.scrollTo({ x: Math.max(0, tile.x - (rowWidth - tile.width) / 2), animated: !reduced });
  }, [value, rowWidth, reduced]);

  return (
    <View style={styles.wrap}>
      <Txt variant="heading" header>
        Chi cerchi?
      </Txt>
      <ScrollView
        ref={scroller}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.row}
        contentContainerStyle={styles.rowContent}
        onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
      >
        <View role="radiogroup" accessibilityLabel="Chi cerchi?" style={styles.tiles}>
          {orderedSpecialties(recommended).map((id) => {
            const art = SPECIALIST_ILLUSTRATIONS[id];
            const on = id === value;
            const isRecommended = id === recommended;
            const label = getSpecialty(id).label;
            return (
              <Pressable
                key={id}
                role="radio"
                accessibilityLabel={isRecommended ? `${label}, consigliato` : label}
                accessibilityState={{ checked: on }}
                onPress={() => onChange(id)}
                onLayout={(e) => {
                  tiles.current.set(id, { x: e.nativeEvent.layout.x + GUTTER, width: e.nativeEvent.layout.width });
                  if (on) reveal(id, false);
                }}
                style={({ pressed }) => [
                  styles.tile,
                  {
                    borderColor: on ? colors.primary : id === "pronto-soccorso" ? colors.red : colors.line,
                    backgroundColor: on ? colors.primarySoft : colors.surface,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
              >
                {art !== undefined ? (
                  <Image source={art} style={[styles.art, on && styles.artOn]} contentFit="contain" accessible={false} />
                ) : (
                  <View style={[styles.art, styles.artEmpty, { backgroundColor: colors.surface2 }]} />
                )}
                <Txt variant="small" bold style={styles.label}>
                  {label}
                </Txt>
                {isRecommended && (
                  <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                    <Txt variant="small" bold style={[styles.badgeText, { color: colors.onAccent }]}>
                      Consigliato
                    </Txt>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View accessibilityLiveRegion="polite" style={[styles.about, { backgroundColor: colors.surface2 }]}>
        <Txt variant="small">
          <Txt variant="small" bold>
            {selected.label}.
          </Txt>{" "}
          {selected.description}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { marginHorizontal: -GUTTER },
  rowContent: { paddingHorizontal: GUTTER, paddingBottom: 4 },
  tiles: { flexDirection: "row", gap: 8 },
  tile: { minWidth: TILE, maxWidth: TILE_MAX, alignItems: "center", gap: 4, borderWidth: 2, borderRadius: 24, paddingHorizontal: 6, paddingTop: 10, paddingBottom: 8 },
  art: { width: 56, height: 56 },
  artOn: { transform: [{ scale: 1.1 }] },
  artEmpty: { borderRadius: 28 },
  label: { textAlign: "center" },
  badge: { marginTop: "auto", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 },
  badgeText: { textAlign: "center" },
  about: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
});
