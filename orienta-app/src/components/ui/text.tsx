import { Text, type TextProps } from "react-native";
import type { Palette } from "~/theme/colors";
import { useTheme } from "~/theme/theme";
import { textStyle, type TextVariant } from "~/theme/type";

export type TextTone = keyof Palette;

/** Testo con la scala tipografica dell'app; display, titolo e sezione sono intestazioni per gli screen reader */
export function Txt({
  variant = "body",
  bold,
  tone = "ink",
  header,
  style,
  ...rest
}: TextProps & { variant?: TextVariant; bold?: boolean; tone?: TextTone; header?: boolean }) {
  const { colors, scale } = useTheme();
  const strong = bold ?? (variant === "display" || variant === "title" || variant === "heading");
  return <Text role={header ? "heading" : rest.role} style={[textStyle(variant, scale, strong), { color: colors[tone] }, style]} {...rest} />;
}
