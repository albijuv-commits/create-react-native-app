import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import seed from "@data/medicines/seed.json";
import { buildCatalog, type AifaSources } from "@/lib/medicines/build";
import { csvRecords, decodeWindows1252, parseCsv } from "@/lib/medicines/csv";
import { MEDICINES_DDL } from "@/lib/medicines/ddl";
import { formFamily } from "@/lib/medicines/forms";
import { SUPPLY_CODES, supplyBadge, supplyCodeFrom, SUPPLY_BADGE_LABEL } from "@/lib/medicines/regime";
import { medicines } from "@/lib/medicines/schema";
import {
  cleanDescription,
  dateFromFilename,
  dateFromText,
  displayName,
  normalizeSearch,
  padAic,
  parsePrice,
  sentenceCase,
  strengthKey,
  unitsFromGroup,
} from "@/lib/medicines/text";

describe("regime di fornitura → badge", () => {
  // Una verifica per ogni dicitura dell'anagrafica AIFA (confezioni_fornitura.csv)
  const AIFA: Array<[string, string]> = [
    ["Medicinali non soggetti a prescrizione medica, da banco.", "OTC"],
    ["Medicinali non soggetti a prescrizione medica ma non da banco", "SOP"],
    ["Medicinali soggetti a prescrizione medica", "RR"],
    ["Medicinali soggetti a prescrizione medica da rinnovare volta per volta", "RNR"],
    ["Medicinali soggetti a prescrizione medica limitativa, vendibili al pubblico su prescrizione di centri ospedalieri o di specialisti", "RRL"],
    ["Medicinali soggetti a prescrizione medica limitativa, da rinnovare volta per volta, vendibili al pubblico su prescrizione di centri ospedalieri o di specialisti", "RNRL"],
    ["Medicinali soggetti a prescrizione medica limitativa, utilizzabili esclusivamente in ambiente ospedaliero o in una struttura ad esso assimilabile", "OSP"],
    ["Medicinali soggetti a prescrizione medica limitativa, utilizzabili esclusivamente dallo specialista", "USPL"],
    ["Medicinali soggetti a prescrizione medica speciale con Ricetta Ministeriale a Ricalco", "RMR"],
  ];
  it.each(AIFA)("«%s» → %s", (text, code) => {
    expect(supplyCodeFrom(text)).toBe(code);
  });

  it("accetta anche le sigle e ignora ciò che non riconosce", () => {
    expect(supplyCodeFrom("otc")).toBe("OTC");
    expect(supplyCodeFrom(" RNR ")).toBe("RNR");
    expect(supplyCodeFrom("N.D.")).toBeNull();
    expect(supplyCodeFrom("")).toBeNull();
    expect(supplyCodeFrom(null)).toBeNull();
  });

  it("segue la tabella della specifica: OTC e SOP senza ricetta, RR RNR RRL RMR con ricetta, OSP ospedaliero", () => {
    expect(supplyBadge("OTC")).toBe("senza-ricetta");
    expect(supplyBadge("SOP")).toBe("senza-ricetta");
    for (const code of ["RR", "RNR", "RRL", "RMR"] as const) expect(supplyBadge(code)).toBe("con-ricetta");
    expect(supplyBadge("OSP")).toBe("ospedaliero");
    // Fuori dalla tabella ma presenti nei dati
    expect(supplyBadge("RNRL")).toBe("con-ricetta");
    expect(supplyBadge("USPL")).toBe("specialista");
    expect(supplyBadge(null)).toBe("non-indicato");
    expect(SUPPLY_BADGE_LABEL["senza-ricetta"]).toBe("Senza ricetta");
    expect(SUPPLY_BADGE_LABEL["con-ricetta"]).toBe("Con ricetta");
    expect(SUPPLY_BADGE_LABEL.ospedaliero).toBe("Solo uso ospedaliero");
  });

  it("ogni sigla ha un badge", () => {
    for (const code of SUPPLY_CODES) expect(supplyBadge(code)).not.toBe("non-indicato");
  });
});

describe("forme farmaceutiche", () => {
  it.each([
    ["Compressa rivestita con film", "", "compresse"],
    ["Compressa effervescente", "", "compresse"],
    ["Pastiglia", "", "compresse"],
    ["Capsula rigida gastroresistente", "", "capsule"],
    ["Sciroppo", "", "sciroppo"],
    ["Gocce orali, soluzione", "", "sciroppo"],
    ["Polvere per sospensione orale", "flacone da 100 ml", "sciroppo"],
    ["Polvere per soluzione orale", "1000 MG POLVERE PER SOLUZIONE ORALE IN BUSTINE", "bustine"],
    ["Granulato per soluzione orale", "16 bustine", "bustine"],
    ["Granulato effervescente", "30 bustine", "bustine"],
    ["Spray nasale, soluzione", "", "spray-nasale"],
    ["Collirio, soluzione", "", "collirio"],
    ["Crema", "", "crema"],
    ["Gel", "", "crema"],
    ["Unguento", "", "crema"],
    ["Soluzione iniettabile", "", "altro"],
    ["Sospensione pressurizzata per inalazione", "", "altro"],
    ["Supposta", "", "altro"],
  ])("%s → %s", (form, desc, family) => {
    expect(formFamily(form, desc)).toBe(family);
  });
});

describe("testi delle liste AIFA", () => {
  it("prezzi e codici AIC", () => {
    expect(parsePrice("33,77")).toBe(33.77);
    expect(parsePrice("5,63 €")).toBe(5.63);
    expect(parsePrice("1.234,50")).toBe(1234.5);
    expect(parsePrice("-")).toBeNull();
    expect(parsePrice("")).toBeNull();
    expect(padAic("44155024")).toBe("044155024");
    expect(padAic("034208013")).toBe("034208013");
    expect(padAic("abc")).toBeNull();
  });

  it("nomi e principi attivi leggibili", () => {
    expect(displayName("AMOXICILLINA E ACIDO CLAVULANICO DOC GENERICI")).toBe("Amoxicillina e Acido Clavulanico DOC Generici");
    expect(displayName("TACHIPIRINA")).toBe("Tachipirina");
    expect(sentenceCase("XILOMETAZOLINA CLORIDRATO")).toBe("Xilometazolina cloridrato");
    expect(normalizeSearch("Tachipirìna 500 MG")).toBe("tachipirina 500 mg");
  });

  it("descrizioni ripulite senza rovinare i decimali", () => {
    expect(cleanDescription("500 MG COMPRESSE-20 COMPRESSE")).toBe("500 mg compresse, 20 compresse");
    expect(cleanDescription("20 MG COMPRESSE RIVESTITE CON FILM- 30 COMPRESSE IN BLISTER AL/AL")).toBe(
      "20 mg compresse rivestite con film, 30 compresse in blister AL/AL",
    );
    expect(cleanDescription("0,05% COLLIRIO, SOLUZIONE-FLACONE 5 ML")).toBe("0,05% collirio, soluzione, flacone 5 ml");
    expect(cleanDescription("<875 mg/125 mg compresse rivestite  con  film>  12 compresse in blister PVC/AL/PA-AL,")).toBe(
      "875 mg/125 mg compresse rivestite con film, 12 compresse in blister PVC/AL/PA-AL",
    );
    expect(cleanDescription("40 MG COMPRESSE GASTRO-RESISTENTI - 14 COMPRESSE")).toBe("40 mg compresse gastro-resistenti, 14 compresse");
    expect(cleanDescription("300 MG/ 3 ML SOLUZIONE INIETTABILE- 10 FIALE")).toBe("300 mg/3 ml soluzione iniettabile, 10 fiale");
  });

  it("dosaggio confrontabile, senza le quantità della confezione", () => {
    expect(strengthKey("875 MG/125 MG COMPRESSE- 12 COMPRESSE")).toBe("875 mg + 125 mg");
    expect(strengthKey("875 MG + 125 MG COMPRESSE RIVESTITE CON FILM - 12 COMPRESSE")).toBe("875 mg + 125 mg");
    expect(strengthKey("1 MG/ML SPRAY NASALE SOLUZIONE- FLACONE 10 ML")).toBe("1 mg/ml");
    expect(strengthKey("0,1% SPRAY NASALE, SOLUZIONE- FLACONE 10 G")).toBe("0.1 %");
    expect(strengthKey("25 MG/G GEL- TUBO DA 50 G")).toBe("25 mg/g");
    expect(strengthKey("120 mg/5 ml sciroppo> flacone in PET da 120 ml")).toBe("120 mg/5 ml");
    expect(strengthKey("50 MICROGRAMMI COMPRESSE- 50 COMPRESSE")).toBe("50 mcg");
    expect(strengthKey("POLVERE PER TISANA-SCATOLA")).toBeNull();
  });

  it("unità e date", () => {
    expect(unitsFromGroup("ATORVASTATINA 20MG 30 UNITA' USO ORALE")).toBe(30);
    expect(unitsFromGroup("SALBUTAMOLO 100MCG 200 DOSI USO RESPIRATORIO")).toBeNull();
    expect(dateFromFilename("Classe_A_per_principio_attivo_31-05-2026.csv")).toBe("2026-05-31");
    expect(dateFromText("Prezzo Pubblico 15 settembre 2026")).toBe("2026-09-15");
    expect(dateFromText("Prezzo Pubblico")).toBeNull();
  });
});

describe("CSV dell'AIFA", () => {
  it("separatore «;», virgolette raddoppiate e a capo nelle intestazioni", () => {
    expect(parseCsv('a;b\n"x;1";"di""ce"\n')).toEqual([
      ["a", "b"],
      ["x;1", 'di"ce'],
    ]);
    expect(csvRecords('﻿"Codice \nAIC";Prezzo\n034208013;33,77\n\n')).toEqual([{ "Codice AIC": "034208013", Prezzo: "33,77" }]);
  });

  it("Windows-1252: il byte 0x80 è l'euro", () => {
    expect(decodeWindows1252(new Uint8Array([0x50, 0x72, 0x65, 0x7a, 0x7a, 0x6f, 0x20, 0x80, 0x20, 0x92]))).toBe("Prezzo € ’");
  });
});

/* Righe nel formato dei file AIFA, con valori presi dalle liste ufficiali */
function sources(): AifaSources {
  const reg = (aic: string, extra: Partial<Record<string, string>> = {}) => ({
    CODICE_AIC: aic,
    DENOMINAZIONE: "TORVAST",
    DESCRIZIONE: "20 MG COMPRESSE RIVESTITE CON FILM- 30 COMPRESSE",
    RAGIONE_SOCIALE: "PFIZER ITALIA S.R.L.",
    STATO_AMMINISTRATIVO: "Autorizzata",
    TIPO_PROCEDURA: "Procedura Nazionale",
    FORMA: "Compressa rivestita con film",
    CODICE_ATC: "C10AA05",
    PA_ASSOCIATI: "ATORVASTATINA CALCIO TRIIDRATO",
    FORNITURA: "Medicinali soggetti a prescrizione medica",
    LINK_FI: "https://api.aifa.gov.it/aifa-bdf-eif-be/1.0.0/organizzazione/1/farmaci/33007/stampati?ts=FI",
    ...extra,
  });
  return {
    registry: [
      reg("033007042"),
      reg("040497291", { DENOMINAZIONE: "ATORVASTATINA SANDOZ GMBH", LINK_FI: "javascript:alert(1)" }),
      reg("012745093", { DENOMINAZIONE: "TACHIPIRINA", DESCRIZIONE: "500 MG COMPRESSE-20 COMPRESSE", FORMA: "Compressa", PA_ASSOCIATI: "PARACETAMOLO", FORNITURA: "Medicinali non soggetti a prescrizione medica ma non da banco" }),
      reg("000999001", { TIPO_PROCEDURA: "Omeopatico", DENOMINAZIONE: "OMEOPATICO" }),
      reg("000999002", { STATO_AMMINISTRATIVO: "Sospesa" }),
    ],
    atc: [{ CODICE_ATC: "C10A", DESCRIZIONE: "IPOCOLESTEROLEMIZZANTI ED IPOTRIGLICERIDEMIZZANTI" }],
    classA: [
      { "Principio attivo": "Atorvastatina", "Descrizione gruppo": "ATORVASTATINA 20MG 30 UNITA' USO ORALE", "Prezzo al pubblico €": "10,51", AIC: "033007042", "Codice Gruppo Equivalenza": "FTB" },
      { "Principio attivo": "Atorvastatina", "Descrizione gruppo": "ATORVASTATINA 20MG 30 UNITA' USO ORALE", "Prezzo al pubblico \u0080": "7,96", AIC: "040497291", "Codice Gruppo Equivalenza": "FTB" },
    ],
    classH: [],
    transparency: [{ AIC: "33007042", "Prezzo Pubblico 15 settembre 2026": "10,51 €", "Prezzo riferimento SSN": "7,96 €", "Codice gruppo equivalenza": "FTB" }],
  };
}

describe("unione dei file per codice AIC", () => {
  const rows = buildCatalog(sources(), { classA: "2026-05-31", classH: "2026-05-31", transparency: "2026-09-15" });

  it("esclude omeopatici e confezioni non autorizzate", () => {
    expect(rows.map((r) => r.aic).sort()).toEqual(["012745093", "033007042", "040497291"]);
  });

  it("prezzo e regime arrivano da file diversi e si uniscono per AIC", () => {
    const torvast = rows.find((r) => r.aic === "033007042")!;
    expect(torvast).toMatchObject({
      name: "Torvast",
      activeIngredient: "Atorvastatina",
      supplyCode: "RR",
      reimbursementClass: "A",
      price: 10.51,
      priceDate: "2026-09-15",
      priceSource: "trasparenza",
      referencePrice: 7.96,
      units: 30,
      equivalenceGroup: "FTB",
      formFamily: "compresse",
      atcGroup: "C",
      atcClass: "IPOCOLESTEROLEMIZZANTI ED IPOTRIGLICERIDEMIZZANTI",
      strength: "20 mg",
    });
    // Anche se il simbolo dell'euro arriva rovinato dalla codifica, il prezzo si trova
    expect(rows.find((r) => r.aic === "040497291")!.price).toBe(7.96);
  });

  it("i farmaci senza ricetta non hanno un prezzo nelle liste AIFA: resta vuoto, non si inventa", () => {
    const tachipirina = rows.find((r) => r.aic === "012745093")!;
    expect(tachipirina.supplyCode).toBe("SOP");
    expect(tachipirina.price).toBeNull();
    expect(tachipirina.priceDate).toBeNull();
    expect(tachipirina.reimbursementClass).toBeNull();
  });

  it("il link al foglietto è accettato solo se punta all'AIFA", () => {
    expect(rows.find((r) => r.aic === "033007042")!.leafletUrl).toMatch(/^https:\/\/api\.aifa\.gov\.it\//);
    expect(rows.find((r) => r.aic === "040497291")!.leafletUrl).toBeNull();
  });
});

describe("database e campione di esempio", () => {
  it("le tabelle SQL coincidono con lo schema Drizzle", () => {
    const db = new Database(":memory:");
    db.exec(MEDICINES_DDL);
    const sqlColumns = (db.prepare("PRAGMA table_info(medicines)").all() as { name: string }[]).map((c) => c.name).sort();
    const drizzleColumns = getTableConfig(medicines).columns.map((c) => c.name).sort();
    expect(sqlColumns).toEqual(drizzleColumns);
  });

  it("il campione è etichettato come esempio e contiene solo dati presi dall'AIFA", () => {
    expect(seed.meta.source).toBe("esempio");
    expect(seed.medicines.length).toBeGreaterThanOrEqual(35);
    for (const m of seed.medicines) {
      expect(m.aic).toMatch(/^\d{9}$/);
      if (m.price !== null) {
        expect(m.priceDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(["classe-a", "classe-h", "trasparenza"]).toContain(m.priceSource);
      }
      // Foto solo con licenza libera, servite dall'app, con autore, licenza, fonte e Paese
      if (m.imageUrl !== null) {
        expect(m.imageUrl).toMatch(/^\/farmaci\/foto\/[a-z0-9-]+\.webp$/);
        expect(m.imageCredit).toMatch(/, (CC0 1\.0|Pubblico dominio|CC BY(-SA)? [1-4]\.0)$/);
        expect(m.imageSource).toMatch(/^https:\/\//);
        expect(m.imageCountry).toBeTruthy();
      }
    }
    // Una confezione per ogni famiglia di forme illustrate
    const families = new Set(seed.medicines.map((m) => m.formFamily));
    for (const f of ["compresse", "capsule", "sciroppo", "bustine", "spray-nasale", "collirio", "crema"]) expect(families.has(f)).toBe(true);
  });
});
