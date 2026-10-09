import { Hourglass } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Bullets, Card } from "~/components/ui/layout";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";

/** Cosa arriva in questa sezione nelle prossime fasi dell'app nativa */
export function ComingSoon({ phase, items }: { phase: number; items: readonly string[] }) {
  const { colors } = useTheme();
  return (
    <Card tone="primarySoft">
      <View style={styles.head}>
        <Hourglass color={colors.primary} size={22} />
        <Txt variant="heading" tone="primary" header>
          In arrivo nella fase {phase}
        </Txt>
      </View>
      <Bullets items={items} />
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
});
