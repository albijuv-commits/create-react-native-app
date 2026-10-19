import { G, Text as SvgText } from "react-native-svg";
import { FONTS } from "~/theme/type";

/**
 * Testo dentro il vetrino (classi slide-label e slide-halo della web app): Atkinson Hyperlegible e,
 * se serve, un alone bianco sotto le lettere per leggerle sopra qualsiasi tessuto.
 */
export function SvgLabel({
  x,
  y,
  size,
  bold = false,
  fill,
  anchor = "start",
  halo = false,
  opacity,
  children,
}: {
  x: number;
  y: number;
  size: number;
  bold?: boolean;
  fill: string;
  anchor?: "start" | "middle" | "end";
  halo?: boolean;
  opacity?: number;
  children: string;
}) {
  const font = { fontFamily: bold ? FONTS.bold : FONTS.regular, fontSize: size, textAnchor: anchor } as const;
  return (
    <G opacity={opacity}>
      {halo && (
        <SvgText x={x} y={y} {...font} fill="#ffffff" stroke="#ffffff" strokeWidth={2.4} strokeLinejoin="round">
          {children}
        </SvgText>
      )}
      <SvgText x={x} y={y} {...font} fill={fill}>
        {children}
      </SvgText>
    </G>
  );
}
