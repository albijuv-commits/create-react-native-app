import { Check, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "~/theme/theme";
import { Txt } from "./text";

/** Una scelta tra poche opzioni (tema, dimensione del testo, distanza): un gruppo di pulsanti di scelta */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string; icon?: LucideIcon; disabled?: boolean }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.group}>
      <Txt bold>{label}</Txt>
      <View role="radiogroup" accessibilityLabel={label} style={[styles.track, { backgroundColor: colors.surface2 }]}>
        {options.map((o) => {
          const selected = o.value === value;
          const Icon = o.icon;
          return (
            <Pressable
              key={o.value}
              role="radio"
              accessibilityState={{ checked: selected, disabled: o.disabled }}
              accessibilityLabel={o.label}
              disabled={o.disabled}
              onPress={() => onChange(o.value)}
              style={({ pressed }) => [
                styles.option,
                selected && [styles.selected, { backgroundColor: colors.surface, shadowColor: colors.ink }],
                { opacity: o.disabled ? 0.45 : 1, transform: [{ scale: pressed && !o.disabled ? 0.97 : 1 }] },
              ]}
            >
              {selected && !Icon && <Check color={colors.primary} size={16} strokeWidth={3} style={styles.check} />}
              {Icon && <Icon color={selected ? colors.primary : colors.inkMuted} size={18} strokeWidth={2.2} style={styles.check} />}
              <Txt variant="small" bold={selected} tone={selected ? "primary" : "inkMuted"} style={styles.optionLabel}>
                {o.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  track: { flexDirection: "row", borderRadius: 18, padding: 4, gap: 4 },
  option: { flex: 1, minHeight: 48, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 6 },
  selected: { shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  check: { flexShrink: 0 },
  optionLabel: { textAlign: "center", flexShrink: 1 },
});
