import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "reflusso",
  name: "Reflusso gastroesofageo",
  aliases: ["reflusso acido", "acidità di stomaco", "bruciore di stomaco", "pirosi", "malattia da reflusso"],
  areas: ["digestione"],
  bodyZones: ["petto", "stomaco"],

  overview:
    "Il reflusso gastroesofageo è la risalita di acido dallo stomaco verso l'esofago, il tubo che porta il cibo dalla bocca allo stomaco. Provoca bruciore dietro lo sterno e sapore acido in bocca: se succede spesso si parla di malattia da reflusso, che si cura bene con abitudini e farmaci.",

  animation: {
    scene: "reflusso",
    params: {},
    captions: [
      "Il cibo scende lungo l'esofago fino allo stomaco. In fondo all'esofago una valvola muscolare, lo sfintere, si richiude subito dopo.",
      "Pasti abbondanti, sovrappeso, fumo o un'ernia iatale possono far rilassare la valvola quando non dovrebbe.",
      "L'acido dello stomaco risale e irrita l'esofago: senti bruciore dietro lo sterno e sapore acido in bocca.",
      "Pasti più piccoli, non sdraiarsi dopo mangiato e la testata del letto un po' rialzata aiutano la valvola a restare chiusa.",
    ],
  },

  history: {
    nameOrigin:
      "«Reflusso» viene dal latino «refluere», scorrere all'indietro. «Pirosi», il nome medico del bruciore, viene dal greco «pyr», fuoco.",
    events: [
      {
        when: "Per secoli",
        text: "Contro il bruciore si usano sostanze che neutralizzano l'acido, come il carbonato di calcio e, più tardi, il bicarbonato.",
      },
      {
        when: "1956",
        text: "Il chirurgo Rudolf Nissen descrive la fundoplicatio, un intervento che rinforza la valvola tra esofago e stomaco.",
      },
      {
        when: "1976",
        text: "Arriva la cimetidina, primo farmaco che riduce la produzione di acido: il suo scopritore, James Black, riceverà il Nobel nel 1988.",
      },
      {
        when: "1988-1989",
        text: "Vengono introdotti gli inibitori della pompa protonica, ancora oggi i farmaci più usati per il reflusso.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Roberto, 52 anni: il bruciore della sera",
      story:
        "Roberto sente bruciore dietro lo sterno quasi ogni sera, soprattutto dopo cene abbondanti e quando si sdraia sul divano. In farmacia gli consigliano un prodotto da banco e qualche accorgimento, ma dopo tre settimane il disturbo continua. Il medico prescrive una cura di alcune settimane; Roberto anticipa la cena e perde qualche chilo, e il bruciore si riduce molto.",
      lesson:
        "Se il bruciore è frequente o non passa con i rimedi da banco, serve il medico. Le abitudini contano quanto i farmaci.",
    },
  ],

  causes: [
    "La valvola tra esofago e stomaco, lo sfintere esofageo inferiore, si chiude male o si rilassa troppo spesso.",
    "L'ernia iatale, quando una parte dello stomaco risale nel torace.",
    "Alcuni cibi e bevande: caffè, alcol, cioccolato, pomodoro, cibi grassi o piccanti.",
    "Alcuni farmaci, ad esempio gli antinfiammatori.",
  ],
  riskFactors: ["Sovrappeso.", "Fumo.", "Gravidanza.", "Pasti abbondanti o cena poco prima di dormire.", "Stress e ansia."],

  symptoms: {
    typical: [
      "Bruciore dietro lo sterno, spesso dopo i pasti",
      "Sapore acido o amaro in bocca, rigurgito",
      "Fastidio che peggiora quando ti sdrai o ti pieghi in avanti",
    ],
    lessCommon: ["Tosse o singhiozzo ricorrenti", "Voce rauca", "Alito cattivo", "Gonfiore e nausea"],
  },

  treatments: {
    options: [
      {
        title: "Antiacidi e alginati",
        text: "Si comprano senza ricetta e danno sollievo rapido, ma non curano il problema e non vanno presi a lungo. Chiedi al farmacista.",
      },
      {
        title: "Farmaci che riducono l'acido",
        text: "Il medico può prescrivere per alcune settimane farmaci come gli inibitori della pompa protonica.",
      },
      {
        title: "Esami e cura delle cause",
        text: "Se i sintomi sono forti o non passano, il gastroenterologo può proporre una gastroscopia e la ricerca del batterio Helicobacter pylori.",
      },
      { title: "Chirurgia", text: "In casi selezionati si interviene per rinforzare la valvola." },
    ],
    selfCare: [
      "Fai pasti più piccoli e più frequenti.",
      "Cena almeno 3 ore prima di andare a letto.",
      "Rialza la testata del letto di 10-20 centimetri con degli spessori sotto i piedi del letto, non con cuscini in più.",
      "Evita i cibi che ti danno fastidio, il fumo e l'alcol.",
      "Non indossare abiti stretti in vita.",
      "Non interrompere farmaci prescritti senza parlarne con il medico.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Hai bruciore quasi tutti i giorni, o da più di 3 settimane.",
      "Abitudini e rimedi da banco non bastano.",
      "Fai fatica a deglutire, il cibo si ferma in gola, perdi peso senza motivo o vomiti spesso: senti il medico al più presto.",
    ],
    urgent: [
      "Vomiti sangue o materiale scuro simile a fondi di caffè, oppure hai feci nere.",
      "Hai un dolore al petto oppressivo o che si irradia a braccio, mandibola o schiena, con sudore o fiato corto: può essere il cuore.",
    ],
  },

  prevention: [
    "Mantieni un peso sano.",
    "Non fumare.",
    "Evita i pasti abbondanti la sera.",
    "Dopo mangiato, muoviti invece di sdraiarti.",
  ],

  specialist: {
    id: "gastroenterologo",
    why: "Se il reflusso non risponde alle cure, torna spesso o ci sono segnali d'allarme, il gastroenterologo valuta esami come la gastroscopia.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Reflusso gastroesofageo",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/r/reflusso-gastroesofageo",
      lang: "it",
    },
    {
      publisher: "NHS",
      title: "Heartburn and acid reflux",
      url: "https://www.nhs.uk/conditions/heartburn-and-acid-reflux/",
      lang: "en",
    },
    { publisher: "MedlinePlus", title: "GERD", url: "https://medlineplus.gov/gerd.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["bruciore-petto", "rigurgito-acido"],
    otherSymptoms: ["tosse-secca", "raucedine", "nausea", "gonfiore-pancia", "difficolta-deglutire"],
    moreLikelyIf: [
      "Il bruciore peggiora dopo i pasti, da sdraiato o quando ti pieghi.",
      "Migliora con gli antiacidi.",
    ],
    lessLikelyIf: [
      "Il dolore al petto compare con lo sforzo o è oppressivo: va escluso un problema al cuore.",
      "Hai febbre.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
