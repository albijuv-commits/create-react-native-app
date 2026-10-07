import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SkipLink } from "@/components/layout/skip-link";
import { TopBar } from "@/components/layout/top-bar";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { PREFS_BOOT_SCRIPT } from "@/lib/prefs/prefs";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  // Indirizzo pubblico dell'app, per i link assoluti delle anteprime di condivisione
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Orienta", template: "%s · Orienta" },
  description:
    "Orienta ti aiuta a capire i tuoi sintomi e a trovare il professionista giusto. Non sostituisce un medico.",
  applicationName: "Orienta",
  appleWebApp: { capable: true, title: "Orienta", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#12121f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={atkinson.variable} suppressHydrationWarning>
      <head>
        {/* Applica tema e dimensione del testo prima del primo paint */}
        <script dangerouslySetInnerHTML={{ __html: PREFS_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-dvh antialiased">
        <SkipLink />
        <TopBar />
        <main id="contenuto" className="mx-auto w-full max-w-lg px-4 pb-28 pt-4">
          {children}
        </main>
        <BottomNav />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
