import { Siren, Undo2 } from "lucide-react-native";
import type { Ref } from "react";
import { Pressable, StyleSheet, View, type Text } from "react-native";
import { RED_FLAGS, type RedFlag, type RedFlagId } from "@data/emergency/red-flags";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";
import { CallEmergency, HelplineCard, SourceLink } from "./emergency";

/**
 * La schermata Emergenza dell'intervista: il pulsante per il 112 sempre per primo, poi cosa fare
 * caso per caso. Per i pensieri di farsi del male compaiono anche Telefono Amico e Telefono Azzurro
 * (per prima la linea più adatta all'età).
 */
export function EmergencyPanel({
  flags,
  age,
  onBack,
  headingRef,
}: {
  flags: readonly RedFlagId[];
  age: number | null;
  /** «Ho sbagliato a rispondere»: torna al passo precedente */
  onBack?: () => void;
  headingRef?: Ref<Text>;
}) {
  const { colors } = useTheme();
  const list = flags.map((id) => RED_FLAGS[id]);
  const single = list.length === 1 ? list[0] : undefined;
  const selfHarm = flags.includes("autolesionismo");

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={styles.kicker}>
          <Siren color={colors.red} size={20} />
          <Txt variant="small" bold tone="red">
            {selfHarm ? "Chiedi aiuto adesso" : "Possibile emergenza"}
          </Txt>
        </View>
        <Txt ref={headingRef} variant="display" tone="red" header>
          {single ? single.title : "Alcune risposte indicano una possibile emergenza"}
        </Txt>
        <Txt>
          {selfHarm
            ? "Quello che provi conta. Parlarne con qualcuno adesso può aiutarti."
            : "Da quello che ci hai detto potrebbe esserci un'emergenza. Non aspettare che passi da solo."}
        </Txt>
      </View>

      <CallEmergency />

      {list.map((flag) => (
        <FlagSteps key={flag.id} flag={flag} age={age} showTitle={!single} />
      ))}

      {onBack && (
        <View style={[styles.backRow, { borderTopColor: colors.line }]}>
          <Pressable role="button" onPress={onBack} style={({ pressed }) => [styles.back, pressed && { backgroundColor: colors.primarySoft }]}>
            <Undo2 color={colors.primary} size={20} />
            <Txt bold tone="primary" style={styles.flex}>
              Ho sbagliato a rispondere: torna indietro
            </Txt>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function FlagSteps({ flag, age, showTitle }: { flag: RedFlag; age: number | null; showTitle: boolean }) {
  const { colors } = useTheme();
  // Sotto i 18 anni Telefono Azzurro viene prima
  const helplines = age !== null && age < 18 ? [...flag.helplines].reverse() : flag.helplines;
  return (
    <View style={[styles.flag, { backgroundColor: colors.redSoft }]}>
      <Txt variant="heading" header>
        {showTitle ? flag.title : "Cosa fare adesso"}
      </Txt>
      <View role="list" style={styles.steps}>
        {flag.steps.map((step, i) => (
          <View key={step} role="listitem" style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: colors.surface }]}>
              <Txt bold tone="red">
                {i + 1}
              </Txt>
            </View>
            <Txt style={styles.stepText}>{step}</Txt>
          </View>
        ))}
      </View>
      {helplines.map((h) => (
        <HelplineCard key={h.number} helpline={h} tone="surface" />
      ))}
      <SourceLink title={flag.source.title} url={flag.source.url} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 24, paddingTop: 8 },
  header: { gap: 8 },
  kicker: { flexDirection: "row", alignItems: "center", gap: 8 },
  flag: { gap: 16, borderRadius: 24, padding: 20 },
  steps: { gap: 12 },
  step: { flexDirection: "row", gap: 12 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  stepText: { flex: 1, paddingTop: 3 },
  flex: { flex: 1 },
  backRow: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 16 },
  back: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44, paddingHorizontal: 8, marginLeft: -8, borderRadius: 16 },
});
