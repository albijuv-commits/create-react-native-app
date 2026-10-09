import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import condizioni from "@/assets/illustrations/sezione-condizioni.webp";
import { BODY_AREAS, type BodyAreaId } from "@data/vocab/body";
import { conditionListItems } from "@/lib/conditions/knowledge-base";
import { ConditionList } from "~/components/conditions/condition-list";
import { PageHeader } from "~/components/ui/layout";
import { Txt } from "~/components/ui/text";

const ITEMS = conditionListItems();

export default function CondizioniScreen() {
  // Ricerca e area stanno nei parametri della schermata: un link può aprire l'elenco già filtrato
  const params = useLocalSearchParams<{ q?: string; area?: string }>();
  const query = params.q ?? "";
  const area = BODY_AREAS.find((a) => a.id === params.area)?.id ?? null;
  return (
    <ConditionList
      items={ITEMS}
      query={query}
      area={area}
      onQuery={(q) => router.setParams({ q: q || undefined })}
      onArea={(a: BodyAreaId | null) => router.setParams({ area: a ?? undefined })}
      header={
        <PageHeader
          title="Condizioni"
          lead="Cause, sintomi, cure e quando andare dal medico, con un'animazione al microscopio per capire cosa succede nel corpo."
          illustration={condizioni}
        />
      }
      footer={
        <Txt variant="small" tone="inkMuted" style={styles.footer}>
          Le schede sono informative: non sostituiscono il parere di un medico o di un farmacista.
        </Txt>
      }
    />
  );
}

const styles = StyleSheet.create({
  footer: { paddingTop: 32 },
});
