import { ArrowRight, Phone, Plus, Siren } from "lucide-react-native";
import { useState, type Ref } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View, type Text } from "react-native";
import { RED_FLAGS, type RedFlagId } from "@data/emergency/red-flags";
import type { BodyZoneId } from "@data/vocab/body";
import { symptomLabel, type SymptomId } from "@data/vocab/symptoms";
import descrivi from "@/assets/illustrations/passo-descrivi.webp";
import { zoneSymptoms } from "@/lib/triage/questions";
import type { Ambiguity } from "@/lib/triage/recognize";
import { BodyMap } from "~/components/body-map/body-map";
import { Button } from "~/components/ui/button";
import { Txt } from "~/components/ui/text";
import { call } from "~/lib/links";
import { useTheme } from "~/theme/theme";
import { textStyle } from "~/theme/type";
import { Chip, FieldError, RemovableChip, StepHeader } from "./parts";

export const MAX_TEXT = 1000;

/** Sintomi frequenti da toccare quando non c'è ancora niente di più specifico (come nella web app) */
const COMMON: SymptomId[] = ["febbre", "mal-di-testa", "mal-di-gola", "tosse-secca", "naso-che-cola", "mal-di-pancia", "nausea", "stanchezza"];
const SUGGESTIONS_SHOWN = 8;

export function DescribeStep({
  text,
  onText,
  symptoms,
  onAddSymptom,
  onRemoveSymptom,
  zones,
  onToggleZone,
  ambiguities,
  flags,
  onEmergency,
  onBack,
  young,
  headingRef,
}: {
  text: string;
  onText: (text: string) => void;
  /** I sintomi attivi: riconosciuti nel testo (se non tolti) più quelli toccati */
  symptoms: readonly SymptomId[];
  onAddSymptom: (id: SymptomId) => void;
  onRemoveSymptom: (id: SymptomId) => void;
  zones: readonly BodyZoneId[];
  onToggleZone: (zone: BodyZoneId) => void;
  /** Parole generiche del testo da precisare («tosse»: secca o con catarro?) */
  ambiguities: readonly Ambiguity[];
  /** Segnali d'allarme trovati in ciò che è stato scritto finora */
  flags: readonly RedFlagId[];
  onEmergency: () => void;
  onBack: () => void;
  young: boolean;
  headingRef: Ref<Text>;
}) {
  const { colors, scale } = useTheme();
  const [allSuggestions, setAllSuggestions] = useState(false);
  const [focused, setFocused] = useState(false);
  const active = new Set(symptoms);
  const fromZones = zoneSymptoms(zones).filter((s) => !active.has(s));
  const suggestions = zones.length ? fromZones : COMMON.filter((s) => !active.has(s));
  const shown = allSuggestions ? suggestions : suggestions.slice(0, SUGGESTIONS_SHOWN);

  return (
    <View style={styles.page}>
      <StepHeader
        step="Passo 3 di 4"
        title="Cosa senti?"
        lead={
          young
            ? "Racconta con parole tue cosa senti, oppure tocca il punto del corpo dove ti fa male."
            : "Scrivilo con parole tue, tocca le zone del corpo o scegli i sintomi: basta anche una sola di queste cose."
        }
        image={descrivi}
        headingRef={headingRef}
        onBack={onBack}
      />

      <View style={styles.group}>
        {/* L'etichetta visibile del campo: il lettore di schermo la sente già sul campo stesso */}
        <Txt variant="heading" accessible={false} importantForAccessibility="no">
          Descrivi i tuoi disturbi
        </Txt>
        <TextInput
          value={text}
          onChangeText={(t) => onText(t.slice(0, MAX_TEXT))}
          maxLength={MAX_TEXT}
          multiline
          textAlignVertical="top"
          placeholder="Per esempio: da ieri ho mal di gola e un po' di febbre"
          placeholderTextColor={colors.inkMuted}
          accessibilityLabel="Descrivi i tuoi disturbi"
          accessibilityHint="Non scrivere nome, indirizzo o altri dati che ti identificano"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.textarea,
            textStyle("body", scale, false),
            { color: colors.ink, backgroundColor: colors.surface, borderColor: focused ? colors.primary : colors.line },
            Platform.select({ web: { outlineWidth: 0 }, default: {} }),
          ]}
        />
        <View style={styles.noteRow}>
          <Txt variant="small" tone="inkMuted" style={styles.flex}>
            Non scrivere nome, indirizzo o altri dati che ti identificano.
          </Txt>
          <Txt variant="small" tone="inkMuted" accessible={false}>
            {text.length}/{MAX_TEXT}
          </Txt>
        </View>
      </View>

      {ambiguities.map((a) => (
        <View key={a.question} style={[styles.box, { backgroundColor: colors.surface2 }]}>
          <Txt bold>
            Hai scritto «{a.term}»: {a.question.charAt(0).toLowerCase() + a.question.slice(1)}
          </Txt>
          <View style={styles.chips}>
            {a.options.map((o) => (
              <Chip key={o} label={symptomLabel(o)} accessibilityLabel={`Aggiungi: ${symptomLabel(o)}`} onPress={() => onAddSymptom(o)} icon={<Plus color={colors.ink} size={16} />} />
            ))}
          </View>
        </View>
      ))}

      {flags.length > 0 ? (
        <View accessibilityRole="alert" accessibilityLiveRegion="assertive" style={[styles.box, styles.alert, { backgroundColor: colors.redSoft, borderColor: colors.red }]}>
          <View style={styles.row}>
            <Siren color={colors.red} size={20} style={styles.icon} />
            <Txt bold tone="red" style={styles.flex}>
              Quello che descrivi può essere un&apos;emergenza.
            </Txt>
          </View>
          <View style={styles.flagList}>
            {flags.map((f) => (
              <Txt key={f} variant="small">
                • {RED_FLAGS[f].title}
              </Txt>
            ))}
          </View>
          <View style={styles.twoButtons}>
            <Button label="Chiama il 112" icon={Phone} variant="danger" onPress={() => call("112")} hint="Apre il telefono con il 112 già composto" style={styles.flex} />
            <Button label="Cosa fare" variant="secondary" onPress={onEmergency} style={styles.flex} />
          </View>
        </View>
      ) : null}

      {symptoms.length > 0 ? (
        <View style={styles.group}>
          <Txt bold header>
            I sintomi che hai indicato
          </Txt>
          <View style={styles.chips}>
            {symptoms.map((s) => (
              <RemovableChip key={s} label={symptomLabel(s)} onRemove={() => onRemoveSymptom(s)} />
            ))}
          </View>
          <Txt variant="small" tone="inkMuted">
            Li riconosciamo mentre scrivi: tocca un sintomo per toglierlo se non è giusto.
          </Txt>
        </View>
      ) : null}

      <View style={styles.group}>
        <Txt variant="heading" header>
          Dove senti fastidio?
        </Txt>
        <BodyMap selected={zones} onToggle={onToggleZone} />
      </View>

      {suggestions.length > 0 ? (
        <View style={styles.group}>
          <Txt variant="heading" header>
            {zones.length ? "Nelle zone che hai indicato, senti anche…" : "Oppure tocca un sintomo frequente"}
          </Txt>
          <View style={styles.chips}>
            {shown.map((s) => (
              <Chip key={s} label={symptomLabel(s)} accessibilityLabel={`Aggiungi: ${symptomLabel(s)}`} onPress={() => onAddSymptom(s)} icon={<Plus color={colors.ink} size={16} />} />
            ))}
          </View>
          {suggestions.length > SUGGESTIONS_SHOWN ? (
            <Pressable role="button" accessibilityState={{ expanded: allSuggestions }} onPress={() => setAllSuggestions((v) => !v)} style={styles.more}>
              <Txt bold tone="primary">
                {allSuggestions ? "Mostra meno" : `Mostra tutti (${suggestions.length})`}
              </Txt>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/** Il pulsante per andare avanti, sempre visibile in fondo allo schermo mentre si descrive */
export function DescribeFooter({ error, onNext }: { error: string | null; onNext: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.footer, { backgroundColor: colors.bg, borderTopColor: colors.line }]}>
      {error ? <FieldError>{error}</FieldError> : null}
      <Button label="Continua con le domande" icon={ArrowRight} onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: 28 },
  group: { gap: 8 },
  textarea: { minHeight: 132, borderWidth: 2, borderRadius: 16, padding: 16 },
  noteRow: { flexDirection: "row", gap: 12 },
  flex: { flex: 1 },
  box: { gap: 8, borderRadius: 24, padding: 16 },
  alert: { borderWidth: 2, gap: 12 },
  row: { flexDirection: "row", gap: 8 },
  icon: { marginTop: 2 },
  flagList: { gap: 4, paddingLeft: 4 },
  twoButtons: { flexDirection: "row", gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  more: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  footer: { gap: 8, borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
});
