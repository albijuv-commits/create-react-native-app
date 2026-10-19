import { Stack, router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { conditionIds, getCondition } from "@/lib/conditions/knowledge-base";
import { Button } from "~/components/ui/button";
import { Txt } from "~/components/ui/text";
import { ConditionArticle } from "./condition-article";

/** Sul web le schede vengono generate tutte durante l'esportazione */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return conditionIds().map((id) => ({ id }));
}

/**
 * La scheda di una condizione. Si apre dall'elenco delle Condizioni e anche dai Risultati
 * dell'intervista: lì resta nella pila di Sintomi, così «Indietro» riporta ai risultati.
 */
export function ConditionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const condition = getCondition(id);
  if (!condition) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: "Scheda non trovata" }} />
        <Txt variant="title" header>
          Questa scheda non esiste
        </Txt>
        <Txt tone="inkMuted">Forse il link è sbagliato o la scheda è stata tolta.</Txt>
        <Button label="Tutte le condizioni" onPress={() => router.navigate("/condizioni")} />
      </View>
    );
  }
  return (
    <>
      <Stack.Screen options={{ title: condition.name }} />
      <ConditionArticle condition={condition} />
    </>
  );
}

const styles = StyleSheet.create({
  missing: { flex: 1, padding: 24, gap: 16, justifyContent: "center" },
});
