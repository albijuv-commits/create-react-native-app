import { describe, expect, it } from "vitest";
import { RED_FLAGS, RED_FLAG_IDS, type RedFlagId } from "@data/emergency/red-flags";
import { detectRedFlags } from "@/lib/triage/red-flags";

const flags = (text: string, symptoms: Parameters<typeof detectRedFlags>[0]["symptoms"] = []) => detectRedFlags({ text, symptoms });

/** Per ogni regola: frasi che devono farla scattare e frasi simili che non devono */
const CASES: Record<RedFlagId, { yes: string[]; no: string[] }> = {
  "dolore-petto": {
    yes: [
      "Ho un dolore al petto che mi opprime da mezz'ora",
      "Sento una morsa al petto",
      "Mi fa male il petto e il dolore va al braccio sinistro",
      "dolore al torace che si irradia alla mandibola",
      "Peso sul petto e sudo freddo",
    ],
    no: ["Bruciore dietro lo sterno dopo mangiato", "Mi fa male il petto quando tossisco", "Mi batte forte il cuore quando sono in ansia"],
  },
  respiro: {
    yes: ["Faccio fatica a respirare anche da fermo", "Mi manca l'aria", "Non riesco a respirare bene", "Ha le labbra bluastre", "Respiro con fatica"],
    no: ["Ho il naso chiuso e non respiro dal naso", "Ho un po' di fiato corto quando faccio le scale"],
  },
  ictus: {
    yes: ["Ha la bocca storta all'improvviso", "Non riesco a muovere il braccio destro", "Fa fatica a parlare e confonde le parole", "Metà del corpo è debole"],
    no: ["Ho formicolio a mani e piedi dopo la palestra", "Ho mal di testa e il collo teso"],
  },
  "gonfiore-gola": {
    yes: ["Mi si sono gonfiate le labbra dopo il gamberetto", "Ho la lingua gonfia", "Sento la gola che si chiude", "Gola gonfia e faccio fatica a deglutire la saliva"],
    no: ["Ho le tonsille gonfie e mal di gola", "Ho i piedi gonfi la sera"],
  },
  "mal-di-testa-improvviso": {
    yes: [
      "Mal di testa improvviso e fortissimo",
      "È il peggior mal di testa della mia vita",
      "All'improvviso un dolore alla testa terribile, come un'esplosione",
    ],
    no: ["Ho mal di testa da tre giorni", "Emicrania come al solito, pulsante a destra"],
  },
  "febbre-meningite": {
    yes: ["Ho la febbre alta e il collo rigido", "Febbre e macchie che non scompaiono premendo il bicchiere", "Gli sono comparse delle petecchie"],
    no: ["Ho il collo rigido dopo aver dormito storto", "Ho la febbre e mal di gola"],
  },
  "svenimento-convulsioni": {
    yes: ["Stamattina sono svenuto in bagno", "Ha avuto le convulsioni", "Ha perso conoscenza per qualche secondo", "Ha avuto una crisi epilettica"],
    no: ["Quando mi alzo in fretta mi sento svenire", "Ho capogiri quando ho fame"],
  },
  sanguinamento: {
    yes: ["Il naso sanguina e non si ferma", "Ho vomitato sangue", "Ho le feci nere come il catrame", "Ho un'emorragia"],
    no: ["Mi sanguinano un po' le gengive quando lavo i denti", "Ho un livido sulla gamba"],
  },
  autolesionismo: {
    yes: ["Ho pensato di farmi del male", "Non voglio più vivere", "Penso al suicidio", "Vorrei farla finita"],
    no: ["Mi fa male la pancia", "Mi sono fatto male alla caviglia giocando"],
  },
  monossido: {
    yes: [
      "Mal di testa e nausea, e anche mio marito sta così da quando accendiamo la stufa",
      "Abbiamo tutti in casa mal di testa e nausea",
      "Ho paura che sia il monossido",
    ],
    no: ["Mio figlio ha mal di testa", "Anche mio figlio ha nausea e vomito da ieri"],
  },
};

describe("segnali d'allarme: ogni regola", () => {
  for (const id of RED_FLAG_IDS) {
    describe(id, () => {
      for (const text of CASES[id].yes) {
        it(`scatta: «${text}»`, () => {
          expect(flags(text)).toContain(id);
        });
      }
      for (const text of CASES[id].no) {
        it(`non scatta: «${text}»`, () => {
          expect(flags(text)).not.toContain(id);
        });
      }
      it("scatta quando la voce è spuntata nell'elenco", () => {
        expect(detectRedFlags({ checked: [id] })).toEqual([id]);
      });
    });
  }
});

describe("segnali d'allarme: comportamento generale", () => {
  it("testo vuoto e nessuna voce: nessun allarme", () => {
    expect(detectRedFlags({})).toEqual([]);
    expect(flags("")).toEqual([]);
  });

  it("riconosce gli accenti e le maiuscole", () => {
    expect(flags("DIFFICOLTÀ A RESPIRARE")).toContain("respiro");
  });

  it("il collo rigido è un allarme se la febbre è già tra i sintomi", () => {
    expect(flags("ho il collo rigido", ["febbre"])).toContain("febbre-meningite");
    expect(flags("ho il collo rigido")).not.toContain("febbre-meningite");
  });

  it("restituisce più segnali nell'ordine dell'elenco", () => {
    expect(flags("sono svenuto e ho un dolore al petto che opprime")).toEqual(["dolore-petto", "svenimento-convulsioni"]);
  });

  it("ogni segnale ha una voce di elenco, un titolo, istruzioni e una fonte https", () => {
    for (const id of RED_FLAG_IDS) {
      const f = RED_FLAGS[id];
      expect(f.checklist.length).toBeGreaterThan(10);
      expect(f.steps.length).toBeGreaterThanOrEqual(3);
      expect(f.source.url).toMatch(/^https:\/\//);
    }
  });

  it("per i pensieri di farsi del male mostra i numeri di ascolto verificati", () => {
    const names = RED_FLAGS.autolesionismo.helplines.map((h) => h.name);
    expect(names).toEqual(["Telefono Amico Italia", "Telefono Azzurro"]);
    for (const h of RED_FLAGS.autolesionismo.helplines) expect(h.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("le istruzioni non indicano dosi", () => {
    const text = RED_FLAG_IDS.flatMap((id) => RED_FLAGS[id].steps).join(" ");
    expect(text).not.toMatch(/\b\d+([.,]\d+)?\s?(mg|ml|mcg|g)\b/i);
    expect(text).not.toMatch(/\b(compress[ae]|capsul[ae]|gocce)\b/i);
  });
});
