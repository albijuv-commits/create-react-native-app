import mercato from "@/assets/illustrations/sezione-mercato.webp";
import { ComingSoon } from "~/components/coming-soon";
import { PageHeader, Screen } from "~/components/ui/layout";

export default function MercatoScreen() {
  return (
    <Screen>
      <PageHeader title="Mercato" lead="Catalogo informativo dei medicinali: prezzi, regime di fornitura ed equivalenti." illustration={mercato} />
      <ComingSoon
        phase={5}
        items={[
          "Catalogo dai dati AIFA, con «Con ricetta» o «Senza ricetta» sempre in chiaro",
          "Marchi, aziende e fascia di prezzo per ogni principio attivo",
          "Preferiti e confronto salvati sul telefono",
        ]}
      />
    </Screen>
  );
}
