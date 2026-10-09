// Genera le icone PWA. Uso: npm run icons
// - Icone raster: dall'illustrazione in argilla scripts/icon-source.webp (generata con Higgsfield, 1024 px)
// - Favicon vettoriale: il marchio piatto scripts/icon-source.svg
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const src = new URL("./icon-source.webp", import.meta.url);
const out = new URL("../public/icons/", import.meta.url);
await mkdir(out, { recursive: true });

// Icona "any": angoli arrotondati per i launcher che non applicano una maschera
const rounded = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#fff"/></svg>',
);

async function png(size, { mask = false } = {}) {
  let img = sharp(fileURLToPath(src)).resize(size, size, { kernel: "lanczos3" });
  if (mask) img = sharp(await img.ensureAlpha().composite([{ input: await sharp(rounded).resize(size, size).png().toBuffer(), blend: "dest-in" }]).png().toBuffer());
  return img.png({ palette: true, quality: 95, effort: 10, dither: 0.8, compressionLevel: 9 }).toBuffer();
}

await writeFile(new URL("icon-192.png", out), await png(192, { mask: true }));
await writeFile(new URL("icon-512.png", out), await png(512, { mask: true }));
// Maskable: fondo pieno fino ai bordi, il soggetto sta nella safe zone (80%)
await writeFile(new URL("maskable-512.png", out), await png(512));
// iOS applica i propri angoli: fondo pieno
await writeFile(new URL("apple-touch-icon.png", out), await png(180));
await copyFile(new URL("./icon-source.svg", import.meta.url), new URL("icon.svg", out));
console.log("Icone generate in public/icons/");
