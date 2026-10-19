import { AlertTriangle, Atom } from "lucide-react-native";
import type { Ref } from "react";
import { StyleSheet, View, type Text } from "react-native";
import { formulaWithSubscripts, INGREDIENTS_CHECKED_ON, type IngredientInfo } from "@/lib/medicines/ingredients";
import { formatItalianDay } from "@/lib/medicines/text";
import { Bullets } from "~/components/ui/layout";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";
import { ExternalButton } from "./notices";

const grams = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 });

/**
 * La scheda del principio attivo, come nella web app: cos'è dal punto di vista chimico, come
 * agisce, gli effetti indesiderati più frequenti secondo l'RCP, le fonti. Informazione generale,
 * non un consiglio.
 */
export function IngredientSection({ info, headingRef }: { info: IngredientInfo; headingRef?: Ref<Text> }) {
  const { colors } = useTheme();
  const box = [styles.box, { backgroundColor: colors.surface, borderColor: colors.line }];
  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <Atom color={colors.primary} size={24} />
        <Txt ref={headingRef} variant="heading" header style={styles.flex}>
          Il principio attivo: {info.name.toLowerCase()}
        </Txt>
      </View>

      <View style={box}>
        <Txt bold header>
          Che cos&apos;è
        </Txt>
        <Txt>{info.chemistry}</Txt>
        <View style={styles.molecules}>
          {info.molecules.map((mol) => (
            <View
              key={mol.pubchemCid}
              accessible
              accessibilityLabel={`${info.molecules.length > 1 ? `${mol.name}: ` : ""}formula ${mol.formula.split("").join(" ")}, ${grams.format(mol.molarMass)} grammi per mole`}
              style={[styles.molecule, { backgroundColor: colors.surface2 }]}
            >
              {info.molecules.length > 1 && (
                <Txt variant="small" bold>
                  {mol.name}
                </Txt>
              )}
              <Txt variant="small">
                <Txt variant="small" bold style={styles.tabular}>
                  {formulaWithSubscripts(mol.formula)}
                </Txt>
                <Txt variant="small" tone="inkMuted">
                  {` · ${grams.format(mol.molarMass)} g/mol`}
                </Txt>
              </Txt>
            </View>
          ))}
        </View>
      </View>

      <View style={box}>
        <Txt bold header>
          Come agisce e quali effetti ha
        </Txt>
        <Txt>{info.action}</Txt>
      </View>

      <View style={box}>
        <Txt bold header>
          Effetti indesiderati
        </Txt>
        <Bullets items={info.sideEffects} />
        <Txt variant="small" tone="inkMuted">
          Comune: fino a 1 persona su 10. Non comune: fino a 1 su 100. Raro: fino a 1 su 1.000. L&apos;elenco completo è nel foglietto illustrativo.
        </Txt>
      </View>

      {info.caution && (
        <View style={[styles.caution, { backgroundColor: colors.amberSoft }]}>
          <AlertTriangle color={colors.amber} size={20} style={styles.icon} />
          <Txt bold style={styles.flex}>
            {info.caution}
          </Txt>
        </View>
      )}

      <View style={styles.sources}>
        <Txt variant="small" tone="inkMuted">
          Riassunto dal Riassunto delle Caratteristiche del Prodotto (RCP) ufficiale e da PubChem, verificati il {formatItalianDay(INGREDIENTS_CHECKED_ON)}. Sono
          informazioni generali sul principio attivo: non sostituiscono il foglietto illustrativo né il parere del medico o del farmacista.
        </Txt>
        <View style={styles.links}>
          {info.sources.map((s) => (
            <ExternalButton key={s.url} label={s.label} url={s.url} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  box: { gap: 10, borderWidth: 1, borderRadius: 24, padding: 20 },
  molecules: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  molecule: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  tabular: { fontVariant: ["tabular-nums"] },
  caution: { flexDirection: "row", gap: 12, borderRadius: 24, padding: 16 },
  icon: { marginTop: 3 },
  sources: { gap: 4 },
  links: { flexDirection: "row", flexWrap: "wrap", columnGap: 16 },
});
