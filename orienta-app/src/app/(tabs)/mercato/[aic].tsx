import { Stack, useLocalSearchParams } from "expo-router";
import { RotateCcw } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { CatalogRequestError } from "@/lib/medicines/client";
import type { MedicineDetailResponse } from "@/lib/medicines/types";
import { MedicineDetail } from "~/components/medicines/medicine-detail";
import { Button } from "~/components/ui/button";
import { Txt } from "~/components/ui/text";
import { medicineDetail } from "~/lib/catalog";
import { sampleAics } from "~/lib/catalog-sample";
import { useTheme } from "~/theme/theme";

/** Sul web si generano durante l'esportazione le schede del campione di esempio */
export async function generateStaticParams(): Promise<{ aic: string }[]> {
  return sampleAics().map((aic) => ({ aic }));
}

type Loaded = { key: string; data?: MedicineDetailResponse; error?: string };

/** La scheda di una confezione: si apre dal catalogo, dai preferiti, dal confronto e dagli equivalenti */
export default function MedicineScreen() {
  const { colors } = useTheme();
  const { aic = "" } = useLocalSearchParams<{ aic: string }>();
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const key = `${aic}|${attempt}`;

  useEffect(() => {
    const c = new AbortController();
    medicineDetail(aic, c.signal).then(
      (data) => {
        if (!c.signal.aborted) setLoaded({ key, data });
      },
      (e: unknown) => {
        if (!c.signal.aborted) setLoaded({ key, error: e instanceof CatalogRequestError ? e.message : "La scheda non è disponibile in questo momento." });
      },
    );
    return () => c.abort();
  }, [aic, key]);

  const current = loaded?.key === key ? loaded : null;
  if (current?.data) {
    return (
      <>
        <Stack.Screen options={{ title: current.data.medicine.name }} />
        <MedicineDetail data={current.data} />
      </>
    );
  }
  return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}>
      {current?.error ? (
        <>
          <Stack.Screen options={{ title: "Scheda non disponibile" }} />
          <View accessibilityRole="alert" style={styles.gap}>
            <Txt variant="title" header>
              Non riusciamo a mostrare questa scheda
            </Txt>
            <Txt tone="inkMuted">{current.error}</Txt>
          </View>
          <Button label="Riprova" icon={RotateCcw} variant="secondary" onPress={() => setAttempt((n) => n + 1)} />
        </>
      ) : (
        <View accessibilityLiveRegion="polite" style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Txt bold>Carico la scheda…</Txt>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, padding: 24, gap: 16, justifyContent: "center" },
  gap: { gap: 8 },
  loading: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
});
