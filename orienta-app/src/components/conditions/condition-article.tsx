import { Image } from "expo-image";
import { router } from "expo-router";
import { AlertTriangle, ExternalLink, MapPin, Phone, Siren, Stethoscope } from "lucide-react-native";
import { useRef, type ReactNode } from "react";
import { AccessibilityInfo, Platform, Pressable, ScrollView, StyleSheet, View, type Text } from "react-native";
import { bodyAreaLabel } from "@data/vocab/body";
import { getSpecialty, type SpecialtyId } from "@data/vocab/specialties";
import { SOURCES_CHECKED_AT, formatItalianDate } from "@/lib/conditions/knowledge-base";
import type { Condition } from "@/lib/conditions/schema";
import { SlideViewer } from "~/components/slide/slide-viewer";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Callout } from "~/components/ui/callout";
import { Txt } from "~/components/ui/text";
import { CONDITION_ILLUSTRATIONS, SPECIALIST_ILLUSTRATIONS } from "~/lib/illustrations";
import { call, openSource } from "~/lib/links";
import { useReducedMotion } from "~/lib/use-reduced-motion";
import type { Palette } from "~/theme/colors";
import { useTheme } from "~/theme/theme";

const SECTIONS = [
  { id: "panoramica", label: "Panoramica" },
  { id: "come-e-fatta", label: "Com'è fatta" },
  { id: "storia", label: "Storia" },
  { id: "casi", label: "Casi clinici" },
  { id: "cause", label: "Cause" },
  { id: "sintomi", label: "Sintomi" },
  { id: "cure", label: "Cure" },
  { id: "quando-andare", label: "Quando andare dal medico" },
  { id: "prevenzione", label: "Prevenzione" },
  { id: "specialista", label: "Specialista" },
  { id: "fonti", label: "Fonti" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/** La sezione sulla sicurezza viene prima nell'indice: è quella da trovare subito */
const INDEX = [...SECTIONS.filter((s) => s.id === "quando-andare"), ...SECTIONS.filter((s) => s.id !== "quando-andare")];

function BulletList({ items, marker }: { items: readonly string[]; marker: keyof Palette }) {
  const { colors } = useTheme();
  return (
    <View style={styles.bullets}>
      {items.map((item) => (
        <View key={item} style={styles.bullet}>
          <View style={[styles.dot, { backgroundColor: colors[marker] }]} />
          <Txt style={styles.flex}>{item}</Txt>
        </View>
      ))}
    </View>
  );
}

function SubHeading({ children }: { children: string }) {
  return (
    <Txt variant="heading" header>
      {children}
    </Txt>
  );
}

/** Specialista e condizione passano alla sezione Medici come parametri della schermata */
function findNearby(specialist: SpecialtyId, condition: string) {
  router.navigate({ pathname: "/medici", params: { specialista: specialist, condizione: condition } });
}

/** La scheda completa di una condizione, con le stesse sezioni della web app */
export function ConditionArticle({ condition: c }: { condition: Condition }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const scroll = useRef<ScrollView>(null);
  const offsets = useRef(new Map<SectionId, number>());
  const headings = useRef(new Map<SectionId, Text>());
  const specialist = getSpecialty(c.specialist.id);
  const emergency = c.specialist.id === "pronto-soccorso";
  const illustration = CONDITION_ILLUSTRATIONS[c.id];
  const specialistImage = SPECIALIST_ILLUSTRATIONS[c.specialist.id];

  const jump = (id: SectionId) => {
    const y = offsets.current.get(id);
    if (y === undefined) return;
    scroll.current?.scrollTo({ y: Math.max(0, y - 8), animated: !reduced });
    // VoiceOver e TalkBack ripartono dal titolo della sezione (sul web non c'è questo comando)
    const heading = headings.current.get(id);
    if (heading && Platform.OS !== "web") AccessibilityInfo.sendAccessibilityEvent(heading, "focus");
  };

  const section = (id: SectionId, title: string, children: ReactNode) => (
    <View key={id} style={styles.section} onLayout={(e) => offsets.current.set(id, e.nativeEvent.layout.y)}>
      <Txt
        variant="title"
        tone="primary"
        header
        ref={(el: Text | null) => {
          if (el) headings.current.set(id, el);
          else headings.current.delete(id);
        }}
      >
        {title}
      </Txt>
      {children}
    </View>
  );

  return (
    <ScrollView ref={scroll} style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.page} contentInsetAdjustmentBehavior="automatic">
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Txt variant="display" header>
              {c.name}
            </Txt>
            {c.aliases.length > 0 && <Txt tone="inkMuted">Detta anche: {c.aliases.join(", ")}</Txt>}
          </View>
          {illustration !== undefined && <Image source={illustration} style={styles.illustration} contentFit="contain" accessible={false} />}
        </View>
        <View style={styles.badges} accessibilityLabel="Aree del corpo">
          {c.areas.map((a) => (
            <Badge key={a} label={bodyAreaLabel(a)} />
          ))}
        </View>
        {c.reviewStatus === "da revisionare" && (
          <View style={styles.review}>
            <AlertTriangle color={colors.amber} size={16} style={styles.reviewIcon} />
            <Txt variant="small" tone="inkMuted" style={styles.flex}>
              Contenuto non ancora revisionato da un medico.
            </Txt>
          </View>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityLabel="In questa scheda" style={styles.indexRow} contentContainerStyle={styles.index}>
          {INDEX.map((s) => {
            const safety = s.id === "quando-andare";
            return (
              <Pressable
                key={s.id}
                role="link"
                accessibilityLabel={s.label}
                accessibilityHint="Scorre fino alla sezione"
                onPress={() => jump(s.id)}
                style={({ pressed }) => [styles.chip, { backgroundColor: safety ? colors.redSoft : colors.surface2, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
              >
                {safety && <Siren color={colors.red} size={16} />}
                <Txt variant="small" bold tone={safety ? "red" : "ink"}>
                  {s.label}
                </Txt>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {section(
        "panoramica",
        "Panoramica",
        <Txt variant="heading" bold={false}>
          {c.overview}
        </Txt>,
      )}

      {section("come-e-fatta", "Com'è fatta", <SlideViewer spec={c.animation} subject={c.name} />)}

      {section(
        "storia",
        "Storia",
        <>
          <View style={styles.tight}>
            <SubHeading>Da dove viene il nome</SubHeading>
            <Txt>{c.history.nameOrigin}</Txt>
          </View>
          <SubHeading>Le tappe</SubHeading>
          <View style={[styles.timeline, { borderColor: colors.line }]}>
            {c.history.events.map((e) => (
              <View key={e.when + e.text.slice(0, 20)} style={styles.event}>
                <View style={[styles.eventDot, { borderColor: colors.primary, backgroundColor: colors.bg }]} />
                <Txt bold tone="primary">
                  {e.when}
                </Txt>
                <Txt>{e.text}</Txt>
              </View>
            ))}
          </View>
        </>,
      )}

      {section(
        "casi",
        c.cases.length > 1 ? "Casi clinici" : "Un caso clinico",
        c.cases.map((k) => (
          <View key={k.title} style={[styles.case, { backgroundColor: colors.surface2 }]}>
            <Badge tone={k.kind === "illustrativo" ? "primary" : "accent"} label={k.kind === "illustrativo" ? "Caso inventato a scopo illustrativo" : "Caso pubblicato"} />
            <Txt variant="heading" header>
              {k.title}
            </Txt>
            <Txt>{k.story}</Txt>
            <Txt>
              <Txt bold>Cosa insegna: </Txt>
              {k.lesson}
            </Txt>
            {k.kind === "pubblicato" && (
              <Pressable role="link" accessibilityHint="Si apre nel browser" onPress={() => openSource(k.source.url)} style={styles.inlineLink}>
                <Txt variant="small" bold tone="primary" style={styles.underline}>
                  Fonte: {k.source.publisher}
                </Txt>
                <ExternalLink color={colors.primary} size={16} />
              </Pressable>
            )}
          </View>
        )),
      )}

      {section(
        "cause",
        "Cause e fattori di rischio",
        <>
          <BulletList items={c.causes} marker="accent" />
          <SubHeading>Cosa aumenta il rischio</SubHeading>
          <BulletList items={c.riskFactors} marker="primary" />
        </>,
      )}

      {section(
        "sintomi",
        "Sintomi",
        <>
          <SubHeading>Tipici</SubHeading>
          <BulletList items={c.symptoms.typical} marker="accent" />
          <SubHeading>Meno comuni</SubHeading>
          <BulletList items={c.symptoms.lessCommon} marker="primary" />
        </>,
      )}

      {section(
        "cure",
        "Cure possibili",
        <>
          <View style={[styles.options, { borderColor: colors.line }]}>
            {c.treatments.options.map((o, i) => (
              <View key={o.title} style={[styles.option, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.line }]}>
                <Txt bold>{o.title}</Txt>
                <Txt tone="inkMuted">{o.text}</Txt>
              </View>
            ))}
          </View>
          <SubHeading>Cosa puoi fare tu</SubHeading>
          <BulletList items={c.treatments.selfCare} marker="calm" />
          <Callout title="Farmaci: chiedi sempre al medico o al farmacista">
            Questa scheda descrive solo i tipi di cura. Quale farmaco usare, in che dose e per quanto tempo lo decide un professionista che conosce la tua situazione.
          </Callout>
        </>,
      )}

      {section(
        "quando-andare",
        "Quando andare dal medico",
        <>
          <View style={[styles.alert, { borderColor: colors.amber, backgroundColor: colors.amberSoft }]}>
            <View style={styles.alertHead}>
              <Stethoscope color={colors.amber} size={20} style={styles.alertIcon} />
              <Txt bold tone="amber" style={styles.flex}>
                Senti il medico di base o la guardia medica (116117 dove attivo) se:
              </Txt>
            </View>
            <BulletList items={c.whenToSeeDoctor.routine} marker="amber" />
          </View>
          <View style={[styles.alert, { borderColor: colors.red, backgroundColor: colors.redSoft }]}>
            <View style={styles.alertHead}>
              <Siren color={colors.red} size={20} style={styles.alertIcon} />
              <Txt bold tone="red" style={styles.flex}>
                Chiedi aiuto subito, con il 112 o al pronto soccorso, se:
              </Txt>
            </View>
            <BulletList items={c.whenToSeeDoctor.urgent} marker="red" />
            <Button label="Chiama il 112" icon={Phone} variant="danger" onPress={() => call("112")} hint="Apre il telefono con il 112 già composto" />
          </View>
        </>,
      )}

      {section("prevenzione", "Prevenzione", <BulletList items={c.prevention} marker="calm" />)}

      {section(
        "specialista",
        "Specialista di riferimento",
        <>
          <View style={[styles.case, { backgroundColor: colors.primarySoft }]}>
            <View style={styles.titleRow}>
              <Txt variant="heading" tone="primary" style={styles.flex}>
                {specialist.label}
              </Txt>
              {specialistImage !== undefined && <Image source={specialistImage} style={styles.specialistImage} contentFit="contain" accessible={false} />}
            </View>
            <Txt>{c.specialist.why}</Txt>
            <Txt variant="small" tone="inkMuted">
              {specialist.description}
            </Txt>
            {emergency ? (
              <View style={styles.tight}>
                <Button label="Chiama il 112" icon={Phone} variant="danger" onPress={() => call("112")} hint="Apre il telefono con il 112 già composto" />
                <Button label="Trova il pronto soccorso vicino a me" icon={MapPin} variant="secondary" onPress={() => findNearby("pronto-soccorso", c.id)} />
              </View>
            ) : (
              <Button label="Trova vicino a me" icon={MapPin} onPress={() => findNearby(c.specialist.id, c.id)} />
            )}
          </View>
          {!emergency && c.specialist.id !== "medico-di-base" && (
            <View style={styles.tight}>
              <Txt>
                {c.specialist.id === "pediatra"
                  ? "Per un adulto il primo passo è il medico di base."
                  : "Di solito il primo passo è il medico di base: ti visita e, se serve, ti indirizza dallo specialista."}
              </Txt>
              <Button label="Trova il medico di base" icon={Stethoscope} variant="secondary" onPress={() => findNearby("medico-di-base", c.id)} />
            </View>
          )}
        </>,
      )}

      {section(
        "fonti",
        "Fonti",
        <>
          <Txt variant="small" tone="inkMuted">
            La scheda si basa su queste fonti autorevoli. Ultimo aggiornamento: {formatItalianDate(c.updatedAt)}. Link verificati il {formatItalianDate(SOURCES_CHECKED_AT)}.
          </Txt>
          <View style={[styles.options, { borderColor: colors.line }]}>
            {c.sources.map((s, i) => (
              <Pressable
                key={s.url}
                role="link"
                accessibilityLabel={`${s.publisher}${s.lang === "en" ? " (in inglese)" : ""}: ${s.title}`}
                accessibilityHint="Si apre nel browser"
                onPress={() => openSource(s.url)}
                style={({ pressed }) => [styles.source, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.line }, pressed && { backgroundColor: colors.surface2 }]}
              >
                <ExternalLink color={colors.primary} size={16} style={styles.sourceIcon} />
                <View style={styles.flex}>
                  <Txt variant="small" bold tone="inkMuted">
                    {s.publisher}
                    {s.lang === "en" ? " (in inglese)" : ""}
                  </Txt>
                  <Txt bold tone="primary">
                    {s.title}
                  </Txt>
                </View>
              </Pressable>
            ))}
          </View>
        </>,
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48, gap: 40, maxWidth: 672, width: "100%", alignSelf: "center" },
  header: { gap: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  titleText: { flex: 1, gap: 8 },
  illustration: { width: 112, height: 112 },
  specialistImage: { width: 80, height: 80 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  review: { flexDirection: "row", gap: 8 },
  reviewIcon: { marginTop: 3 },
  indexRow: { marginHorizontal: -16 },
  index: { gap: 8, paddingHorizontal: 16, paddingBottom: 4 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  section: { gap: 16 },
  tight: { gap: 8 },
  flex: { flex: 1 },
  bullets: { gap: 8 },
  bullet: { flexDirection: "row", gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 10, flexShrink: 0 },
  timeline: { borderLeftWidth: 2, paddingLeft: 24, gap: 20, marginLeft: 6 },
  event: { gap: 2 },
  eventDot: { position: "absolute", left: -32, top: 6, width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  case: { gap: 12, borderRadius: 16, padding: 20 },
  inlineLink: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: 44 },
  underline: { textDecorationLine: "underline" },
  options: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  option: { gap: 2, paddingVertical: 12 },
  alert: { gap: 12, borderRadius: 16, borderWidth: 2, padding: 16 },
  alertHead: { flexDirection: "row", gap: 8 },
  alertIcon: { marginTop: 3 },
  source: { flexDirection: "row", alignItems: "flex-start", gap: 12, minHeight: 44, paddingVertical: 12, paddingHorizontal: 8, marginHorizontal: -8, borderRadius: 12 },
  sourceIcon: { marginTop: 4 },
});
