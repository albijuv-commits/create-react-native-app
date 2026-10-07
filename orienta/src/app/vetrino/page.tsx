import type { Metadata } from "next";
import { CONDITIONS } from "@data/conditions";
import { PageHeader } from "@/components/ui/page-header";
import { SceneGallery } from "./scene-gallery";

export const metadata: Metadata = {
  title: "Galleria del vetrino",
  robots: { index: false },
};

/** Pagina di servizio per revisori e sviluppatori: tutte le scene, passo per passo. */
export default function VetrinoPage() {
  const items = CONDITIONS.map((c) => ({ id: c.id, name: c.name, spec: c.animation }));
  return (
    <>
      <PageHeader title="Galleria del vetrino" lead="Tutte le scene animate delle schede, passo per passo, per la revisione." />
      <SceneGallery items={items} />
    </>
  );
}
