import { ArrowLeftRight, Heart } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";
import { Txt } from "~/components/ui/text";
import { useMedicineList } from "~/lib/medicine-lists";
import { useTheme } from "~/theme/theme";

function ToggleButton({
  on,
  label,
  onLabel,
  offLabel,
  compact,
  disabled,
  tone,
  icon,
  onPress,
}: {
  on: boolean;
  label: string;
  onLabel: string;
  offLabel: string;
  compact: boolean;
  disabled: boolean;
  tone: "accent" | "primary";
  icon: "heart" | "compare";
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const fg = on ? colors[tone] : colors.inkMuted;
  const Icon = icon === "heart" ? Heart : ArrowLeftRight;
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: on, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: on ? colors[tone] : colors.line,
          backgroundColor: on ? (tone === "accent" ? colors.accentSoft : colors.primarySoft) : colors.surface,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
        },
      ]}
    >
      <Icon color={fg} fill={icon === "heart" && on ? fg : "none"} size={20} />
      {!compact && (
        <Txt variant="small" bold style={{ color: fg }}>
          {on ? onLabel : offLabel}
        </Txt>
      )}
    </Pressable>
  );
}

/** Preferito sì/no, salvato solo sul telefono */
export function FavoriteButton({ aic, name, compact = false }: { aic: string; name: string; compact?: boolean }) {
  const favorites = useMedicineList("preferiti");
  const on = favorites.has(aic);
  return (
    <ToggleButton
      on={on}
      label={`${on ? "Togli dai preferiti" : "Aggiungi ai preferiti"}: ${name}`}
      onLabel="Nei preferiti"
      offLabel="Preferito"
      compact={compact}
      disabled={!on && favorites.full}
      tone="accent"
      icon="heart"
      onPress={() => favorites.toggle(aic)}
    />
  );
}

/** Nel confronto sì/no: al massimo tre farmaci */
export function CompareButton({ aic, name, compact = false }: { aic: string; name: string; compact?: boolean }) {
  const compare = useMedicineList("confronto");
  const on = compare.has(aic);
  const full = !on && compare.full;
  return (
    <ToggleButton
      on={on}
      label={full ? `Confronto pieno (al massimo ${compare.max}): ${name}` : `${on ? "Togli dal confronto" : "Aggiungi al confronto"}: ${name}`}
      onLabel="Nel confronto"
      offLabel="Confronta"
      compact={compact}
      disabled={full}
      tone="primary"
      icon="compare"
      onPress={() => compare.toggle(aic)}
    />
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44, minWidth: 44, borderWidth: 2, borderRadius: 16, paddingHorizontal: 12 },
});
