import { StyleSheet, View } from "react-native";
import { formatEuro, formatItalianDay } from "@/lib/medicines/text";
import { isIndicativePrice, type MedicineSummary } from "@/lib/medicines/types";
import { Txt } from "~/components/ui/text";

/**
 * Il prezzo con la sua data, sempre. Per i farmaci senza ricetta è «indicativo»: può cambiare da
 * farmacia a farmacia. Se le liste AIFA non lo riportano, lo si dice invece di inventarlo.
 */
export function Price({ medicine: m, size = "md" }: { medicine: Pick<MedicineSummary, "price" | "priceDate" | "supplyCode" | "units">; size?: "md" | "lg" }) {
  if (m.price === null) {
    return (
      <Txt variant="small" tone="inkMuted">
        Prezzo non presente nelle liste AIFA
      </Txt>
    );
  }
  const indicative = isIndicativePrice(m);
  return (
    <View style={styles.wrap}>
      <View style={styles.line}>
        <Txt variant={size === "lg" ? "title" : "heading"} style={styles.tabular}>
          {formatEuro(m.price)}
        </Txt>
        {indicative && (
          <Txt variant="small" bold tone="amber">
            prezzo indicativo
          </Txt>
        )}
      </View>
      <Txt variant="small" tone="inkMuted">
        {indicative ? "Può cambiare da farmacia a farmacia. " : "Prezzo al pubblico. "}
        {m.priceDate ? `Dati AIFA al ${formatItalianDay(m.priceDate)}.` : ""}
        {m.units && m.units > 1 ? ` Circa ${formatEuro(m.price / m.units)} a unità.` : ""}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 2, flexShrink: 1 },
  line: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: 8 },
  tabular: { fontVariant: ["tabular-nums"] },
});
