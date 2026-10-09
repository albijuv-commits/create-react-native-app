import { Image } from "expo-image";
import { useRouter, type Href } from "expo-router";
import { ArrowRight, Info, MessageCircleHeart } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import consenso from "@/assets/illustrations/passo-consenso.webp";
import descrivi from "@/assets/illustrations/passo-descrivi.webp";
import domande from "@/assets/illustrations/passo-domande.webp";
import risultati from "@/assets/illustrations/passo-risultati.webp";
import condizioni from "@/assets/illustrations/sezione-condizioni.webp";
import medici from "@/assets/illustrations/sezione-medici.webp";
import profilo from "@/assets/illustrations/sezione-profilo.webp";
import vetrino from "@/assets/illustrations/vetrino-cellule.webp";
import { Button } from "~/components/ui/button";
import { Card, Screen, Section } from "~/components/ui/layout";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";

const STEPS = [
  { n: 1, t: "Dai il consenso", d: "Ti spieghiamo quali dati usiamo e perché.", img: consenso },
  { n: 2, t: "Descrivi cosa senti", d: "A parole o toccando le zone del corpo.", img: descrivi },
  { n: 3, t: "Rispondi alle domande", d: "Da 5 a 12, una alla volta. C'è sempre «Non so».", img: domande },
  { n: 4, t: "Scopri a chi rivolgerti", d: "Condizioni possibili, urgenza e specialista.", img: risultati },
] as const;

const TILES: readonly { href: Href; label: string; img: number }[] = [
  { href: "/medici", label: "Trova un medico", img: medici },
  { href: "/condizioni", label: "Sfoglia le condizioni", img: condizioni },
  { href: "/profilo", label: "I tuoi dati", img: profilo },
];

export default function SintomiHome() {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <Screen>
      <View style={styles.hero}>
        <View style={[styles.halo, { backgroundColor: colors.primarySoft }]} />
        <Image source={vetrino} style={styles.heroImage} contentFit="contain" accessible={false} />
      </View>
      <View style={styles.intro}>
        <Txt variant="small" bold tone="accent">
          Sintomi
        </Txt>
        <Txt variant="display" tone="primary" header>
          Cosa senti oggi?
        </Txt>
        <Txt tone="inkMuted">
          Descrivi i tuoi sintomi e rispondi a qualche domanda. Ti mostriamo quali condizioni potrebbero essere compatibili e a chi rivolgerti.
        </Txt>
      </View>
      <View style={styles.start}>
        <Button label="Inizia" icon={MessageCircleHeart} size="lg" disabled onPress={() => {}} hint="L'intervista arriva nella fase 3 dell'app" />
        <Txt variant="small" tone="inkMuted" style={styles.center}>
          L&apos;intervista arriva nella prossima versione dell&apos;app.
        </Txt>
      </View>

      <Card tone="calmSoft">
        <View style={styles.row}>
          <Info color={colors.calm} size={22} />
          <Txt bold tone="calm" style={styles.flex}>
            Orienta, non diagnostica
          </Txt>
        </View>
        <Txt>Ogni risultato è una possibilità, mai una diagnosi. Solo un medico può valutare i tuoi sintomi.</Txt>
      </Card>

      <Section title="Come funziona">
        <View style={styles.grid}>
          {STEPS.map((s) => (
            <View key={s.n} style={[styles.step, { backgroundColor: colors.surface, borderColor: colors.line }]}>
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Txt variant="small" bold style={{ color: colors.onPrimary }}>
                  {s.n}
                </Txt>
              </View>
              <Image source={s.img} style={styles.stepImage} contentFit="contain" accessible={false} />
              <Txt bold>{s.t}</Txt>
              <Txt variant="small" tone="inkMuted">
                {s.d}
              </Txt>
            </View>
          ))}
        </View>
      </Section>

      <View style={styles.tiles}>
        {TILES.map((t) => (
          <Pressable
            key={t.label}
            role="link"
            accessibilityLabel={t.label}
            onPress={() => router.navigate(t.href)}
            style={({ pressed }) => [styles.tile, { backgroundColor: colors.surface2, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
          >
            <Image source={t.img} style={styles.tileImage} contentFit="contain" accessible={false} />
            <View style={styles.tileLabel}>
              <Txt variant="small" bold tone="primary" style={styles.center}>
                {t.label}
              </Txt>
              <ArrowRight color={colors.primary} size={16} />
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", justifyContent: "center" },
  halo: { position: "absolute", width: 200, height: 200, borderRadius: 100, opacity: 0.9 },
  heroImage: { width: 240, height: 240 },
  intro: { gap: 10 },
  start: { gap: 8 },
  center: { textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  step: { width: "48%", flexGrow: 1, borderWidth: 1, borderRadius: 24, padding: 16, gap: 6 },
  badge: { position: "absolute", left: 12, top: 12, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", zIndex: 1 },
  stepImage: { width: 96, height: 96, alignSelf: "center" },
  tiles: { flexDirection: "row", gap: 12 },
  tile: { flex: 1, borderRadius: 24, padding: 12, alignItems: "center", gap: 8 },
  tileImage: { width: 72, height: 72 },
  tileLabel: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2, flexWrap: "wrap" },
});
