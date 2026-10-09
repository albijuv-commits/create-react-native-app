import { FlatList, StyleSheet, View } from "react-native";
import { CONDITIONS } from "@data/conditions";
import { SCENE_STEPS } from "@/lib/slides/catalog";
import { SlideSvg } from "~/components/slide/slide-svg";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";

/**
 * Pagina di servizio per revisori e sviluppatori, come /vetrino nella web app: tutte le scene,
 * passo per passo, ferme. Non ha link nell'app: si apre con orienta://vetrino.
 */
export default function VetrinoScreen() {
  const { colors } = useTheme();
  return (
    <FlatList
      data={CONDITIONS}
      keyExtractor={(c) => c.id}
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.page}
      initialNumToRender={2}
      renderItem={({ item }) => (
        <View style={styles.condition} nativeID={item.id}>
          <Txt variant="heading" header>
            {item.name}{" "}
            <Txt variant="small" tone="inkMuted">
              · {item.animation.scene}
            </Txt>
          </Txt>
          <View style={styles.grid}>
            {Array.from({ length: SCENE_STEPS }, (_, step) => (
              <View key={step} style={styles.cell}>
                <SlideSvg spec={item.animation} step={step} playing={false} reduced still />
                <Txt variant="small" tone="inkMuted">
                  <Txt variant="small" bold tone="accent">
                    {step + 1}.
                  </Txt>{" "}
                  {item.animation.captions[step]}
                </Txt>
              </View>
            ))}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 32, maxWidth: 672, width: "100%", alignSelf: "center" },
  condition: { gap: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  cell: { width: "47%", flexGrow: 1, gap: 4 },
});
