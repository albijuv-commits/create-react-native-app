import type { Metadata } from "next";
import offline from "@/assets/illustrations/stato-offline.webp";
import { ButtonAnchor } from "@/components/ui/button";
import { TiltIllustration } from "@/components/ui/tilt-illustration";

export const metadata: Metadata = { title: "Sei offline" };

export default function OfflinePage() {
  return (
    <div className="space-y-4 pt-6 text-center">
      <TiltIllustration src={offline} sizes="176px" priority className="mx-auto w-44" />
      <h1 className="text-title font-bold">Sei offline</h1>
      <p className="text-ink-muted">Questa pagina richiede la connessione. In caso di emergenza puoi sempre chiamare.</p>
      <ButtonAnchor href="tel:112" variant="danger" size="lg" className="w-full">
        Chiama il 112
      </ButtonAnchor>
    </div>
  );
}
