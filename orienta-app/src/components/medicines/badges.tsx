import { BadgeCheck, FileText, Hospital, ShieldCheck, Stethoscope, type LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { supplyBadge, SUPPLY_BADGE_LABEL, type SupplyBadge as Badge, type SupplyCode } from "@/lib/medicines/regime";
import { Txt } from "~/components/ui/text";
import type { Palette } from "~/theme/colors";
import { useTheme } from "~/theme/theme";

const STYLE: Record<Badge, { bg: keyof Palette; fg: keyof Palette; icon: LucideIcon }> = {
  // Il verde è riservato a «Senza ricetta»
  "senza-ricetta": { bg: "otcSoft", fg: "otc", icon: BadgeCheck },
  "con-ricetta": { bg: "primarySoft", fg: "primary", icon: FileText },
  ospedaliero: { bg: "surface2", fg: "ink", icon: Hospital },
  specialista: { bg: "surface2", fg: "ink", icon: Stethoscope },
  "non-indicato": { bg: "surface2", fg: "inkMuted", icon: FileText },
};

function Pill({ bg, fg, icon: Icon, label }: { bg: keyof Palette; fg: keyof Palette; icon: LucideIcon; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: colors[bg] }]}>
      <Icon color={colors[fg]} size={16} />
      <Txt variant="small" bold tone={fg}>
        {label}
      </Txt>
    </View>
  );
}

/** Il regime di fornitura con colore, icona e testo: mai solo il colore */
export function SupplyBadge({ code }: { code: SupplyCode | null }) {
  const badge = supplyBadge(code);
  return <Pill {...STYLE[badge]} label={SUPPLY_BADGE_LABEL[badge]} />;
}

/** Classe A: il Servizio sanitario nazionale lo rimborsa */
export function ReimbursableBadge() {
  return <Pill bg="accentSoft" fg="accent" icon={ShieldCheck} label="Rimborsabile SSN" />;
}

const styles = StyleSheet.create({
  pill: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
});
