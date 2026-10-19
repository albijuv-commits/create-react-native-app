import { Image } from "expo-image";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import confronto from "@/assets/illustrations/stato-confronto.webp";
import { CatalogRequestError } from "@/lib/medicines/client";
import { FORM_FAMILY_LABEL } from "@/lib/medicines/forms";
import { supplyBadge, SUPPLY_BADGE_LABEL } from "@/lib/medicines/regime";
import { displayCompany, formatEuro, formatItalianDay } from "@/lib/medicines/text";
import { isIndicativePrice, type MedicineSummary } from "@/lib/medicines/types";
import { Button } from "~/components/ui/button";
import { Txt } from "~/components/ui/text";
import { medicinesByAic } from "~/lib/catalog";
import { useMedicineList } from "~/lib/medicine-lists";
import { useTheme } from "~/theme/theme";
import { ReimbursableBadge, SupplyBadge } from "./badges";
import { openMedicine } from "./brands-disclosure";
import { MedicineImage } from "./medicine-image";

type Row = { label: string; cell: (m: MedicineSummary) => ReactNode; spoken: (m: MedicineSummary) => string };

/** Torna al catalogo che sta sotto nella pila, senza aprirne un altro */
const toCatalog = () => router.dismissTo("/mercato");

/**
 * Il confronto: fino a tre confezioni scelte dal catalogo, affiancate. Su un telefono la tabella
 * della web app diventa una riga per voce, con l'etichetta sopra e le confezioni in colonna, così
 * non serve scorrere di lato. L'elenco resta sul telefono; al servizio arrivano solo i codici AIC.
 */
export function ComparePanel() {
  const { colors } = useTheme();
  const compare = useMedicineList("confronto");
  const list = compare.list;
  const listKey = list.join(",");
  const [state, setState] = useState<{ key: string; items?: MedicineSummary[]; error?: string } | null>(null);

  useEffect(() => {
    if (!list.length) return;
    const c = new AbortController();
    medicinesByAic(list, c.signal).then(
      (items) => {
        if (!c.signal.aborted) setState({ key: list.join(","), items });
      },
      (e: unknown) => {
        if (!c.signal.aborted) setState({ key: list.join(","), error: e instanceof CatalogRequestError ? e.message : "Il catalogo non è disponibile." });
      },
    );
    return () => c.abort();
  }, [list]);

  if (!list.length) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.surface2 }]}>
        <Image source={confronto} style={styles.emptyArt} contentFit="contain" accessible={false} />
        <View style={styles.emptyText}>
          <Txt bold>Non hai ancora scelto farmaci da confrontare.</Txt>
          <Txt variant="small" tone="inkMuted">
            Nel catalogo tocca il pulsante del confronto su una confezione, fino a {compare.max}.
          </Txt>
          <Button label="Vai al catalogo" variant="secondary" onPress={toCatalog} />
        </View>
      </View>
    );
  }

  const current = state?.key === listKey ? state : null;
  if (!current) {
    return (
      <View accessibilityLiveRegion="polite" style={styles.status}>
        <ActivityIndicator color={colors.primary} />
        <Txt bold>Preparo il confronto…</Txt>
      </View>
    );
  }
  if (current.error || !current.items) {
    return (
      <View accessibilityRole="alert" style={[styles.error, { backgroundColor: colors.redSoft }]}>
        <Txt bold tone="red">
          {current.error ?? "Il catalogo non è disponibile."}
        </Txt>
      </View>
    );
  }

  const items = current.items;
  const lowest = Math.min(...items.map((m) => m.price ?? Infinity));
  const isLowest = (m: MedicineSummary) => m.price === lowest && items.filter((x) => x.price !== null).length > 1;
  const rows: Row[] = [
    {
      label: "Prezzo",
      cell: (m) =>
        m.price === null ? (
          <Txt variant="small" tone="inkMuted">
            Non presente nelle liste AIFA
          </Txt>
        ) : (
          <View style={styles.cellStack}>
            <Txt bold style={styles.tabular}>
              {formatEuro(m.price)}
            </Txt>
            {isIndicativePrice(m) && (
              <Txt variant="small" bold tone="amber">
                prezzo indicativo
              </Txt>
            )}
            {isLowest(m) && (
              <Txt variant="small" bold tone="accent">
                Il più basso tra questi
              </Txt>
            )}
            {m.priceDate && (
              <Txt variant="small" tone="inkMuted">
                al {formatItalianDay(m.priceDate)}
              </Txt>
            )}
          </View>
        ),
      spoken: (m) =>
        m.price === null
          ? "non presente nelle liste AIFA"
          : [
              formatEuro(m.price),
              isIndicativePrice(m) && "prezzo indicativo",
              isLowest(m) && "il più basso tra questi",
              m.priceDate && `al ${formatItalianDay(m.priceDate)}`,
            ]
              .filter(Boolean)
              .join(", "),
    },
    {
      label: "Prezzo a unità",
      cell: (m) =>
        m.price !== null && m.units ? (
          <Txt style={styles.tabular}>{formatEuro(m.price / m.units)}</Txt>
        ) : (
          <Txt tone="inkMuted" aria-hidden>
            —
          </Txt>
        ),
      spoken: (m) => (m.price !== null && m.units ? formatEuro(m.price / m.units) : "non indicato"),
    },
    { label: "Principio attivo", cell: (m) => <Txt variant="small">{m.activeIngredient}</Txt>, spoken: (m) => m.activeIngredient },
    { label: "Dosaggio e confezione", cell: (m) => <Txt variant="small">{m.description}</Txt>, spoken: (m) => m.description },
    {
      label: "Forma",
      cell: (m) => <Txt variant="small">{`${m.form} (${FORM_FAMILY_LABEL[m.formFamily].toLowerCase()})`}</Txt>,
      spoken: (m) => `${m.form} (${FORM_FAMILY_LABEL[m.formFamily].toLowerCase()})`,
    },
    { label: "Ricetta", cell: (m) => <SupplyBadge code={m.supplyCode} />, spoken: (m) => SUPPLY_BADGE_LABEL[supplyBadge(m.supplyCode)] },
    {
      label: "Rimborsabile SSN",
      cell: (m) =>
        m.reimbursementClass === "A" ? (
          <ReimbursableBadge />
        ) : (
          <Txt variant="small" tone="inkMuted">
            No
          </Txt>
        ),
      spoken: (m) => (m.reimbursementClass === "A" ? "sì" : "no"),
    },
    { label: "Titolare", cell: (m) => <Txt variant="small">{displayCompany(m.company)}</Txt>, spoken: (m) => displayCompany(m.company) },
  ];

  return (
    <View style={styles.wrap}>
      <View accessibilityLabel={`Confronto tra ${items.length} confezioni`} style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <View style={styles.columns}>
          {items.map((m) => (
            <View key={m.aic} style={[styles.head, { backgroundColor: colors.surface2 }]}>
              <View style={styles.headTop}>
                <MedicineImage medicine={m} size={56} />
                <Pressable role="button" accessibilityLabel={`Togli ${m.name} dal confronto`} onPress={() => compare.remove(m.aic)} style={styles.remove}>
                  <X color={colors.inkMuted} size={20} />
                </Pressable>
              </View>
              <Txt bold tone="primary" role="link" accessibilityHint="Apre la scheda" onPress={() => openMedicine(m.aic)} style={styles.link}>
                {m.name}
              </Txt>
            </View>
          ))}
        </View>
        {rows.map((row) => (
          <View key={row.label} style={[styles.row, { borderTopColor: colors.line }]}>
            <Txt variant="small" bold tone="inkMuted" header>
              {row.label}
            </Txt>
            <View style={styles.columns}>
              {items.map((m) => (
                <View key={m.aic} accessible accessibilityLabel={`${m.name}: ${row.spoken(m)}`} style={styles.cell}>
                  {row.cell(m)}
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.actions}>
        <Button label="Aggiungi dal catalogo" variant="secondary" onPress={toCatalog} />
        <Button label="Svuota il confronto" variant="ghost" onPress={compare.clear} />
      </View>
      <Txt variant="small" tone="inkMuted">
        Per scegliere un farmaco chiedi consiglio al medico o al farmacista.
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  empty: { flexDirection: "row", alignItems: "center", gap: 16, borderRadius: 24, padding: 20 },
  emptyArt: { width: 96, height: 96 },
  emptyText: { flex: 1, gap: 8, alignItems: "flex-start" },
  status: { flexDirection: "row", alignItems: "center", gap: 8 },
  error: { borderRadius: 24, padding: 16 },
  table: { borderWidth: 1, borderRadius: 24, padding: 12, gap: 0 },
  columns: { flexDirection: "row", gap: 8 },
  head: { flex: 1, gap: 6, borderRadius: 18, padding: 10, marginBottom: 12 },
  headTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  remove: { width: 44, height: 44, marginTop: -8, marginRight: -8, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  row: { gap: 6, borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 12 },
  cell: { flex: 1, minWidth: 0 },
  cellStack: { gap: 2 },
  tabular: { fontVariant: ["tabular-nums"] },
  link: { textDecorationLine: "underline" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
