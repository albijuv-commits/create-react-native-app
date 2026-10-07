// Genera le icone PWA da scripts/icon-source.svg. Uso: npm run icons
import { readFile, writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

const src = await readFile(new URL("./icon-source.svg", import.meta.url));
const out = new URL("../public/icons/", import.meta.url);
await mkdir(out, { recursive: true });

// Icona "any": angoli arrotondati per i launcher che non applicano una maschera
const rounded = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#fff"/></svg>',
);

async function png(size, { mask = false } = {}) {
  let img = sharp(src).resize(size, size);
  if (mask) img = img.composite([{ input: await sharp(rounded).resize(size, size).png().toBuffer(), blend: "dest-in" }]);
  return img.png().toBuffer();
}

await writeFile(new URL("icon-192.png", out), await png(192, { mask: true }));
await writeFile(new URL("icon-512.png", out), await png(512, { mask: true }));
// Maskable: fondo pieno fino ai bordi, il soggetto sta nella safe zone (80%)
await writeFile(new URL("maskable-512.png", out), await png(512));
// iOS applica i propri angoli: fondo pieno
await writeFile(new URL("apple-touch-icon.png", out), await png(180));
await writeFile(new URL("icon.svg", out), src);
console.log("Icone generate in public/icons/");
