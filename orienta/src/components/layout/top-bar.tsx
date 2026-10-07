import Link from "next/link";
import { Siren } from "lucide-react";
import { BrandMark } from "./brand-mark";

/** Barra superiore: il pulsante Emergenza è sempre visibile, su ogni schermata. */
export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link href="/" className="flex min-h-11 items-center gap-2 font-bold text-primary" aria-label="Orienta, vai alla home">
          <BrandMark className="size-7" />
          <span className="text-heading">Orienta</span>
        </Link>
        <Link
          href="/emergenza"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-red px-4 font-bold text-on-red hover:brightness-110"
        >
          <Siren aria-hidden className="size-5" />
          Emergenza
        </Link>
      </div>
    </header>
  );
}
