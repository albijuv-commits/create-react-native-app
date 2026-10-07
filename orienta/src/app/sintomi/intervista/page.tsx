import type { Metadata } from "next";
import { Interview } from "@/components/triage/interview";
import { interviewConditions } from "@/lib/conditions/catalog";

export const metadata: Metadata = {
  title: "Intervista sui sintomi",
  // Pagina con dati sanitari: niente indicizzazione
  robots: { index: false, follow: false },
};

export default function IntervistaPage() {
  return <Interview conditions={interviewConditions()} />;
}
