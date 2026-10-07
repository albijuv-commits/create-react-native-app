import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Marchio obbligatorio per i dati fittizi. È l'unica etichetta in maiuscolo dell'app:
 * deve saltare all'occhio.
 */
export function SampleDataBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border-2 border-dashed border-amber bg-amber-soft",
        "px-2 py-0.5 text-small font-bold tracking-wide text-amber",
        className,
      )}
    >
      <FlaskConical aria-hidden className="size-4" />
      DATI DI ESEMPIO
    </span>
  );
}
