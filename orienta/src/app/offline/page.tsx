import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { ButtonAnchor } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sei offline" };

export default function OfflinePage() {
  return (
    <div className="space-y-4 pt-6 text-center">
      <WifiOff aria-hidden className="mx-auto size-12 text-ink-muted" />
      <h1 className="text-title font-bold">Sei offline</h1>
      <p className="text-ink-muted">Questa pagina richiede la connessione. In caso di emergenza puoi sempre chiamare.</p>
      <ButtonAnchor href="tel:112" variant="danger" size="lg" className="w-full">
        Chiama il 112
      </ButtonAnchor>
    </div>
  );
}
