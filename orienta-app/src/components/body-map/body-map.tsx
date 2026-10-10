import { Check, ChevronDown, RotateCw, ScanFace } from "lucide-react-native";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg from "react-native-svg";
import { BODY_ZONES, bodyZoneLabel, type BodyView, type BodyZoneId } from "@data/vocab/body";
import { BODY_SHAPES } from "@/components/body-map/body-shapes";
import { C } from "@/components/slide/palette";
import { Txt } from "~/components/ui/text";
import { useReducedMotion } from "~/lib/use-reduced-motion";
import { useTheme } from "~/theme/theme";
import { BodyFigure, ZoneShape } from "./body-figure";

const FACE: BodyZoneId[] = ["occhi", "orecchie", "naso", "bocca"];
const MAP_ZONES = BODY_ZONES.filter((z) => z.views.length > 0);

/** Si dice a VoiceOver e TalkBack cosa è cambiato (sulla mappa le zone non hanno un'etichetta propria) */
function announce(text: string) {
  if (Platform.OS !== "web") AccessibilityInfo.announceForAccessibility(text);
}

/**
 * La mappa del corpo dell'intervista: fronte e retro come le due facce di una carta che si gira
 * (con il pulsante «Gira» o trascinando di lato). Si tocca una zona per sceglierla. Per chi usa
 * VoiceOver o TalkBack c'è sempre l'elenco delle zone, come nella web app.
 */
export function BodyMap({ selected, onToggle }: { selected: readonly BodyZoneId[]; onToggle: (zone: BodyZoneId) => void }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const [view, setView] = useState<BodyView>("fronte");
  const [listOpen, setListOpen] = useState(false);
  const turn = useSharedValue(0);

  useEffect(() => {
    const target = view === "fronte" ? 0 : 180;
    turn.value = reduced ? target : withTiming(target, { duration: 500 });
  }, [view, reduced, turn]);

  const front = useAnimatedStyle(() => ({ transform: [{ perspective: 1200 }, { rotateY: `${turn.value}deg` }] }));
  const back = useAnimatedStyle(() => ({ transform: [{ perspective: 1200 }, { rotateY: `${turn.value + 180}deg` }] }));

  const toggle = (zone: BodyZoneId) => {
    announce(`${bodyZoneLabel(zone)}: ${selected.includes(zone) ? "tolta" : "aggiunta"}`);
    onToggle(zone);
  };
  const flip = () => setView((v) => (v === "fronte" ? "retro" : "fronte"));
  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])
    .failOffsetY([-14, 14])
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 60 && Math.abs(e.translationX) > Math.abs(e.translationY) * 1.5) flip();
    });

  const face = (v: BodyView) => (
    <Svg viewBox="-4 -2 108 204" width="100%" height="100%">
      <BodyFigure view={v} />
      {BODY_SHAPES[v].map((s, i) => {
        const zone = s.zone;
        if (!zone) return null;
        const on = selected.includes(zone);
        return (
          <ZoneShape
            key={i}
            shape={s.shape}
            onPress={() => toggle(zone)}
            fill={on ? C.tissueInflamed : C.calm}
            fillOpacity={on ? 0.95 : 0.001}
            stroke={on ? C.highlight : "transparent"}
            strokeWidth="1"
          />
        );
      })}
    </Svg>
  );

  const headActive = selected.some((z) => z === "testa" || FACE.includes(z));

  return (
    <View style={styles.wrap}>
      <Txt variant="small" tone="inkMuted">
        Tocca dove senti fastidio; trascina di lato o usa «Gira» per vedere dietro.
      </Txt>
      <View style={[styles.stage, { backgroundColor: colors.surface2 }]}>
        <GestureDetector gesture={swipe}>
          <View style={styles.card} collapsable={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Animated.View style={[styles.side, front]} pointerEvents={view === "fronte" ? "auto" : "none"}>
              {face("fronte")}
            </Animated.View>
            <Animated.View style={[styles.side, back]} pointerEvents={view === "retro" ? "auto" : "none"}>
              {face("retro")}
            </Animated.View>
          </View>
        </GestureDetector>
        <View style={[styles.badge, { backgroundColor: colors.surface }]} pointerEvents="none">
          <Txt variant="small" bold>
            {view === "fronte" ? "Davanti" : "Dietro"}
          </Txt>
        </View>
        <Pressable
          role="button"
          accessibilityLabel={view === "fronte" ? "Gira: mostra il corpo da dietro" : "Gira: mostra il corpo davanti"}
          onPress={flip}
          style={({ pressed }) => [styles.flip, { backgroundColor: colors.surface, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
        >
          <RotateCw color={colors.primary} size={16} />
          <Txt variant="small" bold tone="primary">
            Gira
          </Txt>
        </Pressable>
      </View>

      {headActive ? (
        <View style={[styles.faceBox, { borderColor: colors.line }]}>
          <View style={styles.row}>
            <ScanFace color={colors.primary} size={20} />
            <Txt variant="small" bold style={styles.flex}>
              Vuoi indicare una parte precisa del viso?
            </Txt>
          </View>
          <View style={styles.chips}>
            {FACE.map((z) => (
              <ZoneToggle key={z} zone={z} active={selected.includes(z)} onToggle={toggle} />
            ))}
          </View>
        </View>
      ) : null}

      <View style={[styles.list, { borderColor: colors.line }]}>
        <Pressable role="button" accessibilityState={{ expanded: listOpen }} onPress={() => setListOpen((o) => !o)} style={styles.listHead}>
          <Txt bold tone="primary" style={styles.flex}>
            Scegli dall&apos;elenco delle zone
          </Txt>
          <ChevronDown color={colors.primary} size={20} style={{ transform: [{ rotate: listOpen ? "180deg" : "0deg" }] }} />
        </Pressable>
        {listOpen ? (
          <View style={[styles.chips, styles.listBody]}>
            {MAP_ZONES.map((z) => (
              <ZoneToggle key={z.id} zone={z.id} active={selected.includes(z.id)} onToggle={toggle} />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ZoneToggle({ zone, active, onToggle }: { zone: BodyZoneId; active: boolean; onToggle: (z: BodyZoneId) => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      role="button"
      accessibilityLabel={bodyZoneLabel(zone)}
      accessibilityState={{ selected: active }}
      onPress={() => onToggle(zone)}
      style={({ pressed }) => [
        styles.zone,
        { borderColor: active ? colors.accent : colors.line, backgroundColor: active ? colors.accentSoft : colors.surface, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      {active ? <Check color={colors.accent} size={16} /> : null}
      <Txt variant="small" bold style={{ color: active ? colors.accent : colors.ink }}>
        {bodyZoneLabel(zone)}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  stage: { height: 384, borderRadius: 24, overflow: "hidden" },
  card: { position: "absolute", left: "20%", right: "20%", top: 16, bottom: 64 },
  side: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backfaceVisibility: "hidden" },
  badge: { position: "absolute", left: 12, top: 12, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  flip: { position: "absolute", left: 12, bottom: 12, flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44, borderRadius: 999, paddingHorizontal: 16 },
  faceBox: { gap: 8, borderWidth: 1, borderRadius: 16, padding: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  list: { borderWidth: 1, borderRadius: 16 },
  listHead: { flexDirection: "row", alignItems: "center", minHeight: 44, paddingHorizontal: 16, paddingVertical: 8 },
  listBody: { paddingHorizontal: 16, paddingBottom: 16 },
  zone: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, borderWidth: 2, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
});
