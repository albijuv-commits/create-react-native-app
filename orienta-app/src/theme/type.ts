import type { TextStyle } from "react-native";

/** I nomi con cui useFonts registra Atkinson Hyperlegible, lo stesso carattere della web app */
export const FONTS = {
  regular: "AtkinsonHyperlegible_400Regular",
  bold: "AtkinsonHyperlegible_700Bold",
} as const;

export type TextVariant = "display" | "title" | "heading" | "body" | "small";

/** Scala tipografica della web app: display 32, titolo 24, sezione 20, corpo 17, piccolo 15 */
const SCALE: Record<TextVariant, { size: number; lineHeight: number }> = {
  display: { size: 32, lineHeight: 1.15 },
  title: { size: 24, lineHeight: 1.2 },
  heading: { size: 20, lineHeight: 1.3 },
  body: { size: 17, lineHeight: 1.55 },
  small: { size: 15, lineHeight: 1.45 },
};

/** Moltiplicatore della preferenza «Dimensione del testo» (si somma a quella di sistema) */
export const TEXT_SCALE = { normal: 1, large: 1.125, xlarge: 1.25 } as const;

export function textStyle(variant: TextVariant, scale: number, bold: boolean): TextStyle {
  const { size, lineHeight } = SCALE[variant];
  const fontSize = Math.round(size * scale * 10) / 10;
  return { fontFamily: bold ? FONTS.bold : FONTS.regular, fontSize, lineHeight: Math.round(fontSize * lineHeight) };
}
