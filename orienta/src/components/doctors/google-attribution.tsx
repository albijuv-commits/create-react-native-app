import { Roboto } from "next/font/google";
import { cn } from "@/lib/cn";

/* Le regole di attribuzione di Google chiedono «Google Maps» in Roboto 400, mai tradotto né a capo */
const roboto = Roboto({ weight: "400", subsets: ["latin"], display: "swap", preload: false });

export function GoogleMapsAttribution({ className }: { className?: string }) {
  return (
    <span translate="no" className={cn(roboto.className, "whitespace-nowrap text-[14px] leading-none text-[#5E5E5E] dark:text-white", className)}>
      Google Maps
    </span>
  );
}
