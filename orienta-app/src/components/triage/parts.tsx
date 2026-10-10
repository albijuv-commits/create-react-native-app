import { Image } from "expo-image";
import { ArrowLeft, Check } from "lucide-react-native";
import type { ReactNode, Ref } from "react";
import { Pressable, StyleSheet, View, type Text } from "react-native";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";

/** Intestazione di un passo dell'intervista: VoiceOver e TalkBack partono dal titolo quando il passo compare */
export function StepHeader({
  step,
  title,
  lead,
  image,
  onBack,
  headingRef,
  titleTone = "primary",
}: {
  step?: string;
  title: string;
  lead?: string;
  /** Illustrazione decorativa accanto al titolo */
  image?: number;
  onBack?: () => void;
  headingRef?: Ref<Text>;
  titleTone?: "primary" | "red";
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      {(step || onBack) && (
        <View style={styles.headerTop}>
          {onBack && (
            <Pressable role="button" accessibilityLabel="Indietro" onPress={onBack} style={({ pressed }) => [styles.back, pressed && { backgroundColor: colors.primarySoft }]}>
              <ArrowLeft color={colors.primary} size={20} />
              <Txt variant="small" bold tone="primary">
                Indietro
              </Txt>
            </Pressable>
          )}
          {step ? (
            <Txt variant="small" bold tone="accent" style={styles.step}>
              {step}
            </Txt>
          ) : null}
        </View>
      )}
      <View style={styles.titleRow}>
        <Txt ref={headingRef} variant="display" tone={titleTone} header style={styles.flex}>
          {title}
        </Txt>
        {image !== undefined && <Image source={image} style={styles.image} contentFit="contain" accessible={false} />}
      </View>
      {lead ? <Txt tone="inkMuted">{lead}</Txt> : null}
    </View>
  );
}

/** Casella da spuntare grande quanto tutta la riga, con una nota facoltativa sotto */
export function CheckRow({
  checked,
  onChange,
  label,
  note,
  invalid = false,
  tone = "primary",
  icon,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  note?: string;
  invalid?: boolean;
  /** Rosso per i segnali d'allarme */
  tone?: "primary" | "red";
  icon?: ReactNode;
}) {
  const { colors } = useTheme();
  const on = tone === "red" ? colors.red : colors.primary;
  const soft = tone === "red" ? colors.redSoft : colors.primarySoft;
  return (
    <Pressable
      role="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={note ? `${label}. ${note}` : label}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => [
        styles.check,
        { borderColor: invalid ? colors.red : checked ? on : colors.line, backgroundColor: checked ? soft : colors.surface, transform: [{ scale: pressed ? 0.99 : 1 }] },
      ]}
    >
      <View style={[styles.box, { borderColor: checked ? on : colors.inkMuted, backgroundColor: checked ? on : colors.surface }]}>
        {checked && <Check color={tone === "red" ? colors.onRed : colors.onPrimary} size={18} strokeWidth={3} />}
      </View>
      <View style={styles.checkText}>
        <View style={styles.checkLabel}>
          {icon}
          <Txt bold style={styles.flex}>
            {label}
          </Txt>
        </View>
        {note ? (
          <Txt variant="small" tone="inkMuted">
            {note}
          </Txt>
        ) : null}
      </View>
    </Pressable>
  );
}

/** Messaggio di errore di un campo, annunciato quando compare */
export function FieldError({ children }: { children: string }) {
  return (
    <Txt variant="small" bold tone="red" accessibilityRole="alert" accessibilityLiveRegion="assertive">
      {children}
    </Txt>
  );
}

/** Pulsante a pillola con stato premuto: chip dei sintomi e delle zone */
export function Chip({
  label,
  onPress,
  pressed = false,
  icon,
  tone = "accent",
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  pressed?: boolean;
  icon?: ReactNode;
  tone?: "accent" | "primary";
  accessibilityLabel?: string;
}) {
  const { colors } = useTheme();
  const on = tone === "accent" ? colors.accent : colors.primary;
  const soft = tone === "accent" ? colors.accentSoft : colors.primarySoft;
  return (
    <Pressable
      role="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: pressed }}
      onPress={onPress}
      style={({ pressed: down }) => [
        styles.chip,
        { borderColor: pressed ? on : colors.line, backgroundColor: pressed ? soft : colors.surface, transform: [{ scale: down ? 0.97 : 1 }] },
      ]}
    >
      {icon}
      <Txt variant="small" bold style={{ color: pressed ? on : colors.ink }}>
        {label}
      </Txt>
    </Pressable>
  );
}

/** Pillola già scelta (sintomo o zona) da toccare per toglierla */
export function RemovableChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      role="button"
      accessibilityLabel={`${label}: togli`}
      onPress={onRemove}
      style={({ pressed }) => [styles.removable, { backgroundColor: colors.accentSoft, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
    >
      <Txt variant="small" bold tone="accent">
        {label}
      </Txt>
      <Txt variant="small" bold tone="accent" accessible={false}>
        ×
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { gap: 8, paddingTop: 4 },
  headerTop: { flexDirection: "row", alignItems: "center", minHeight: 44, gap: 8 },
  back: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingHorizontal: 8, marginLeft: -8, borderRadius: 16 },
  step: { marginLeft: "auto" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  image: { width: 92, height: 92 },
  check: { flexDirection: "row", gap: 12, borderWidth: 2, borderRadius: 16, padding: 16 },
  box: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 1 },
  checkText: { flex: 1, gap: 4 },
  checkLabel: { flexDirection: "row", gap: 6, alignItems: "flex-start" },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, borderWidth: 2, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  removable: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44, borderRadius: 999, paddingLeft: 16, paddingRight: 14, paddingVertical: 8 },
});
