// Genera le mappe delle illustrazioni a partire dai file in src/assets/illustrations.
// Uso: node scripts/gen-illustration-maps.mjs (dopo aver aggiunto o tolto un'illustrazione)
import { readdirSync, writeFileSync } from "node:fs";

const DIR = "src/assets/illustrations";
const files = readdirSync(DIR).filter((f) => f.endsWith(".webp")).sort();

function write({ prefix, out, ident, doc, typeImport, recordType }) {
  const ids = files.filter((f) => f.startsWith(prefix)).map((f) => f.slice(prefix.length, -".webp".length));
  const lines = [
    "// File generato da scripts/gen-illustration-maps.mjs: non modificarlo a mano.",
    'import type { StaticImageData } from "next/image";',
    ...(typeImport ? [typeImport] : []),
    ...ids.map((id) => `import ${ident}${id.replace(/-/g, "_")} from "@/assets/illustrations/${prefix}${id}.webp";`),
    "",
    `/** ${doc} */`,
    `export const ${recordType.name}: ${recordType.type} = {`,
    ...ids.map((id) => `  ${JSON.stringify(id)}: ${ident}${id.replace(/-/g, "_")},`),
    "};",
    "",
  ];
  writeFileSync(out, lines.join("\n"));
  console.log(`${out}: ${ids.length}`);
}

write({
  prefix: "condizione-",
  out: "src/lib/illustrations/conditions.ts",
  ident: "c_",
  doc: "L'illustrazione di ogni condizione (stile argilla, generata e poi controllata a mano)",
  recordType: { name: "CONDITION_ILLUSTRATIONS", type: "Readonly<Record<string, StaticImageData>>" },
});
write({
  prefix: "specialista-",
  out: "src/lib/illustrations/specialists.ts",
  ident: "s_",
  doc: "L'illustrazione di ogni professionista di riferimento",
  typeImport: 'import type { SpecialtyId } from "@data/vocab/specialties";',
  recordType: { name: "SPECIALIST_ILLUSTRATIONS", type: "Readonly<Partial<Record<SpecialtyId, StaticImageData>>>" },
});
