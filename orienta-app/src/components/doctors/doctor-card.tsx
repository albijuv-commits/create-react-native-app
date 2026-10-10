import { Accessibility, ChevronDown, Clock, Globe, Mail, Navigation, Phone, Star, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import { directionsUrl } from "@/lib/doctors/contact";
import { formatDistance } from "@/lib/doctors/geo";
import type { Doctor, DoctorSource } from "@/lib/doctors/schema";
import { Button } from "~/components/ui/button";
import { Txt } from "~/components/ui/text";
import { openSource } from "~/lib/links";
import { useTheme } from "~/theme/theme";

const RATING = new Intl.NumberFormat("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Le indicazioni stradali si aprono nell'app di mappe del telefono (per Google, con il link di Google) */
export function openDirections(doctor: Doctor) {
  void Linking.openURL(directionsUrl(doctor, Platform.OS === "ios" ? "ios" : "altro")).catch(() => {});
}

/** L'etichetta DATI DI ESEMPIO, sempre visibile sui dati inventati */
export function ExampleTag() {
  const { colors } = useTheme();
  return (
    <View style={[styles.example, { borderColor: colors.amber }]}>
      <Txt variant="small" bold tone="amber">
        DATI DI ESEMPIO
      </Txt>
    </View>
  );
}

/**
 * Un professionista con i contatti a portata di pollice. Ogni pulsante compare solo se il dato
 * esiste davvero: niente email inventate, niente numeri di riempimento.
 */
export function DoctorCard({
  doctor: d,
  index,
  distance,
  source,
  onEmail,
  highlighted = false,
}: {
  doctor: Doctor;
  index: number;
  distance: number;
  source: DoctorSource;
  onEmail: (doctor: Doctor) => void;
  highlighted?: boolean;
}) {
  const { colors } = useTheme();
  const [hoursOpen, setHoursOpen] = useState(false);
  const { phone, email, website } = d;
  const actions: { key: string; label: string; icon: LucideIcon; primary?: boolean; hint?: string; onPress: () => void }[] = [];
  if (phone) actions.push({ key: "chiama", label: "Chiama", icon: Phone, primary: true, hint: `Apre il telefono con ${phone.display}`, onPress: () => void Linking.openURL(phone.href).catch(() => {}) });
  if (email) actions.push({ key: "email", label: "Email", icon: Mail, onPress: () => onEmail(d) });
  if (website) actions.push({ key: "sito", label: "Sito", icon: Globe, hint: "Si apre nel browser", onPress: () => openSource(website) });
  actions.push({ key: "indicazioni", label: "Indicazioni", icon: Navigation, hint: "Si apre nell'app delle mappe", onPress: () => openDirections(d) });
  // Due pulsanti per riga; l'ultimo, se resta da solo, occupa tutta la riga
  const rows: (typeof actions)[] = [];
  for (let i = 0; i < actions.length; i += 2) rows.push(actions.slice(i, i + 2));

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: highlighted ? colors.primary : colors.line, borderWidth: highlighted ? 2 : 1 }]}>
      <View style={styles.top}>
        <View aria-hidden style={[styles.number, { backgroundColor: colors.primary }]}>
          <Txt bold style={[styles.numberText, { color: colors.onPrimary }]}>
            {index}
          </Txt>
        </View>
        <View style={styles.info}>
          <Txt bold header accessibilityLabel={`${index}. ${d.name}${d.unnamed ? " (nome non indicato)" : ""}`}>
            {d.name}
            {d.unnamed && <Txt tone="inkMuted"> (nome non indicato)</Txt>}
          </Txt>
          <Txt variant="small" tone="inkMuted">
            {d.category} · a {formatDistance(distance)}
          </Txt>
          {d.specialties.length > 0 && (
            <View role="list" accessibilityLabel="Specialità" style={styles.chips}>
              {d.specialties.map((s) => (
                <View key={s} role="listitem" style={[styles.chip, { backgroundColor: colors.primarySoft }]}>
                  <Txt variant="small" bold tone="primary">
                    {s}
                  </Txt>
                </View>
              ))}
            </View>
          )}
          {d.address && <Txt variant="small">{d.address}</Txt>}
          {d.phone && (
            <Txt variant="small" style={styles.tabular}>
              Tel. {d.phone.display}
            </Txt>
          )}
          {d.rating && (
            <View style={styles.line}>
              <Star color={colors.amber} fill={colors.amber} size={16} />
              <Txt variant="small" style={styles.flex}>
                {RATING.format(d.rating.value)} su 5 · {d.rating.count === 1 ? "1 recensione" : `${d.rating.count} recensioni`} su Google
              </Txt>
            </View>
          )}
          {d.openNow !== null && (
            <View style={styles.line}>
              <Clock color={d.openNow ? colors.calm : colors.inkMuted} size={16} />
              <Txt variant="small" bold tone={d.openNow ? "calm" : "inkMuted"}>
                {d.openNow ? "Aperto adesso" : "Chiuso adesso"}
              </Txt>
            </View>
          )}
          {d.hours && (
            <View>
              <Pressable role="button" accessibilityState={{ expanded: hoursOpen }} onPress={() => setHoursOpen((o) => !o)} style={styles.hoursToggle}>
                <Txt variant="small" bold tone="primary">
                  Orari
                </Txt>
                <ChevronDown color={colors.primary} size={18} style={{ transform: [{ rotate: hoursOpen ? "180deg" : "0deg" }] }} />
              </Pressable>
              {hoursOpen &&
                d.hours.map((line) => (
                  <Txt key={line} variant="small">
                    {line}
                  </Txt>
                ))}
            </View>
          )}
          {d.wheelchair && (
            <View style={styles.line}>
              <Accessibility color={colors.primary} size={16} />
              <Txt variant="small" style={styles.flex}>
                Ingresso accessibile in sedia a rotelle
              </Txt>
            </View>
          )}
          {source === "esempio" && <ExampleTag />}
        </View>
      </View>

      <View style={styles.actions}>
        {rows.map((row) => (
          <View key={row.map((a) => a.key).join("-")} style={styles.actionRow}>
            {row.map((a) => (
              <Button key={a.key} label={a.label} icon={a.icon} variant={a.primary ? "primary" : "secondary"} hint={a.hint} onPress={a.onPress} style={styles.flex} />
            ))}
          </View>
        ))}
      </View>

      {d.attributions.length > 0 && (
        <Txt variant="small" tone="inkMuted">
          Dati:{" "}
          {d.attributions.map((a, i) => (
            <Txt key={a.provider} variant="small" tone="inkMuted">
              {i > 0 && ", "}
              {a.uri ? (
                <Txt variant="small" tone="primary" role="link" onPress={() => openSource(a.uri!)} style={styles.underline}>
                  {a.provider}
                </Txt>
              ) : (
                a.provider
              )}
            </Txt>
          ))}
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, borderRadius: 24, padding: 16 },
  top: { flexDirection: "row", gap: 12 },
  number: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  numberText: { fontVariant: ["tabular-nums"] },
  info: { flex: 1, gap: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
  tabular: { fontVariant: ["tabular-nums"] },
  line: { flexDirection: "row", alignItems: "center", gap: 6 },
  flex: { flex: 1 },
  hoursToggle: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: 44, alignSelf: "flex-start" },
  example: { alignSelf: "flex-start", borderWidth: 2, borderStyle: "dashed", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 1 },
  actions: { gap: 8 },
  actionRow: { flexDirection: "row", gap: 8 },
  underline: { textDecorationLine: "underline" },
});
