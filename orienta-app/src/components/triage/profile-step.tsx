import { ArrowRight, Minus, Plus, UsersRound, type LucideIcon } from "lucide-react-native";
import { useEffect, useRef, useState, type Ref } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View, type Text } from "react-native";
import type { Profile } from "@/lib/triage/schema";
import { Button } from "~/components/ui/button";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";
import { textStyle } from "~/theme/type";
import { CheckRow, FieldError, StepHeader } from "./parts";

export interface ProfileDraft {
  age: number | null;
  sex: Profile["sex"] | null;
  pregnancy: Profile["pregnancy"];
  /** Sotto i 14 anni: un genitore o un tutore dà il consenso */
  guardian: boolean;
}

export const MAX_AGE = 120;

/** La domanda sulla gravidanza ha senso solo per alcune persone (come nella web app) */
export function asksPregnancy(p: Pick<ProfileDraft, "age" | "sex">): boolean {
  return p.age !== null && p.age >= 10 && p.age <= 55 && (p.sex === "femmina" || p.sex === "altro");
}

export function completeProfile(p: ProfileDraft): Profile | null {
  if (p.age === null || p.sex === null) return null;
  if (p.age < 14 && !p.guardian) return null;
  return { age: p.age, sex: p.sex, pregnancy: asksPregnancy(p) ? p.pregnancy : "non-applicabile" };
}

const SEX_OPTIONS: { id: Profile["sex"]; label: string }[] = [
  { id: "femmina", label: "Femmina" },
  { id: "maschio", label: "Maschio" },
  { id: "altro", label: "Altro" },
  { id: "non-indicato", label: "Preferisco non dirlo" },
];

const PREGNANCY_OPTIONS: { id: Profile["pregnancy"]; label: string }[] = [
  { id: "si", label: "Sì" },
  { id: "no", label: "No" },
  { id: "non-so", label: "Non so" },
];

export function ProfileStep({
  value,
  onChange,
  onNext,
  onBack,
  headingRef,
}: {
  value: ProfileDraft;
  onChange: (next: ProfileDraft) => void;
  onNext: () => void;
  onBack: () => void;
  headingRef: Ref<Text>;
}) {
  const { colors, scale } = useTheme();
  const [tried, setTried] = useState(false);
  // Il campo può restare vuoto mentre si scrive: l'età vera è in `value.age`
  const [ageText, setAgeText] = useState(value.age === null ? "" : String(value.age));

  const setAge = (age: number | null) => {
    setAgeText(age === null ? "" : String(age));
    onChange({ ...value, age });
  };
  const step = (delta: number) => setAge(Math.min(MAX_AGE, Math.max(0, (value.age ?? (delta > 0 ? 29 : 31)) + delta)));

  const pregnancy = asksPregnancy(value);
  const child = value.age !== null && value.age < 14;
  const teen = value.age !== null && value.age >= 14 && value.age < 18;
  const errors = {
    age: value.age === null,
    sex: value.sex === null,
    guardian: child && !value.guardian,
    pregnancy: pregnancy && value.pregnancy === "non-applicabile",
  };

  const submit = () => {
    if (errors.age || errors.sex || errors.guardian || errors.pregnancy) {
      setTried(true);
      return;
    }
    onNext();
  };

  return (
    <View style={styles.page}>
      <StepHeader step="Passo 2 di 4" title="Qualche dato su di te" lead="Servono a capire quali condizioni sono più probabili alla tua età." headingRef={headingRef} onBack={onBack} />

      <View style={styles.group}>
        <Txt variant="heading" header nativeID="eta-titolo">
          Quanti anni hai?
        </Txt>
        <View style={styles.ageRow}>
          <HoldButton icon={Minus} label="Un anno in meno" onStep={() => step(-1)} disabled={value.age === 0} />
          <View style={styles.ageField}>
            <TextInput
              value={ageText}
              onChangeText={(raw) => {
                const digits = raw.replace(/[^0-9]/g, "").slice(0, 3);
                setAgeText(digits);
                const n = Number.parseInt(digits, 10);
                onChange({ ...value, age: digits === "" || Number.isNaN(n) ? null : Math.min(MAX_AGE, Math.max(0, n)) });
              }}
              onBlur={() => setAgeText(value.age === null ? "" : String(value.age))}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={3}
              placeholder="–"
              placeholderTextColor={colors.inkMuted}
              accessibilityLabel="Età in anni"
              accessibilityHint="Per un neonato scrivi 0"
              style={[
                styles.ageInput,
                textStyle("display", scale, true),
                { color: colors.ink, backgroundColor: colors.surface, borderColor: tried && errors.age ? colors.red : colors.line },
                Platform.select({ web: { outlineWidth: 0 }, default: {} }),
              ]}
            />
            <Txt bold tone="inkMuted" accessible={false}>
              anni
            </Txt>
          </View>
          <HoldButton icon={Plus} label="Un anno in più" onStep={() => step(1)} disabled={value.age === MAX_AGE} />
        </View>
        <Txt variant="small" tone="inkMuted">
          Puoi scrivere l&apos;età o tenere premuti i pulsanti. Per un neonato scrivi 0.
        </Txt>
        {tried && errors.age ? <FieldError>Scrivi l&apos;età per continuare.</FieldError> : null}
      </View>

      {child ? (
        <View style={[styles.box, { backgroundColor: colors.primarySoft }]}>
          <View style={styles.note}>
            <UsersRound color={colors.primary} size={20} style={styles.noteIcon} />
            <Txt variant="small" style={styles.flex}>
              <Txt variant="small" bold>
                Sotto i 14 anni serve un genitore o un tutore.{" "}
              </Txt>
              Se compili per un bambino, rispondi pensando a lui o a lei.
            </Txt>
          </View>
          <CheckRow
            checked={value.guardian}
            onChange={(guardian) => onChange({ ...value, guardian })}
            invalid={tried && errors.guardian}
            label="Sono un genitore o un tutore (oppure ne ho uno accanto) e do il consenso."
          />
          {tried && errors.guardian ? <FieldError>Serve il consenso di un genitore o di un tutore.</FieldError> : null}
        </View>
      ) : null}
      {teen ? (
        <View style={[styles.box, styles.note, { backgroundColor: colors.primarySoft }]}>
          <UsersRound color={colors.primary} size={20} style={styles.noteIcon} />
          <Txt variant="small" style={styles.flex}>
            Se puoi, rispondi insieme a un adulto di cui ti fidi: un genitore, un parente, un insegnante.
          </Txt>
        </View>
      ) : null}

      <Choices
        legend="Sesso"
        note="Alcune condizioni dipendono dal sesso biologico."
        options={SEX_OPTIONS}
        value={value.sex}
        onChange={(sex) => onChange({ ...value, sex })}
        error={tried && errors.sex ? "Scegli un'opzione: va bene anche «Preferisco non dirlo»." : null}
        columns={2}
      />

      {pregnancy ? (
        <Choices
          legend="Potresti essere incinta?"
          note="Alcuni disturbi in gravidanza vanno sempre sentiti dal medico."
          options={PREGNANCY_OPTIONS}
          value={value.pregnancy === "non-applicabile" ? null : value.pregnancy}
          onChange={(p) => onChange({ ...value, pregnancy: p })}
          error={tried && errors.pregnancy ? "Scegli un'opzione: va bene anche «Non so»." : null}
          columns={3}
        />
      ) : null}

      <Button label="Continua" icon={ArrowRight} size="lg" onPress={submit} />
    </View>
  );
}

/** Gruppo di scelte esclusive con l'aspetto di grandi pulsanti */
function Choices<T extends string>({
  legend,
  note,
  options,
  value,
  onChange,
  error,
  columns,
}: {
  legend: string;
  note?: string;
  options: { id: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  error: string | null;
  columns: 2 | 3;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.group}>
      <Txt variant="heading" header>
        {legend}
      </Txt>
      {note ? (
        <Txt variant="small" tone="inkMuted">
          {note}
        </Txt>
      ) : null}
      <View role="radiogroup" accessibilityLabel={legend} style={styles.choices}>
        {options.map((o) => {
          const checked = value === o.id;
          return (
            <Pressable
              key={o.id}
              role="radio"
              accessibilityLabel={o.label}
              accessibilityState={{ checked }}
              onPress={() => onChange(o.id)}
              style={({ pressed }) => [
                styles.choice,
                { width: columns === 2 ? "48.5%" : "31.5%" },
                {
                  borderColor: checked ? colors.primary : error ? colors.red : colors.line,
                  backgroundColor: checked ? colors.primary : colors.surface,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Txt bold style={[styles.center, { color: checked ? colors.onPrimary : colors.ink }]}>
                {o.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
      {error ? <FieldError>{error}</FieldError> : null}
    </View>
  );
}

/**
 * Pulsante che ripete l'azione finché resta premuto: scatta subito e poi accelera. Con VoiceOver
 * e TalkBack (attivazione senza tocco prolungato) fa un passo per volta.
 */
function HoldButton({ icon: Icon, label, onStep, disabled = false }: { icon: LucideIcon; label: string; onStep: () => void; disabled?: boolean }) {
  const { colors } = useTheme();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touched = useRef(false);
  const latest = useRef(onStep);
  useEffect(() => {
    latest.current = onStep;
  });
  const stop = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);
  // Arrivati al limite il pulsante si disattiva: niente ripetizioni oltre
  useEffect(() => {
    if (disabled) stop();
  }, [disabled]);

  const repeat = (delay: number) => {
    timer.current = setTimeout(() => {
      latest.current();
      repeat(Math.max(45, delay * 0.8));
    }, delay);
  };

  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPressIn={() => {
        touched.current = true;
        latest.current();
        repeat(420);
      }}
      onPressOut={stop}
      onPress={() => {
        // Il tocco ha già fatto il suo passo; l'attivazione da VoiceOver o TalkBack arriva solo qui
        if (!touched.current) latest.current();
        touched.current = false;
      }}
      style={({ pressed }) => [styles.hold, { backgroundColor: colors.primarySoft, opacity: disabled ? 0.4 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] }]}
    >
      <Icon color={colors.primary} size={24} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { gap: 28 },
  group: { gap: 12 },
  ageRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
  ageField: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  ageInput: { width: 112, height: 80, borderWidth: 2, borderRadius: 16, textAlign: "center", paddingVertical: 0 },
  hold: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  box: { gap: 12, borderRadius: 24, padding: 16 },
  note: { flexDirection: "row", gap: 8 },
  noteIcon: { marginTop: 2 },
  flex: { flex: 1 },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: { minHeight: 56, borderWidth: 2, borderRadius: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 10, paddingVertical: 8 },
  center: { textAlign: "center" },
});
