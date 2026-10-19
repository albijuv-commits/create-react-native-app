// Genera src/lib/illustrations.ts: le illustrazioni della web app (orienta/src/assets/illustrations)
// per condizioni, specialisti e aree del corpo, come riferimenti di Metro da passare a expo-image.
// Uso: node scripts/gen-illustrations.mjs (dopo aver aggiunto o tolto un'illustrazione nella web app)
import { readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DIR = fileURLToPath(new URL("../../orienta/src/assets/illustrations", import.meta.url));
const OUT = fileURLToPath(new URL("../src/lib/illustrations.ts", import.meta.url));
const files = readdirSync(DIR).filter((f) => f.endsWith(".webp")).sort();

const lines = [
  "// File generato da scripts/gen-illustrations.mjs: non modificarlo a mano.",
  'import type { BodyAreaId } from "@data/vocab/body";',
  'import type { SpecialtyId } from "@data/vocab/specialties";',
];
const maps = [];

function map({ prefix, ident, name, type, doc }) {
  const ids = files.filter((f) => f.startsWith(prefix)).map((f) => f.slice(prefix.length, -".webp".length));
  for (const id of ids) lines.push(`import ${ident}${id.replace(/-/g, "_")} from "@/assets/illustrations/${prefix}${id}.webp";`);
  maps.push("", `/** ${doc} */`, `export const ${name}: ${type} = {`, ...ids.map((id) => `  ${JSON.stringify(id)}: ${ident}${id.replace(/-/g, "_")},`), "};");
  return ids.length;
}

const counts = [
  map({ prefix: "condizione-", ident: "c_", name: "CONDITION_ILLUSTRATIONS", type: "Readonly<Record<string, number>>", doc: "L'illustrazione di ogni condizione" }),
  map({ prefix: "specialista-", ident: "s_", name: "SPECIALIST_ILLUSTRATIONS", type: "Readonly<Partial<Record<SpecialtyId, number>>>", doc: "L'illustrazione di ogni professionista di riferimento" }),
  map({ prefix: "area-", ident: "a_", name: "AREA_ILLUSTRATIONS", type: "Readonly<Record<BodyAreaId, number>>", doc: "L'illustrazione di ogni area del corpo, per i riquadri del filtro" }),
];
writeFileSync(OUT, [...lines, ...maps, ""].join("\n"));
console.log(`${OUT}: ${counts.join(" + ")}`);
