import nonTrovata from "@/assets/illustrations/stato-404.webp";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function NotFound() {
  return (
    <>
      <PageHeader title="Pagina non trovata" lead="Il link potrebbe essere sbagliato o la pagina non esiste più." illustration={nonTrovata} />
      <div className="grid gap-3">
        <ButtonLink href="/">Vai a Sintomi</ButtonLink>
        <ButtonLink href="/condizioni" variant="secondary">
          Sfoglia le condizioni
        </ButtonLink>
      </div>
    </>
  );
}
