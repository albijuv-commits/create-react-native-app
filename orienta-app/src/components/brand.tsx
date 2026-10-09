import { StyleSheet, View } from "react-native";
import Svg, { Circle, Ellipse } from "react-native-svg";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";

/** Il marchio: l'oculare del microscopio con una cellula colorata come in istologia */
export function BrandMark({ size = 28 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" accessible={false}>
      <Circle cx={16} cy={16} r={15} fill={colors.primary} />
      <Circle cx={16} cy={16} r={11} fill={colors.surface} />
      <Ellipse cx={17} cy={15} rx={7} ry={6} fill={colors.accentSoft} stroke={colors.accent} strokeWidth={1.5} />
      <Circle cx={15.5} cy={15.5} r={2.6} fill={colors.primary} />
    </Svg>
  );
}

/** Marchio e nome nell'intestazione */
export function Brand() {
  return (
    <View style={styles.brand} accessible accessibilityLabel="Orienta">
      <BrandMark />
      <Txt variant="heading" tone="primary" bold>
        Orienta
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
});
