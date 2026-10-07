import type { Metadata } from "next";
import mercato from "@/assets/illustrations/sezione-mercato.webp";
import { MedicineCatalog } from "@/components/medicines/catalog";
import { CatalogNotice, CatalogSource, ExampleDataNotice } from "@/components/medicines/notices";
import { PageHeader } from "@/components/ui/page-header";
import { catalogInfo } from "@/lib/medicines/queries";

export const metadata: Metadata = { title: "Mercato" };

export default function MercatoPage() {
  const info = catalogInfo();
  return (
    <>
      <PageHeader title="Mercato" lead="Catalogo informativo dei medicinali: prezzi, regime di fornitura ed equivalenti." illustration={mercato} />
      <div className="space-y-6">
        {info.source === "esempio" && <ExampleDataNotice count={info.count} />}
        <CatalogNotice />
        <MedicineCatalog />
        <CatalogSource info={info} />
      </div>
    </>
  );
}
