import { Image } from "expo-image";
import { router } from "expo-router";
import { ArrowRight, BookOpen, ChevronDown, ImageIcon, Info, MapPin, Microscope, Phone, RotateCcw, Sparkles, UsersRound } from "lucide-react-native";
import { useEffect, useState, type Ref } from "react";
import { Pressable, StyleSheet, View, type Text } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { CURE_NON_URGENTI } from "@data/emergency/helplines";
import { getSpecialty, type SpecialtyId } from "@data/vocab/specialties";
import { symptomLabel } from "@data/vocab/symptoms";
import bussola from "@/assets/illustrations/passo-risultati.webp";
import nessunRisultato from "@/assets/illustrations/stato-nessun-risultato.webp";
import type { InterviewCondition } from "@/lib/conditions/knowledge-base";
import { URGENCY, type UrgencyLevel } from "@/lib/design/urgency";
import type { Compatibility, ResultCondition, TriageResponse } from "@/lib/triage/schema";
import { HelplineCard } from "~/components/emergency/emergency";
import { SlidePreview } from "~/components/slide/slide-preview";
import { Button } from "~/components/ui/button";
import { Txt } from "~/components/ui/text";
import { UrgencyIndicator } from "~/components/ui/urgency-indicator";
import { saveSummaryForDoctors } from "~/lib/doctor-handoff";
import { CONDITION_ILLUSTRATIONS } from "~/lib/illustrations";
import { call } from "~/lib/links";
import { LEVEL_UI, LEVELS } from "~/lib/urgency";
import { useTheme } from "~/theme/theme";
import { DoctorSummary } from "./doctor-summary";
import { StepHeader } from "./parts";

type Results = Extract<TriageResponse, { kind: "results" }>;

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

const COMPATIBILITY: Record<Compatibility, { label: string; bars: number }> = {
  alta: { label: "Compatibilità alta", bars: 3 },
  media: { label: "Compatibilità media", bars: 2 },
  bassa: { label: "Compatibilità bassa", bars: 1 },
};

/** Sotto i 14 anni il riferimento per tutto ciò che è «medico di base» è il pediatra */
function specialistFor(id: SpecialtyId, age: number): SpecialtyId {
  return age < 14 && id === "medico-di-base" ? "pediatra" : id;
}

/** Va alla sezione Medici con lo specialista già scelto (i parametri restano nell'app) */
function findDoctors(specialista: string, condizione?: string) {
  router.navigate({ pathname: "/medici", params: condizione ? { specialista, condizione } : { specialista } });
}

export function ResultsView({
  result,
  conditions,
  age,
  summary,
  onRestart,
  reduced,
  headingRef,
}: {
  result: Results;
  conditions: readonly InterviewCondition[];
  age: number;
  summary: string;
  onRestart: () => void;
  reduced: boolean;
  headingRef: Ref<Text>;
}) {
  const { colors } = useTheme();
  const byId = new Map(conditions.map((c) => [c.id, c]));
  const items = result.conditions.flatMap((r) => {
    const c = byId.get(r.id);
    return c ? [{ result: r, condition: c }] : [];
  });
  const unidentified = result.unidentified || items.length === 0;

  return (
    <View style={styles.page}>
      <StepHeader step="Risultati" title={unidentified ? "Nessuna corrispondenza chiara" : "Cosa potrebbe essere"} image={bussola} headingRef={headingRef} />

      <View style={[styles.notice, { borderColor: colors.primary, backgroundColor: colors.primarySoft }]}>
        <Info color={colors.primary} size={24} style={styles.noticeIcon} />
        <Txt bold style={styles.flex}>
          Questa non è una diagnosi. Solo un medico può valutare i tuoi sintomi.
        </Txt>
      </View>

      {age < 18 && (
        <View style={[styles.note, { backgroundColor: colors.surface2 }]}>
          <UsersRound color={colors.primary} size={20} style={styles.noticeIcon} />
          <Txt variant="small" style={styles.flex}>
            Fai vedere questi risultati a un genitore o a un adulto di cui ti fidi.
          </Txt>
        </View>
      )}

      <View style={styles.section}>
        <Txt variant="heading" header>
          Quando farti vedere
        </Txt>
        <UrgencyMeter level={result.urgency} reduced={reduced} />
        <Image source={LEVEL_UI[result.urgency].image} style={styles.levelArt} contentFit="contain" accessible={false} />
        <UrgencyIndicator level={result.urgency} />
        <NextSteps level={result.urgency} age={age} />
        <UrgencyExplorer current={result.urgency} reduced={reduced} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Txt variant="heading" header>
            Condizioni compatibili
          </Txt>
          {!unidentified && (
            <Txt variant="small" tone="inkMuted">
              Dalla più compatibile con ciò che hai descritto. Tocca «Perché?» per vedere cosa la rende più o meno probabile.
            </Txt>
          )}
        </View>
        {unidentified ? (
          <View style={[styles.note, styles.center, { backgroundColor: colors.surface2 }]}>
            <Image source={nessunRisultato} style={styles.noneArt} contentFit="contain" accessible={false} />
            <Txt variant="small" style={styles.flex}>
              Nessuna delle condizioni nella base di conoscenza di Orienta corrisponde bene a ciò che hai descritto. Non vuol dire che non ci sia niente:
              parlane con il medico.
            </Txt>
          </View>
        ) : (
          <View role="list" style={styles.list}>
            {items.map(({ result: r, condition: c }, i) => (
              <Animated.View key={c.id} role="listitem" entering={reduced ? undefined : FadeInDown.duration(300).delay(80 * i).easing(EASE_OUT)}>
                <ConditionCard condition={c} result={r} rank={i + 1} age={age} reduced={reduced} onFindSpecialist={() => saveSummaryForDoctors(summary)} />
              </Animated.View>
            ))}
          </View>
        )}
        <Button label="Sfoglia tutte le condizioni" icon={BookOpen} variant="ghost" onPress={() => router.navigate("/condizioni")} />
      </View>

      <DoctorSummary text={summary} />

      <Txt variant="small" tone="inkMuted">
        {result.source === "ai"
          ? "Domande e confronto preparati con l'intelligenza artificiale (Claude di Anthropic), che può scegliere solo tra le schede di Orienta. L'urgenza non è mai più bassa di quella calcolata dalle regole fisse."
          : "Abbiamo confrontato i tuoi sintomi con le schede di Orienta usando regole fisse, direttamente sul tuo telefono."}
      </Txt>

      <Button label="Nuova intervista" icon={RotateCcw} variant="secondary" size="lg" onPress={onRestart} />
    </View>
  );
}

/* ------------------------------------------------------------------ Urgenza */

/** I quattro livelli in fila: le barre si riempiono fino a quello indicato */
function UrgencyMeter({ level, reduced }: { level: UrgencyLevel; reduced: boolean }) {
  const { colors } = useTheme();
  const index = LEVELS.indexOf(level);
  return (
    <View accessible accessibilityLabel={`Livello di urgenza ${index + 1} su 4: ${URGENCY[level].label}.`} style={styles.meter}>
      <View style={styles.meterRow}>
        {LEVELS.map((l, i) => (
          <MeterBar key={l} filled={i <= index} color={colors[LEVEL_UI[l].color]} delay={120 * i} reduced={reduced} />
        ))}
      </View>
      <View style={styles.meterRow}>
        {LEVELS.map((l, i) => {
          const { icon: Icon, color, short } = LEVEL_UI[l];
          const current = i === index;
          return (
            <View key={l} style={styles.meterLabel}>
              <Icon color={current ? colors[color] : colors.inkMuted} size={20} style={{ opacity: current ? 1 : 0.6 }} />
              <Txt variant="small" bold={current} tone={current ? color : "inkMuted"} style={styles.centerText}>
                {short}
              </Txt>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function MeterBar({ filled, color, delay, reduced }: { filled: boolean; color: string; delay: number; reduced: boolean }) {
  const { colors } = useTheme();
  const fill = useSharedValue(reduced && filled ? 1 : 0);
  useEffect(() => {
    const target = filled ? 1 : 0;
    fill.value = reduced ? target : withDelay(delay, withTiming(target, { duration: 250, easing: EASE_OUT }));
  }, [filled, delay, reduced, fill]);
  const style = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));
  return (
    <View style={[styles.bar, { backgroundColor: colors.surface2 }]}>
      <Animated.View style={[styles.barFill, { backgroundColor: color }, style]} />
    </View>
  );
}

/** I quattro livelli da esplorare: si tocca un livello per leggere cosa significa */
function UrgencyExplorer({ current, reduced }: { current: UrgencyLevel; reduced: boolean }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState<UrgencyLevel | null>(null);
  return (
    <View style={[styles.explorer, { backgroundColor: colors.surface2 }]}>
      <View style={styles.row}>
        <Sparkles color={colors.accent} size={16} />
        <Txt variant="small" bold style={styles.flex}>
          Cosa significano i livelli? Toccane uno.
        </Txt>
      </View>
      <View style={styles.levels}>
        {LEVELS.map((l) => {
          const ui = LEVEL_UI[l];
          const on = open === l;
          return (
            <Pressable
              key={l}
              role="button"
              accessibilityLabel={`${URGENCY[l].label}${l === current ? " (il tuo livello)" : ""}`}
              accessibilityState={{ selected: on }}
              onPress={() => setOpen((o) => (o === l ? null : l))}
              style={({ pressed }) => [
                styles.level,
                { borderColor: on ? colors[ui.color] : "transparent", backgroundColor: on ? colors.surface : "transparent", transform: [{ scale: pressed ? 0.96 : 1 }] },
              ]}
            >
              {l === current && (
                <View style={[styles.you, { backgroundColor: colors.primary }]}>
                  <Txt variant="small" bold style={[styles.youText, { color: colors.onPrimary }]}>
                    Tu
                  </Txt>
                </View>
              )}
              <Image source={ui.image} style={styles.levelImage} contentFit="contain" accessible={false} />
              <Txt variant="small" bold tone={ui.color} style={styles.centerText}>
                {ui.short}
              </Txt>
            </Pressable>
          );
        })}
      </View>
      {open && (
        <Animated.View key={open} entering={reduced ? undefined : FadeInDown.duration(180).easing(EASE_OUT)} accessibilityLiveRegion="polite" style={[styles.levelInfo, { backgroundColor: colors.surface }]}>
          <Txt bold tone={LEVEL_UI[open].color}>
            {URGENCY[open].label}
            {open === current ? <Txt bold> · il tuo livello</Txt> : null}
          </Txt>
          <Txt variant="small">{URGENCY[open].description}</Txt>
        </Animated.View>
      )}
    </View>
  );
}

/** Cosa fare adesso, livello per livello. I numeri sono quelli verificati in data/emergency. */
function NextSteps({ level, age }: { level: UrgencyLevel; age: number }) {
  const doctor = age < 14 ? "il pediatra" : "il medico di base";
  if (level === "er") {
    return (
      <View style={styles.steps}>
        <Button label="Chiama il 112" icon={Phone} variant="danger" size="lg" onPress={() => call("112")} hint="Apre il telefono con il 112 già composto" />
        <Txt variant="small">Se puoi muoverti in sicurezza, fatti accompagnare al pronto soccorso più vicino. Non guidare da solo.</Txt>
        <Button label="Trova il pronto soccorso" icon={MapPin} variant="secondary" onPress={() => findDoctors("pronto-soccorso")} />
      </View>
    );
  }
  if (level === "home") {
    return <Txt variant="small">Se compaiono segnali d&apos;allarme, come difficoltà a respirare o dolore al petto, chiama subito il 112.</Txt>;
  }
  return (
    <View style={styles.steps}>
      <Txt variant="small">
        {level === "soon"
          ? `Cerca una visita entro 24 ore: chiama ${doctor}. Di notte, nel fine settimana e nei festivi rivolgiti alla guardia medica.`
          : `Prendi appuntamento con ${doctor} nei prossimi giorni. Se non è disponibile, rivolgiti alla guardia medica.`}{" "}
        Se peggiori o compaiono segnali d&apos;allarme, chiama il 112.
      </Txt>
      <HelplineCard helpline={CURE_NON_URGENTI} tone="surface2" />
    </View>
  );
}

/* ------------------------------------------------------------------ Condizioni */

function CompatibilityBadge({ level }: { level: Compatibility }) {
  const { colors } = useTheme();
  const { label, bars } = COMPATIBILITY[level];
  return (
    <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
      <View aria-hidden style={styles.bars}>
        {[1, 2, 3].map((b) => (
          <View key={b} style={[styles.barTick, { height: 4 + b * 3, backgroundColor: colors.primary, opacity: b <= bars ? 1 : 0.25 }]} />
        ))}
      </View>
      <Txt variant="small" bold tone="primary">
        {label}
      </Txt>
    </View>
  );
}

function ConditionCard({
  condition,
  result,
  rank,
  age,
  reduced,
  onFindSpecialist,
}: {
  condition: InterviewCondition;
  result: ResultCondition;
  rank: number;
  age: number;
  reduced: boolean;
  /** Prima di andare a Medici: il riepilogo resta pronto per l'email al medico, solo in memoria */
  onFindSpecialist: () => void;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const specialist = getSpecialty(specialistFor(condition.specialistId, age));

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
      <View style={styles.cardTop}>
        <FlipMedia condition={condition} reduced={reduced} />
        <View style={styles.cardTitle}>
          <Txt variant="heading" header accessibilityLabel={`${rank}. ${condition.name}`}>
            {condition.name}
          </Txt>
          <CompatibilityBadge level={result.compatibility} />
        </View>
      </View>
      <Txt variant="small" tone="inkMuted">
        {condition.teaser}
      </Txt>

      {result.matchingSymptoms.length > 0 && (
        <View style={styles.matching}>
          <Txt variant="small" bold>
            Corrisponde a ciò che hai indicato:
          </Txt>
          <View role="list" style={styles.chips}>
            {result.matchingSymptoms.map((s) => (
              <View key={s} role="listitem" style={[styles.symptom, { backgroundColor: colors.accentSoft }]}>
                <Txt variant="small" bold tone="accent">
                  {symptomLabel(s)}
                </Txt>
              </View>
            ))}
          </View>
        </View>
      )}

      <Pressable role="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((o) => !o)} style={[styles.why, { backgroundColor: colors.surface2 }]}>
        <Txt bold tone="primary" style={styles.flex}>
          Perché?
        </Txt>
        <ChevronDown color={colors.primary} size={20} style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }} />
      </Pressable>
      {open && (
        <Animated.View entering={reduced ? undefined : FadeIn.duration(220)} style={styles.factors}>
          <FactorList title="Più probabile se" items={condition.moreLikelyIf} sign="+" />
          <FactorList title="Meno probabile se" items={condition.lessLikelyIf} sign="−" />
        </Animated.View>
      )}

      <View style={styles.actions}>
        <Button label="Scopri di più" icon={BookOpen} variant="secondary" onPress={() => router.push({ pathname: "/sintomi/condizione/[id]", params: { id: condition.id } })} />
        <Pressable
          role="button"
          accessibilityLabel={`Trova uno specialista: ${specialist.label}`}
          onPress={() => {
            onFindSpecialist();
            findDoctors(specialist.id, condition.id);
          }}
          style={({ pressed }) => [styles.find, pressed && { backgroundColor: colors.primarySoft }]}
        >
          <View style={[styles.findIcon, { backgroundColor: colors.surface2 }]}>
            <MapPin color={colors.primary} size={24} />
          </View>
          <View style={styles.flex}>
            <View style={styles.row}>
              <Txt bold tone="primary">
                Trova uno specialista
              </Txt>
              <ArrowRight color={colors.primary} size={20} />
            </View>
            <Txt variant="small" tone="inkMuted">
              {specialist.label}
            </Txt>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * L'immagine della condizione: davanti il vetrino animato, dietro l'illustrazione. Si gira
 * toccandola; con «Riduci movimento» cambia e basta.
 */
function FlipMedia({ condition, reduced }: { condition: InterviewCondition; reduced: boolean }) {
  const { colors } = useTheme();
  const [back, setBack] = useState(false);
  const turn = useSharedValue(0);
  const art = CONDITION_ILLUSTRATIONS[condition.id];

  useEffect(() => {
    const target = back ? 180 : 0;
    turn.value = reduced ? target : withSpring(target, { stiffness: 260, damping: 24 });
  }, [back, reduced, turn]);

  const front = useAnimatedStyle(() => ({ transform: [{ perspective: 700 }, { rotateY: `${turn.value}deg` }] }));
  const rear = useAnimatedStyle(() => ({ transform: [{ perspective: 700 }, { rotateY: `${turn.value + 180}deg` }] }));

  if (art === undefined) return <SlidePreview spec={condition.animation} visible size={96} />;
  return (
    <Pressable role="button" accessibilityLabel={`Mostra l'illustrazione di ${condition.name}`} accessibilityState={{ selected: back }} onPress={() => setBack((b) => !b)} style={styles.flip}>
      <Animated.View style={[styles.face, front]}>
        <SlidePreview spec={condition.animation} visible size={96} />
      </Animated.View>
      <Animated.View style={[styles.face, styles.faceBack, { backgroundColor: colors.surface2 }, rear]}>
        <Image source={art} style={styles.flipArt} contentFit="contain" accessible={false} />
      </Animated.View>
      <View aria-hidden style={[styles.flipBadge, { backgroundColor: colors.primary }]}>
        {back ? <Microscope color={colors.onPrimary} size={16} /> : <ImageIcon color={colors.onPrimary} size={16} />}
      </View>
    </Pressable>
  );
}

function FactorList({ title, items, sign }: { title: string; items: readonly string[]; sign: "+" | "−" }) {
  const { colors } = useTheme();
  if (items.length === 0) return null;
  return (
    <View style={styles.factor}>
      <Txt variant="small" bold header>
        {title}
      </Txt>
      <View role="list" style={styles.factorList}>
        {items.map((t) => (
          <View key={t} role="listitem" style={styles.factorItem}>
            <View aria-hidden style={[styles.sign, { backgroundColor: colors.surface2 }]}>
              <Txt variant="small" bold tone="primary">
                {sign}
              </Txt>
            </View>
            <Txt variant="small" style={styles.flex}>
              {t}
            </Txt>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: 28 },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  center: { alignItems: "center" },
  centerText: { textAlign: "center" },
  notice: { flexDirection: "row", gap: 12, borderWidth: 2, borderRadius: 24, padding: 16 },
  noticeIcon: { marginTop: 2 },
  note: { flexDirection: "row", gap: 8, borderRadius: 24, padding: 16 },
  section: { gap: 16 },
  sectionHead: { gap: 4 },
  meter: { gap: 8 },
  meterRow: { flexDirection: "row", gap: 6 },
  meterLabel: { flex: 1, alignItems: "center", gap: 4 },
  bar: { flex: 1, height: 10, borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999 },
  levelArt: { width: 176, height: 176, alignSelf: "center" },
  steps: { gap: 12 },
  explorer: { gap: 12, borderRadius: 24, padding: 16 },
  levels: { flexDirection: "row", gap: 8, paddingTop: 8 },
  level: { flex: 1, alignItems: "center", gap: 4, borderWidth: 2, borderRadius: 16, paddingHorizontal: 4, paddingTop: 6, paddingBottom: 8 },
  you: { position: "absolute", top: -10, zIndex: 1, borderRadius: 999, paddingHorizontal: 8 },
  youText: { fontSize: 12, lineHeight: 20 },
  levelImage: { width: 56, height: 56 },
  levelInfo: { gap: 4, borderRadius: 16, padding: 12 },
  list: { gap: 12 },
  noneArt: { width: 88, height: 88 },
  card: { gap: 16, borderWidth: 1, borderRadius: 24, padding: 16 },
  cardTop: { flexDirection: "row", gap: 12 },
  cardTitle: { flex: 1, gap: 6, alignItems: "flex-start" },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  barTick: { width: 4, borderRadius: 2 },
  matching: { gap: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  symptom: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  why: { flexDirection: "row", alignItems: "center", minHeight: 44, borderRadius: 16, paddingHorizontal: 16 },
  factors: { gap: 16 },
  factor: { gap: 6 },
  factorList: { gap: 6 },
  factorItem: { flexDirection: "row", gap: 8 },
  sign: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 1 },
  actions: { gap: 8 },
  find: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, borderRadius: 16, paddingHorizontal: 4, paddingVertical: 8 },
  findIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  flip: { width: 96, height: 96 },
  face: { position: "absolute", left: 0, top: 0, width: 96, height: 96, backfaceVisibility: "hidden" },
  faceBack: { borderRadius: 16, alignItems: "center", justifyContent: "center" },
  flipArt: { width: 80, height: 80 },
  flipBadge: { position: "absolute", right: -4, bottom: -4, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
});
