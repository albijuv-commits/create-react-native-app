import type { Metadata } from "next";
import { Suspense } from "react";
import mercato from "@/assets/illustrations/sezione-mercato.webp";
import { MedicineCatalog } from "@/components/medicines/catalog";
import { CatalogSourceLine, ExampleDataLabel } from "@/components/medicines/catalog-info";
import { CatalogNotice } from "@/components/medicines/notices";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Mercato" };

export default function MercatoPage() {
  return (
    <>
      <PageHeader title="Mercato" lead="Catalogo informativo dei medicinali: prezzi, regime di fornitura ed equivalenti." illustration={mercato} />
      <div className="space-y-6">
        <Suspense fallback={null}>
          <ExampleDataLabel />
        </Suspense>
        <CatalogNotice />
        <MedicineCatalog />
        <Suspense fallback={null}>
          <CatalogSourceLine />
        </Suspense>
      </div>
    </>
  );
}
