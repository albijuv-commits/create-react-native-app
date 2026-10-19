import { ExternalLink, Store } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { formatItalianDay } from "@/lib/medicines/text";
import type { CatalogInfo } from "@/lib/medicines/types";
import { ExampleTag } from "~/components/doctors/doctor-card";
import { Txt } from "~/components/ui/text";
import { apiBaseUrl } from "~/lib/api";
import { openSource } from "~/lib/links";
import { useTheme } from "~/theme/theme";

export const ONLINE_CHECK = "https://www.salute.gov.it/LogoCommercioElettronico/CercaSitoEComm";
const AIFA_LISTS = "https://www.aifa.gov.it/liste-dei-farmaci";

/** Un link esterno con l'icona, abbastanza alto da toccare */
export function ExternalButton({ label, url, hint = "Si apre nel browser" }: { label: string; url: string; hint?: string }) {
  const { colors } = useTheme();
  return (
    <Pressable role="link" accessibilityHint={hint} onPress={() => openSource(url)} style={styles.external}>
      <Txt variant="small" bold tone="primary" style={styles.underline}>
        {label}
      </Txt>
      <ExternalLink color={colors.primary} size={16} />
    </Pressable>
  );
}

/** Il campione: dati AIFA veri ma pochi e fermi a una data */
export function ExampleDataNotice({ count }: { count: number }) {
  const { colors } = useTheme();
  return (
    <View accessible role="note" style={[styles.example, { backgroundColor: colors.amberSoft, borderColor: colors.amber }]}>
      <ExampleTag />
      <Txt variant="small">
        {count} confezioni prese dalle liste dell&apos;AIFA per provare il Mercato: non è il catalogo completo e i prezzi non si aggiornano.
        {apiBaseUrl() ? "" : " Questa app non è collegata al servizio di Orienta, dove sta il catalogo completo."}
      </Txt>
    </View>
  );
}

/** Catalogo informativo, non un negozio */
export function CatalogNotice() {
  const { colors } = useTheme();
  return (
    <View style={[styles.notice, { backgroundColor: colors.surface2 }]}>
      <Store color={colors.primary} size={24} style={styles.icon} />
      <View style={styles.flex}>
        <Txt bold>Qui non si compra: è un catalogo informativo.</Txt>
        <Txt variant="small">
          I farmaci con ricetta non si possono vendere online; quelli senza ricetta solo da farmacie e parafarmacie autorizzate. Orienta non suggerisce farmaci per
          i tuoi sintomi: per scegliere, chiedi al medico o al farmacista.
        </Txt>
        <ExternalButton label="Verifica un sito di vendita online" url={ONLINE_CHECK} hint="Ministero della Salute, si apre nel browser" />
      </View>
    </View>
  );
}

/** Fonte e date dei dati, sempre visibili */
export function CatalogSource({ info }: { info: CatalogInfo }) {
  const dates = [
    info.registryDate && ` Anagrafica dei farmaci al ${formatItalianDay(info.registryDate)}.`,
    info.transparencyDate && ` Prezzi della lista di trasparenza al ${formatItalianDay(info.transparencyDate)}`,
    info.classADate && `${info.transparencyDate ? ", " : " Prezzi "}delle liste di Classe A e H al ${formatItalianDay(info.classADate)}`,
    (info.transparencyDate || info.classADate) && ".",
  ]
    .filter(Boolean)
    .join("");
  return (
    <Txt variant="small" tone="inkMuted">
      Fonte:{" "}
      <Txt variant="small" bold tone="primary" role="link" onPress={() => openSource(AIFA_LISTS)} style={styles.underline}>
        AIFA, Open Data
      </Txt>{" "}
      (licenza CC BY 4.0).{dates}
    </Txt>
  );
}

const styles = StyleSheet.create({
  external: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, alignSelf: "flex-start" },
  underline: { textDecorationLine: "underline" },
  example: { gap: 6, borderWidth: 2, borderStyle: "dashed", borderRadius: 16, padding: 16 },
  notice: { flexDirection: "row", gap: 12, borderRadius: 24, padding: 16 },
  icon: { marginTop: 2 },
  flex: { flex: 1, gap: 6 },
});
