import { ShieldCheck } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import profilo from "@/assets/illustrations/sezione-profilo.webp";
import type { Prefs } from "@/lib/prefs/prefs";
import { ComingSoon } from "~/components/coming-soon";
import { Card, PageHeader, Screen } from "~/components/ui/layout";
import { Segmented } from "~/components/ui/segmented";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";

const THEMES: readonly { value: Prefs["theme"]; label: string }[] = [
  { value: "system", label: "Automatico" },
  { value: "light", label: "Chiaro" },
  { value: "dark", label: "Scuro" },
];

const SIZES: readonly { value: Prefs["textSize"]; label: string }[] = [
  { value: "normal", label: "Normale" },
  { value: "large", label: "Grande" },
  { value: "xlarge", label: "Molto grande" },
];

export default function ProfiloScreen() {
  const { prefs, updatePrefs, colors } = useTheme();
  return (
    <Screen>
      <PageHeader title="Profilo" lead="Nessun account: le tue preferenze restano su questo telefono." illustration={profilo} />

      <Card>
        <Txt variant="heading" header>
          Preferenze
        </Txt>
        <Segmented label="Tema" options={THEMES} value={prefs.theme} onChange={(theme) => updatePrefs({ theme })} />
        <Segmented label="Dimensione del testo" options={SIZES} value={prefs.textSize} onChange={(textSize) => updatePrefs({ textSize })} />
        <Txt variant="small" tone="inkMuted">
          La dimensione scelta si aggiunge a quella delle impostazioni del telefono.
        </Txt>
      </Card>

      <Card tone="surface2">
        <View style={styles.row}>
          <ShieldCheck color={colors.primary} size={22} />
          <Txt bold style={styles.flex}>
            I tuoi dati restano qui
          </Txt>
        </View>
        <Txt variant="small">
          Orienta non ha account e non conserva i tuoi dati sui suoi server. Niente pubblicità e nessuno strumento di analisi.
        </Txt>
      </Card>

      <ComingSoon
        phase={6}
        items={["Storico delle sessioni, salvato solo se lo scegli tu", "Città predefinita per la ricerca dei medici", "«Elimina tutti i miei dati»", "Informativa privacy, Avvertenze mediche e Fonti"]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
});
