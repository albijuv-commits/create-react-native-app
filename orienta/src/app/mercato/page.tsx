import type { Metadata } from "next";
import mercato from "@/assets/illustrations/sezione-mercato.webp";
import confronto from "@/assets/illustrations/stato-confronto.webp";
import { ComingSoon } from "@/components/ui/coming-soon";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Mercato" };

export default function MercatoPage() {
  return (
    <>
      <PageHeader title="Mercato" lead="Catalogo informativo dei medicinali: prezzi, regime di fornitura ed equivalenti." illustration={mercato} />
      <ComingSoon phase={5} illustration={confronto}>Dati Open Data AIFA, filtri, scheda dettaglio, confronto e preferiti.</ComingSoon>
    </>
  );
}
