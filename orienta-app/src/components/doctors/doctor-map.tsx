import { MapPin } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { LinearTransition, useAnimatedStyle, useSharedValue, withSpring, ZoomIn } from "react-native-reanimated";
import Svg, { Circle, Line } from "react-native-svg";
import { formatDistance, type LatLon } from "@/lib/doctors/geo";
import type { Doctor, RadiusKm } from "@/lib/doctors/schema";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";
import type { Origin } from "./location-picker";

const MAX_SIZE = 360;
const PIN = 36;
/** I cerchi delle distanze per ogni raggio di ricerca, in km */
const RINGS: Record<RadiusKm, readonly number[]> = { 2: [0.5, 1, 2], 5: [1, 2.5, 5], 10: [2, 5, 10], 25: [5, 10, 25] };
const DIRECTIONS = ["nord", "nord-est", "est", "sud-est", "sud", "sud-ovest", "ovest", "nord-ovest"] as const;

/** La direzione (0° = nord, in senso orario) da un punto all'altro */
export function bearingDeg(from: LatLon, to: LatLon): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const lat1 = rad(from.lat);
  const lat2 = rad(to.lat);
  const dLon = rad(to.lon - from.lon);
  const angle = Math.atan2(Math.sin(dLon) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon));
  return ((angle * 180) / Math.PI + 360) % 360;
}

/** «nord», «sud-ovest»…: per dire a VoiceOver e TalkBack dove si trova un risultato */
export function directionWord(bearing: number): string {
  return DIRECTIONS[Math.round(bearing / 45) % 8]!;
}

function ringLabel(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${String(km).replace(".", ",")} km`;
}

export interface MapItem {
  doctor: Doctor;
  distance: number;
}

/**
 * La mappa dei risultati, schematica: il punto di ricerca al centro, i cerchi delle distanze e ogni
 * risultato nella sua direzione reale, con lo stesso numero della lista. Non scarica mappe da nessun
 * servizio: niente chiavi e nessuna richiesta che riveli dove sei. Per arrivarci si usano le
 * «Indicazioni», nell'app di mappe del telefono. La distanza dal centro cresce più piano verso il
 * bordo, così i risultati vicini non si ammucchiano: per questo lo schema non è in scala.
 */
export function DoctorMap({
  origin,
  items,
  radiusKm,
  selectedId,
  onSelect,
  reduced,
}: {
  origin: Origin;
  items: readonly MapItem[];
  radiusKm: RadiusKm;
  selectedId: string | null;
  onSelect: (id: string) => void;
  reduced: boolean;
}) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const size = Math.min(width, MAX_SIZE);
  const center = size / 2;
  const outer = Math.max(0, size / 2 - PIN / 2 - 4);
  const radiusM = radiusKm * 1000;
  const toRadius = (meters: number) => outer * Math.sqrt(Math.min(1, meters / radiusM));
  const rings = RINGS[radiusKm];
  const pins = items.map((item, i) => {
    const bearing = bearingDeg(origin, item.doctor);
    const r = toRadius(item.distance);
    const angle = (bearing * Math.PI) / 180;
    return { ...item, n: i + 1, bearing, x: center + r * Math.sin(angle), y: center - r * Math.cos(angle) };
  });
  // Lo scelto sopra gli altri
  const ordered = [...pins].sort((a, b) => Number(a.doctor.id === selectedId) - Number(b.doctor.id === selectedId));

  return (
    <View testID="mappa-medici" style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {size > 0 && (
        <View style={{ width: size, height: size }}>
          <Svg aria-hidden width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Circle cx={center} cy={center} r={outer + PIN / 2} fill={colors.surface2} />
            <Line x1={center} y1={center - outer} x2={center} y2={center + outer} stroke={colors.line} strokeWidth={1} />
            <Line x1={center - outer} y1={center} x2={center + outer} y2={center} stroke={colors.line} strokeWidth={1} />
            {rings.map((km, i) => (
              <Circle
                key={km}
                cx={center}
                cy={center}
                r={toRadius(km * 1000)}
                fill="none"
                stroke={i === rings.length - 1 ? colors.primary : colors.line}
                strokeOpacity={i === rings.length - 1 ? 0.5 : 1}
                strokeWidth={i === rings.length - 1 ? 2 : 1.5}
                strokeDasharray={i === rings.length - 1 ? undefined : "4 5"}
              />
            ))}
            {origin.kind === "gps" && (
              <>
                <Circle cx={center} cy={center} r={16} fill={colors.primary} fillOpacity={0.18} />
                <Circle cx={center} cy={center} r={8} fill={colors.primary} stroke={colors.surface} strokeWidth={3} />
              </>
            )}
          </Svg>

          {/* Etichette: il nord e le distanze dei cerchi */}
          <Txt aria-hidden variant="small" bold tone="primary" style={[styles.north, { left: center - 8, top: 0 }]}>
            N
          </Txt>
          {rings.map((km) => (
            <Txt key={km} aria-hidden variant="small" tone="inkMuted" style={[styles.ringLabel, { left: center + 6, top: center - toRadius(km * 1000) + 1 }]}>
              {ringLabel(km)}
            </Txt>
          ))}
          {origin.kind === "luogo" ? (
            <View aria-hidden style={[styles.place, { left: center - 14, top: center - 26 }]}>
              <MapPin color={colors.primary} fill={colors.primarySoft} size={28} />
            </View>
          ) : (
            <Txt aria-hidden variant="small" bold tone="primary" style={[styles.me, { left: center - 20, top: center + 16 }]}>
              Tu
            </Txt>
          )}

          {ordered.map((p) => (
            <Pin
              key={p.doctor.id}
              n={p.n}
              x={p.x}
              y={p.y}
              label={`${p.n}. ${p.doctor.name}, ${formatDistance(p.distance)} a ${directionWord(p.bearing)}`}
              selected={p.doctor.id === selectedId}
              onPress={() => onSelect(p.doctor.id)}
              reduced={reduced}
            />
          ))}
        </View>
      )}
      <Txt variant="small" tone="inkMuted" style={styles.legend}>
        Schema delle distanze in linea d&apos;aria, non in scala: i cerchi indicano {rings.map(ringLabel).join(", ")}. I numeri sono gli stessi della lista.
      </Txt>
    </View>
  );
}

function Pin({ n, x, y, label, selected, onPress, reduced }: { n: number; x: number; y: number; label: string; selected: boolean; onPress: () => void; reduced: boolean }) {
  const { colors } = useTheme();
  const grow = useSharedValue(selected ? 1.18 : 1);
  useEffect(() => {
    const target = selected ? 1.18 : 1;
    grow.value = reduced ? target : withSpring(target, { stiffness: 320, damping: 18 });
  }, [selected, reduced, grow]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: grow.value }] }));
  return (
    <Animated.View
      entering={reduced ? undefined : ZoomIn.delay(Math.min(n, 12) * 40).springify()}
      layout={reduced ? undefined : LinearTransition.duration(300)}
      style={[styles.pinSlot, { left: x - PIN / 2, top: y - PIN / 2, zIndex: selected ? 2 : 1 }]}
    >
      <Pressable role="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} hitSlop={4}>
        <Animated.View
          style={[styles.pin, { backgroundColor: selected ? colors.accent : colors.primary, borderColor: colors.surface, shadowColor: colors.ink }, style]}
        >
          <Txt variant="small" bold style={[styles.pinText, { color: selected ? colors.onAccent : colors.onPrimary }]}>
            {n}
          </Txt>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 8 },
  north: { position: "absolute", width: 16, textAlign: "center" },
  ringLabel: { position: "absolute" },
  place: { position: "absolute" },
  me: { position: "absolute", width: 40, textAlign: "center" },
  pinSlot: { position: "absolute", width: PIN, height: PIN },
  pin: {
    width: PIN,
    height: PIN,
    borderRadius: PIN / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pinText: { fontVariant: ["tabular-nums"] },
  legend: { textAlign: "center" },
});
