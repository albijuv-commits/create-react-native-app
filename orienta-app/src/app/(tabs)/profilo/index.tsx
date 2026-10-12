import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { BookOpen, ChevronRight, ShieldCheck, Stethoscope, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import profilo from "@/assets/illustrations/sezione-profilo.webp";
import privacy from "@/assets/illustrations/stato-privacy.webp";
import type { Prefs } from "@/lib/prefs/prefs";
import { DefaultCity } from "~/components/profile/default-city";
import { EraseData } from "~/components/profile/erase-data";
import { HistoryList } from "~/components/profile/history-list";
import { Bullets, Card, PageHeader, Screen, Section } from "~/components/ui/layout";
import { Segmented } from "~/components/ui/segmented";
import { Txt } from "~/components/ui/text";
import { apiBaseUrl } from "~/lib/api";
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

const INFO: readonly { href: Href; title: string; text: string; Icon: LucideIcon }[] = [
  { href: "/profilo/privacy", title: "Informativa privacy", text: "Quali dati usa Orienta, dove vanno e come eliminarli.", Icon: ShieldCheck },
  { href: "/profilo/avvertenze", title: "Avvertenze mediche", text: "Cosa può fare Orienta e cosa no.", Icon: Stethoscope },
  { href: "/profilo/fonti", title: "Fonti", text: "Da dove vengono schede, dati sui farmaci e numeri utili.", Icon: BookOpen },
];

/** Il Profilo, come nella web app: preferenze, storico, i tuoi dati e le pagine informative. Nessun account */
export default function ProfiloScreen() {
  const { prefs, updatePrefs, colors } = useTheme();
  const canSearchPlaces = apiBaseUrl() !== null;
  return (
    <Screen>
      <PageHeader title="Profilo" lead="Nessun account: le tue preferenze e il tuo storico restano su questo telefono." illustration={profilo} />

      <Card>
        <Txt variant="heading" header>
          Preferenze
        </Txt>
        <Segmented label="Tema" options={THEMES} value={prefs.theme} onChange={(theme) => updatePrefs({ theme })} />
        <Segmented label="Dimensione del testo" options={SIZES} value={prefs.textSize} onChange={(textSize) => updatePrefs({ textSize })} />
        <Txt variant="small" tone="inkMuted">
          La dimensione scelta si aggiunge a quella delle impostazioni del telefono.
        </Txt>
        {canSearchPlaces ? (
          <DefaultCity />
        ) : (
          <Txt variant="small" tone="inkMuted">
            Per cercare i medici per città, e salvarne una come predefinita, serve il servizio di Orienta: questa app non è collegata.
          </Txt>
        )}
      </Card>

      <Section title="Storico delle sessioni">
        <HistoryList />
      </Section>

      <View style={[styles.data, { borderColor: colors.line }]}>
        <View style={styles.dataHead}>
          <View style={styles.flexGap}>
            <Txt variant="heading" header>
              I tuoi dati
            </Txt>
            <Txt variant="small">
              Orienta non ha account e non conserva i tuoi dati sui suoi server. Tutto ciò che salvi resta qui: puoi eliminarlo in un solo passaggio.
            </Txt>
          </View>
          <Image source={privacy} style={styles.art} contentFit="contain" accessible={false} />
        </View>
        <Bullets
          items={[
            "I sintomi partono dal telefono solo se scegli l'intervista con l'AI, dopo il tuo consenso esplicito.",
            "La posizione serve solo per cercare i medici vicini, e solo se la condividi.",
            "Niente pubblicità, nessuno strumento di analisi o di tracciamento.",
          ]}
        />
        <EraseData />
      </View>

      <Section title="Informazioni">
        <View role="list" style={[styles.links, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          {INFO.map(({ href, title, text, Icon }, i) => (
            <Pressable
              key={title}
              role="link"
              accessibilityLabel={`${title}. ${text}`}
              onPress={() => router.push(href)}
              style={({ pressed }) => [
                styles.link,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
                pressed && { backgroundColor: colors.surface2 },
              ]}
            >
              <Icon color={colors.primary} size={24} />
              <View style={styles.flexGap}>
                <Txt bold tone="primary">
                  {title}
                </Txt>
                <Txt variant="small" tone="inkMuted">
                  {text}
                </Txt>
              </View>
              <ChevronRight color={colors.inkMuted} size={20} />
            </Pressable>
          ))}
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  data: { gap: 16, borderWidth: 2, borderRadius: 24, padding: 20 },
  dataHead: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  flexGap: { flex: 1, gap: 4 },
  art: { width: 80, height: 80 },
  links: { borderWidth: 1, borderRadius: 24, overflow: "hidden" },
  link: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingHorizontal: 16, paddingVertical: 12 },
});
