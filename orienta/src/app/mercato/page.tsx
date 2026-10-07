import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Mercato" };

export default function MercatoPage() {
  return (
    <>
      <PageHeader title="Mercato" lead="Catalogo informativo dei medicinali: prezzi, regime di fornitura ed equivalenti." />
      <ComingSoon phase={5}>Dati Open Data AIFA, filtri, scheda dettaglio, confronto e preferiti.</ComingSoon>
    </>
  );
}
