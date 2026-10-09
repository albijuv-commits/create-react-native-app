"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();
  const reduce = usePrefersReducedMotion();

  return (
    <nav
      aria-label="Sezioni principali"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 text-[0.8125rem]",
                  active ? "font-bold text-primary" : "text-ink-muted",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    aria-hidden
                    className="absolute inset-x-3 top-0 h-1 rounded-b-full bg-accent"
                    transition={reduce ? { duration: 0 } : { duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  />
                )}
                <Icon aria-hidden className="size-6" strokeWidth={active ? 2.4 : 1.8} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
