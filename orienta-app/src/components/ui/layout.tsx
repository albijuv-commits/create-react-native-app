import { Image, type ImageSource } from "expo-image";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { Palette } from "~/theme/colors";
import { useTheme } from "~/theme/theme";
import { Txt } from "./text";

/** Una schermata che scorre, larga al massimo 640 pt anche su tablet */
export function Screen({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

/** Titolo della sezione con una frase e, se c'è, l'illustrazione (decorativa) */
export function PageHeader({ title, lead, illustration }: { title: string; lead?: string; illustration?: ImageSource | number }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Txt variant="display" tone="primary" header>
          {title}
        </Txt>
        {lead ? <Txt tone="inkMuted">{lead}</Txt> : null}
      </View>
      {illustration ? (
        <Image source={illustration} style={styles.illustration} contentFit="contain" accessible={false} importantForAccessibility="no" />
      ) : null}
    </View>
  );
}

type CardTone = "surface" | "surface2" | "primarySoft" | "accentSoft" | "redSoft" | "amberSoft" | "calmSoft" | "otcSoft";

export function Card({ tone = "surface", bordered = false, children, style }: { tone?: CardTone; bordered?: boolean; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors[tone as keyof Palette] }, bordered && { borderWidth: 1, borderColor: colors.line }, style]}>{children}</View>
  );
}

/** Un elenco puntato semplice */
export function Bullets({ items }: { items: readonly string[] }) {
  const { colors } = useTheme();
  return (
    <View style={styles.bullets}>
      {items.map((item) => (
        <View key={item} style={styles.bullet}>
          <View style={[styles.dot, { backgroundColor: colors.ink }]} />
          <Txt style={styles.bulletText}>{item}</Txt>
        </View>
      ))}
    </View>
  );
}

/** Una sezione con titolo per gli screen reader */
export function Section({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Txt variant="heading" header>
          {title}
        </Txt>
        {lead ? (
          <Txt variant="small" tone="inkMuted">
            {lead}
          </Txt>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, paddingBottom: 48, gap: 28, width: "100%", maxWidth: 640, alignSelf: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 16 },
  headerText: { flex: 1, gap: 8 },
  illustration: { width: 96, height: 96 },
  card: { borderRadius: 24, padding: 20, gap: 12 },
  section: { gap: 12 },
  sectionHead: { gap: 4 },
  bullets: { gap: 8 },
  bullet: { flexDirection: "row", gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 11 },
  bulletText: { flex: 1 },
});

