import type { Metadata } from "next";
import { ComparePanel } from "@/components/medicines/compare-panel";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Confronto dei farmaci", robots: { index: false } };

export default function ConfrontoPage() {
  return (
    <>
      <PageHeader title="Confronto" lead="Fino a tre confezioni affiancate: prezzo, dosaggio, forma e regime di fornitura." />
      <ComparePanel />
    </>
  );
}
