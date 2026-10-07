import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Orienta: capire i sintomi, trovare il medico",
    short_name: "Orienta",
    description: "Ti aiuta a capire i tuoi sintomi e a trovare il professionista giusto. Non sostituisce un medico.",
    lang: "it",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f8fb",
    theme_color: "#3b2c85",
    categories: ["health", "medical"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Emergenza", url: "/emergenza", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Trova un medico", url: "/medici", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
