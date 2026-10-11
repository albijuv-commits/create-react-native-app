import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { displayCompany } from "@/lib/medicines/text";
import type { MedicineSummary } from "@/lib/medicines/types";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";
import { ReimbursableBadge, SupplyBadge } from "./badges";
import { BrandsDisclosure, openMedicine } from "./brands-disclosure";
import { CompareButton, FavoriteButton } from "./list-buttons";
import { MedicineImage, PhotoCredit } from "./medicine-image";
import { Price } from "./price";

/**
 * Una confezione nel catalogo: immagine, nome commerciale, principio attivo, dosaggio e confezione,
 * forma, titolare, prezzo con la sua data e badge. Linguaggio neutro: niente offerte né classifiche.
 */
export function MedicineCard({ medicine: m, note }: { medicine: MedicineSummary; note?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
      <Pressable role="link" accessibilityLabel={`${m.name}, ${m.description}`} accessibilityHint="Apre la scheda" onPress={() => openMedicine(m.aic)} style={styles.top}>
        {({ pressed }) => (
          <>
            <View style={[styles.art, { backgroundColor: colors.surface2, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
              <MedicineImage medicine={m} size={72} />
            </View>
            <View style={styles.text}>
              {note}
              <Txt bold tone="primary" style={styles.name}>
                {m.name}
              </Txt>
              <Txt variant="small" bold tone="accent">
                {m.activeIngredient}
              </Txt>
              <Txt variant="small">{m.description}</Txt>
              <Txt variant="small" tone="inkMuted">
                {m.form} · {displayCompany(m.company)}
              </Txt>
            </View>
          </>
        )}
      </Pressable>
      <View style={styles.badges}>
        <SupplyBadge code={m.supplyCode} />
        {m.reimbursementClass === "A" && <ReimbursableBadge />}
      </View>
      <View style={styles.bottom}>
        <View style={styles.flex}>
          <Price medicine={m} />
        </View>
        <View style={styles.buttons}>
          <FavoriteButton aic={m.aic} name={m.name} compact />
          <CompareButton aic={m.aic} name={m.name} compact />
        </View>
      </View>
      <PhotoCredit medicine={m} />
      <BrandsDisclosure medicine={m} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, borderWidth: 1, borderRadius: 24, padding: 16 },
  top: { flexDirection: "row", gap: 12 },
  art: { borderRadius: 16, padding: 4, alignSelf: "flex-start" },
  text: { flex: 1, gap: 2 },
  name: { textDecorationLine: "underline" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  bottom: { flexDirection: "row", alignItems: "flex-end", gap: 12 },
  flex: { flex: 1 },
  buttons: { flexDirection: "row", gap: 8 },
});
