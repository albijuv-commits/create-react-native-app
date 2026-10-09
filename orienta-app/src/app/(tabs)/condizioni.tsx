import condizioni from "@/assets/illustrations/sezione-condizioni.webp";
import { CONDITIONS } from "@data/conditions";
import { ComingSoon } from "~/components/coming-soon";
import { PageHeader, Screen } from "~/components/ui/layout";

export default function CondizioniScreen() {
  return (
    <Screen>
      <PageHeader title="Condizioni" lead={`${CONDITIONS.length} schede scritte da fonti autorevoli, con un'animazione al microscopio.`} illustration={condizioni} />
      <ComingSoon
        phase={2}
        items={[
          "Ricerca e filtro per area del corpo",
          "Le schede: storia, casi, cause, cure possibili e quando sentire il medico",
          "Il vetrino animato, passo per passo, con play, pausa e avanti",
        ]}
      />
    </Screen>
  );
}
