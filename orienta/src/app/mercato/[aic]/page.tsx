import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MedicineDetail } from "@/components/medicines/medicine-detail";
import { euBrandsFor } from "@/lib/medicines/eu-brands-data";
import type { FormFamily } from "@/lib/medicines/forms";
import { ingredientInfo } from "@/lib/medicines/ingredients";
import { brandsOf, catalogInfo, equivalentsOf, getMedicine, prerenderedAics } from "@/lib/medicines/queries";

type Params = PageProps<"/mercato/[aic]">["params"];

/** Le schede si generano in anticipo per il campione (o per le prime del catalogo completo); le altre alla prima visita */
export function generateStaticParams() {
  return prerenderedAics(60).map((aic) => ({ aic }));
}

export async function generateMetadata({ params }: PageProps<"/mercato/[aic]">): Promise<Metadata> {
  const { aic } = await params;
  const m = getMedicine(aic);
  if (!m) return { title: "Farmaco non trovato", robots: { index: false } };
  return { title: m.name, description: `${m.activeIngredient}, ${m.description}. Dati AIFA.` };
}

export default function MedicinePage({ params }: PageProps<"/mercato/[aic]">) {
  return (
    <Suspense fallback={<MedicineSkeleton />}>
      <MedicineContent params={params} />
    </Suspense>
  );
}

async function MedicineContent({ params }: { params: Params }) {
  const { aic } = await params;
  const medicine = getMedicine(aic);
  if (!medicine) notFound();
  return (
    <MedicineDetail
      medicine={medicine}
      equivalents={equivalentsOf(medicine)}
      info={catalogInfo()}
      ingredient={ingredientInfo(medicine.ingredientKey)}
      brands={brandsOf(medicine)}
      europe={euBrandsFor(medicine.ingredientKey, medicine.formFamily as FormFamily)}
    />
  );
}

function MedicineSkeleton() {
  return (
    <div aria-hidden className="animate-pulse space-y-6">
      <div className="h-6 w-28 rounded-full bg-surface-2" />
      <div className="flex gap-4">
        <div className="size-32 rounded-3xl bg-surface-2" />
        <div className="flex-1 space-y-2 pt-2">
          <div className="h-4 w-1/2 rounded-full bg-surface-2" />
          <div className="h-8 w-3/4 rounded-full bg-surface-2" />
          <div className="h-4 w-full rounded-full bg-surface-2" />
        </div>
      </div>
      <div className="h-32 rounded-3xl bg-surface-2" />
      <p className="sr-only">Caricamento della scheda…</p>
    </div>
  );
}
