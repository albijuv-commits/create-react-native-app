import { cn } from "@/lib/cn";
import { formatEuro, formatItalianDay } from "@/lib/medicines/text";
import { isIndicativePrice, type MedicineSummary } from "@/lib/medicines/types";

/**
 * Il prezzo con la sua data, sempre. Per i farmaci senza ricetta è «indicativo»: può cambiare da
 * farmacia a farmacia. Se le liste AIFA non lo riportano, lo si dice invece di inventarlo.
 */
export function Price({ medicine: m, size = "md", className }: { medicine: Pick<MedicineSummary, "price" | "priceDate" | "supplyCode" | "units">; size?: "md" | "lg"; className?: string }) {
  if (m.price === null) {
    return <p className={cn("text-small text-ink-muted", className)}>Prezzo non presente nelle liste AIFA</p>;
  }
  const indicative = isIndicativePrice(m);
  return (
    <div className={cn("space-y-0.5", className)}>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className={cn("font-bold tabular-nums text-ink", size === "lg" ? "text-title" : "text-heading")}>{formatEuro(m.price)}</span>
        {indicative && <span className="text-small font-bold text-amber">prezzo indicativo</span>}
      </p>
      <p className="text-[0.8125rem] text-ink-muted">
        {indicative ? "Può cambiare da farmacia a farmacia. " : "Prezzo al pubblico. "}
        {m.priceDate && <>Dati AIFA al {formatItalianDay(m.priceDate)}.</>}
        {m.units && m.units > 1 && <> Circa {formatEuro(m.price / m.units)} a unità.</>}
      </p>
    </div>
  );
}
