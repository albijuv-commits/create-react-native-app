import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import prenota from "@/assets/illustrations/stato-prenota.webp";
import { BOOKING_SOURCE, BOOKING_SOURCE_TITLE } from "@/lib/doctors/booking";
import { SourceLink } from "~/components/emergency/emergency";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";

const STEPS = [
  "Serve prima la ricetta del medico di base, la cosiddetta impegnativa.",
  "Poi prenoti tramite il CUP, il Centro unico di prenotazione della tua regione: a seconda della regione allo sportello, per telefono, online o in farmacia.",
] as const;

/** Come prenotare una visita, privata o con il Servizio sanitario nazionale, con la fonte ufficiale */
export function BookingInfo() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
      <View style={styles.head}>
        <View style={styles.flex}>
          <Txt variant="heading" header>
            Come prenotare
          </Txt>
          <Txt variant="small" tone="inkMuted">
            Dipende da come vuoi fare la visita.
          </Txt>
        </View>
        <Image source={prenota} style={styles.art} contentFit="contain" accessible={false} />
      </View>
      <View style={[styles.box, { backgroundColor: colors.surface2 }]}>
        <Txt bold header>
          Visita privata
        </Txt>
        <Txt variant="small">Contatta direttamente il medico o lo studio, per telefono o per email.</Txt>
      </View>
      <View style={[styles.box, { backgroundColor: colors.surface2 }]}>
        <Txt bold header>
          Con il Servizio sanitario nazionale
        </Txt>
        <View role="list" style={styles.steps}>
          {STEPS.map((step, i) => (
            <View key={step} role="listitem" style={styles.step}>
              <View aria-hidden style={[styles.number, { backgroundColor: colors.primary }]}>
                <Txt variant="small" bold style={{ color: colors.onPrimary }}>
                  {i + 1}
                </Txt>
              </View>
              <Txt variant="small" style={styles.flex}>
                {step}
              </Txt>
            </View>
          ))}
        </View>
      </View>
      <SourceLink title={BOOKING_SOURCE_TITLE} url={BOOKING_SOURCE} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, borderWidth: 1, borderRadius: 24, padding: 20 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  art: { width: 80, height: 80 },
  box: { gap: 8, borderRadius: 16, padding: 16 },
  steps: { gap: 8 },
  step: { flexDirection: "row", gap: 8 },
  number: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
