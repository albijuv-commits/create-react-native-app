import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import euBrands from "@data/medicines/eu-brands.json";
import seed from "@data/medicines/seed.json";
import { buildEuBrands, euBrandsFileSchema, isGenericName, genericStems, type EmaRow } from "@/lib/medicines/eu-brands";
import { emaSubstanceKey, ingredientKey } from "@/lib/medicines/ingredient-key";
import { formulaWithSubscripts, ingredientInfo, ingredientInfoSchema, ingredientSummary, INGREDIENTS } from "@/lib/medicines/ingredients";
import { applyPhotos, photoFor, photosFileSchema } from "@/lib/medicines/photos";
import { displayCompany, formatPriceRange } from "@/lib/medicines/text";
import { decodeXml, readXlsxRows } from "@/lib/medicines/xlsx";

describe("chiave del principio attivo", () => {
  it("toglie sali e idrati e unisce le diciture delle fonti AIFA", () => {
    expect(ingredientKey("Cetirizina dicloridrato")).toBe("cetirizina");
    expect(ingredientKey("Cetirizina")).toBe("cetirizina");
    expect(ingredientKey("ESOMEPRAZOLO MAGNESIO TRIIDRATO")).toBe("esomeprazolo");
    expect(ingredientKey("Atorvastatina calcio triidrato")).toBe("atorvastatina");
    expect(ingredientKey("Ketoprofene sale di lisina")).toBe("ketoprofene");
    expect(ingredientKey("Rosuvastatina sale di calcio")).toBe("rosuvastatina");
    expect(ingredientKey("ONDANSETRON CLORIDRATO DIIDRATO")).toBe("ondansetrone");
    expect(ingredientKey("NAPROXENE SODICO")).toBe("naprossene");
    expect(ingredientKey("N-ACETIL-L-CISTEINA")).toBe("acetilcisteina");
  });

  it("le associazioni diventano un elenco ordinato, senza doppioni né «n.d.»", () => {
    const k = "acido clavulanico + amoxicillina";
    expect(ingredientKey("Amoxicillina triidrato/potassio clavulanato")).toBe(k);
    expect(ingredientKey("Amoxicillina + Acido clavulanico")).toBe(k);
    expect(ingredientKey("ACIDO CLAVULANICO/AMOXICILLINA")).toBe(k);
    expect(ingredientKey("Codeina fosfato/codeina/paracetamolo")).toBe("codeina + paracetamolo");
    expect(ingredientKey("Ibuprofene/ibuprofene")).toBe("ibuprofene");
    expect(ingredientKey("ACETILCISTEINA/N.D.")).toBe("acetilcisteina");
  });

  it("sostanze diverse restano diverse; i composti come «calcio carbonato» restano interi", () => {
    expect(ingredientKey("Esomeprazolo")).not.toBe(ingredientKey("Omeprazolo"));
    expect(ingredientKey("Levocetirizina dicloridrato")).not.toBe(ingredientKey("Cetirizina dicloridrato"));
    expect(ingredientKey("Dexketoprofene trometamolo")).toBe("dexketoprofene");
    expect(ingredientKey("Calcio carbonato")).toBe("calcio carbonato");
    expect(ingredientKey("Sodio cloruro")).toBe("sodio cloruro");
    expect(ingredientKey("")).toBeNull();
  });

  it("le diciture inglesi dell'EMA hanno la stessa logica", () => {
    expect(emaSubstanceKey("Amoxicillin Trihydrate, Potassium Clavulanate")).toBe("amoxicillin + clavulanic acid");
    expect(emaSubstanceKey("Esomeprazole Magnesium Trihydrate")).toBe("esomeprazole");
    expect(emaSubstanceKey("Ketotifen Hydrogen Fumarate")).toBe("ketotifen");
    expect(emaSubstanceKey("Cholecalciferol")).toBe("colecalciferol");
    expect(emaSubstanceKey("Triamcinolone Acetonide")).toBe("triamcinolone acetonide");
    expect(emaSubstanceKey("Paracetamol | Caffeine")).toBe("caffeine + paracetamol");
  });
});

describe("schede dei principi attivi", () => {
  it("ogni scheda è valida, con fonti ufficiali (RCP dell'AIFA e PubChem) e senza dosi", () => {
    const keys = new Set<string>();
    for (const info of INGREDIENTS) {
      expect(ingredientInfoSchema.safeParse(info).success, info.key).toBe(true);
      expect(keys.has(info.key), info.key).toBe(false);
      keys.add(info.key);
      expect(info.sources.some((s) => s.url.startsWith("https://api.aifa.gov.it/") && s.url.endsWith("ts=RCP")), info.key).toBe(true);
      expect(info.sources.some((s) => s.url.startsWith("https://pubchem.ncbi.nlm.nih.gov/compound/")), info.key).toBe(true);
      for (const mol of info.molecules) expect(info.sources.some((s) => s.url.endsWith(`/${mol.pubchemCid}`)), `${info.key} CID ${mol.pubchemCid}`).toBe(true);
      // Nessuna posologia: niente «mg al giorno», «compresse al giorno», «ogni N ore»
      const text = [info.chemistry, info.action, ...info.sideEffects, info.caution ?? ""].join(" ");
      expect(text, info.key).not.toMatch(/\d+\s*(mg|g|compresse|gocce)\s*(al|ogni)\s*(giorno|ore)|ogni \d+ ore/i);
    }
  });

  it("la chiave di ogni scheda è quella che il catalogo calcola dalle diciture AIFA", () => {
    for (const info of INGREDIENTS) expect(ingredientKey(info.key), info.key).toBe(info.key);
    // Ogni principio attivo del campione di esempio ha la sua scheda
    for (const m of seed.medicines) expect(ingredientInfo(m.ingredientKey), m.activeIngredient).not.toBeNull();
  });

  it("riassunto per la card, formula con i pedici", () => {
    const amox = ingredientInfo("acido clavulanico + amoxicillina")!;
    expect(ingredientSummary(amox)).toMatch(/^L'amoxicillina è una penicillina/);
    expect(formulaWithSubscripts("C8H9NO2")).toBe("C₈H₉NO₂");
  });
});

describe("marchi europei (elenco EMA, Article 57)", () => {
  const info = { name: "Paracetamolo", ema: "paracetamol" };
  const rows: EmaRow[] = [
    { name: "Panadol", substance: "Paracetamol", route: "Oral Use", country: "Germany", holder: "Haleon" },
    { name: "Panadol Extra", substance: "Paracetamol", route: "Oral Use", country: "France", holder: "Haleon" },
    { name: "Paracetamol Krka", substance: "Paracetamol", route: "Oral Use", country: "Slovenia", holder: "Krka" },
    { name: "Kinderparacetamol", substance: "Paracetamol", route: "Rectal Use", country: "Netherlands", holder: "X" },
    { name: "Teva Fever", substance: "Paracetamol", route: "Oral Use", country: "Spain", holder: "Teva" },
    { name: "Парацетамол", substance: "Paracetamol", route: "Oral Use", country: "Bulgaria", holder: "Sopharma" },
    { name: "Dafalgan", substance: "Paracetamol", route: "Intravenous Use ,Oral Use", country: "Belgium", holder: "UPSA" },
    { name: "Grippostad C", substance: "Paracetamol, Ascorbic Acid", route: "Oral Use", country: "Germany", holder: "Stada" },
  ];

  it("tiene i nomi commerciali, scarta generici, nomi di aziende, alfabeti non latini e associazioni", () => {
    const r = buildEuBrands(rows, info);
    expect(r.brands.map((b) => b.name)).toEqual(["Panadol", "Dafalgan"]);
    expect(r.brands[0]).toMatchObject({ countries: ["Francia", "Germania"], routes: ["per bocca"] });
    expect(r.brands[1]!.routes).toEqual(["iniezione", "per bocca"]);
    expect(r.products).toBe(7);
    expect(isGenericName("Ibu-ratiopharm", genericStems({ name: "Ibuprofene", ema: "ibuprofen" }, ["ibu-"]))).toBe(true);
  });

  it("il file generato è valido e copre ogni scheda, senza email né telefoni", () => {
    const file = euBrandsFileSchema.parse(euBrands);
    expect(Object.keys(file.ingredients).sort()).toEqual(INGREDIENTS.map((i) => i.key).sort());
    const raw = JSON.stringify(euBrands);
    expect(raw).not.toMatch(/@[a-z0-9-]+\.[a-z]{2,}/i);
    expect(raw).not.toMatch(/\+\d{2}[\s\d]{6,}/);
    expect(file.ingredients.paracetamolo!.brands.some((b) => b.name === "Panadol")).toBe(true);
  });
});

describe("lettore .xlsx", () => {
  it("stringhe condivise e in linea, celle vuote, entità XML", () => {
    const sheet = `<?xml version="1.0"?><worksheet><sheetData>
      <row r="1"><c r="A1" t="s"><v>0</v></c><c r="C1" t="inlineStr"><is><t>Oral Use</t></is></c></row>
      <row r="2" spans="1:3"/>
      <row r="3"><c r="B3" t="s"><v>1</v></c></row>
    </sheetData></worksheet>`;
    const shared = `<sst><si><t>Product name</t></si><si><r><t>Para</t></r><r><t>cetamol &amp; C</t></r></si></sst>`;
    const bytes = zipSync({ "xl/worksheets/sheet1.xml": strToU8(sheet), "xl/sharedStrings.xml": strToU8(shared) });
    expect(readXlsxRows(bytes)).toEqual([["Product name", "", "Oral Use"], [], ["", "Paracetamol & C"]]);
    expect(decodeXml("&#xE8; &#232; &lt;b&gt;")).toBe("è è <b>");
  });
});

describe("foto delle confezioni", () => {
  const photos = photosFileSchema.parse(JSON.parse(readFileSync(path.join(process.cwd(), "data/medicines/photos.json"), "utf8")));

  it("ogni foto ha licenza libera, autore, fonte, Paese e il file in public/farmaci/foto", () => {
    expect(photos.length).toBeGreaterThan(0);
    for (const p of photos) expect(existsSync(path.join(process.cwd(), "public/farmaci/foto", p.file)), p.file).toBe(true);
    expect(photosFileSchema.safeParse([{ ...photos[0], license: "CC BY-NC 4.0" }]).success).toBe(false);
  });

  it("si abbina allo stesso marchio, e a dosaggio e forma se la foto li indica", () => {
    const base = { officialName: "AUGMENTIN", strength: "875 mg + 125 mg", formFamily: "compresse" };
    expect(photoFor(base, photos)?.country).toBe("Belgio");
    expect(photoFor({ ...base, formFamily: "bustine" }, photos)).toBeNull();
    expect(photoFor({ ...base, officialName: "AMOXICILLINA E ACIDO CLAVULANICO EG" }, photos)).toBeNull();
    const rows = [{ ...base, imageUrl: null, imageCredit: null, imageSource: null, imageCaption: null, imageCountry: null }] as Parameters<typeof applyPhotos>[0];
    expect(applyPhotos(rows, photos)).toBe(1);
    expect(rows[0]).toMatchObject({ imageUrl: "/farmaci/foto/augmentin-875-125-belgio.webp", imageCredit: "Bree, CC0 1.0", imageCountry: "Belgio" });
  });
});

describe("testi", () => {
  it("nomi delle aziende leggibili", () => {
    expect(displayCompany("AZIENDE CHIMICHE RIUNITE ANGELINI FRANCESCO A.C.R.A.F. S.P.A.")).toBe("Aziende Chimiche Riunite Angelini Francesco A.C.R.A.F. S.p.A.");
    expect(displayCompany("DOC GENERICI SRL")).toBe("DOC Generici S.r.l.");
    expect(displayCompany("CHEPLAPHARM ARZNEIMITTEL GMBH")).toBe("Cheplapharm Arzneimittel GmbH");
    expect(displayCompany("RECORDATI INDUSTRIA CHIMICA E FARMACEUTICA S.P.A.")).toBe("Recordati Industria Chimica e Farmaceutica S.p.A.");
  });

  it("fascia di prezzo", () => {
    const plain = (s: string) => s.replace(/\u00a0/g, " ");
    expect(plain(formatPriceRange(7.9, 10.2))).toBe("da 7,90 € a 10,20 €");
    expect(plain(formatPriceRange(4.54, 4.54))).toBe("4,54 €");
  });
});
