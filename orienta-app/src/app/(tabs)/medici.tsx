import medici from "@/assets/illustrations/sezione-medici.webp";
import { ComingSoon } from "~/components/coming-soon";
import { PageHeader, Screen } from "~/components/ui/layout";

export default function MediciScreen() {
  return (
    <Screen>
      <PageHeader title="Medici" lead="Trova professionisti vicino a te e contattali con un tocco." illustration={medici} />
      <ComingSoon
        phase={4}
        items={[
          "Ricerca con la tua posizione, con il tuo permesso, oppure per città o CAP",
          "Lista e mappa, con la distanza da te",
          "Chiama, scrivi un'email con il riepilogo dei sintomi, apri le indicazioni",
        ]}
      />
    </Screen>
  );
}
