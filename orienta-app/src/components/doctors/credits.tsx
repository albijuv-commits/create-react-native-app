import { Roboto_400Regular } from "@expo-google-fonts/roboto/400Regular";
import { useFonts } from "expo-font";
import { StyleSheet, Text } from "react-native";
import { Txt } from "~/components/ui/text";
import { openSource } from "~/lib/links";
import { useTheme } from "~/theme/theme";

const OSM_COPYRIGHT = "https://www.openstreetmap.org/copyright";

/** «OpenStreetMap contributors» con il link alla pagina dei diritti, come chiede la licenza ODbL */
export function OsmCredit({ before, after }: { before: string; after?: string }) {
  return (
    <Txt variant="small" tone="inkMuted">
      {before}
      <Txt variant="small" bold tone="primary" role="link" accessibilityHint="Si apre nel browser" onPress={() => openSource(OSM_COPYRIGHT)} style={styles.link}>
        OpenStreetMap contributors
      </Txt>
      {after}
    </Txt>
  );
}

/**
 * Le regole di attribuzione di Google chiedono «Google Maps» in Roboto 400, mai tradotto né a capo,
 * grigio #5E5E5E sul chiaro e bianco sullo scuro. Il carattere si carica solo quando serve.
 */
export function GoogleMapsAttribution() {
  const { scheme } = useTheme();
  const [loaded] = useFonts({ Roboto_400Regular });
  return (
    <Text numberOfLines={1} style={[styles.google, { color: scheme === "dark" ? "#FFFFFF" : "#5E5E5E" }, loaded && styles.roboto]}>
      Google Maps
    </Text>
  );
}

const styles = StyleSheet.create({
  link: { textDecorationLine: "underline" },
  google: { fontSize: 14, lineHeight: 18 },
  roboto: { fontFamily: "Roboto_400Regular" },
});
