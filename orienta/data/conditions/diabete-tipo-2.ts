import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "diabete-tipo-2",
  name: "Diabete di tipo 2",
  aliases: ["diabete", "glicemia alta", "zucchero alto nel sangue", "diabete mellito"],
  areas: ["corpo"],
  bodyZones: ["tutto-il-corpo"],

  overview:
    "Il diabete di tipo 2 è una malattia in cui il corpo non usa bene l'insulina, l'ormone che fa entrare lo zucchero nelle cellule, e la glicemia resta troppo alta. Spesso per anni non dà sintomi chiari: curato bene con alimentazione, movimento e farmaci, si previene gran parte delle complicazioni a cuore, reni, occhi e nervi.",

  animation: {
    scene: "glicemia",
    params: {},
    captions: [
      "Dopo un pasto lo zucchero, il glucosio, passa nel sangue e il pancreas libera insulina.",
      "L'insulina funziona come una chiave: apre le porte delle cellule e il glucosio entra, diventando energia.",
      "Nel diabete di tipo 2 le porte rispondono male alla chiave: il glucosio resta nel sangue e il pancreas si affatica producendo sempre più insulina.",
      "Movimento, alimentazione equilibrata, perdita di peso e i farmaci prescritti aiutano le cellule a riaprire le porte: la glicemia scende.",
    ],
  },

  history: {
    nameOrigin:
      "«Diabete» viene dal greco «diabainein», passare attraverso, per la grande quantità di urina. «Mellito» viene dal latino «mel», miele: l'urina delle persone con diabete è dolce.",
    events: [
      {
        when: "II secolo d.C.",
        text: "Areteo di Cappadocia descrive una malattia in cui il corpo sembra «sciogliersi» nelle urine.",
      },
      {
        when: "1674",
        text: "Il medico inglese Thomas Willis nota che l'urina dei malati è dolce come se fosse impregnata di miele.",
      },
      {
        when: "1921",
        text: "A Toronto Frederick Banting e Charles Best scoprono l'insulina; Banting e John Macleod ricevono il Nobel nel 1923.",
      },
      {
        when: "1936",
        text: "Harold Himsworth distingue le persone sensibili e quelle resistenti all'insulina: è la base della distinzione tra diabete di tipo 1 e di tipo 2.",
      },
      {
        when: "1957",
        text: "Il medico francese Jean Sterne introduce la metformina, ancora oggi tra i farmaci più usati.",
      },
      {
        when: "1998",
        text: "Lo studio britannico UKPDS dimostra che controllare bene glicemia e pressione riduce le complicazioni.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Giuseppe, 61 anni: la sete che non passa",
      story:
        "Giuseppe ha sempre sete, si alza spesso di notte per urinare e si sente stanco. Agli esami del sangue glicemia ed emoglobina glicata sono alte: è diabete di tipo 2. Con il medico e il centro diabetologico imposta alimentazione, camminate quotidiane e un farmaco. In un anno perde sei chili e i valori migliorano molto.",
      lesson:
        "Sete intensa, tanta urina e stanchezza vanno segnalate. Nel diabete di tipo 2 lo stile di vita è una parte fondamentale della cura.",
    },
  ],

  causes: [
    "Le cellule rispondono meno all'insulina (insulino-resistenza) e il pancreas, nel tempo, non riesce a produrne abbastanza.",
    "Contano la predisposizione genetica e lo stile di vita.",
  ],
  riskFactors: [
    "Sovrappeso, soprattutto il grasso sulla pancia.",
    "Sedentarietà.",
    "Età oltre i 40-45 anni, anche se oggi colpisce sempre più spesso persone giovani.",
    "Familiari con diabete.",
    "Diabete in gravidanza o sindrome dell'ovaio policistico.",
    "Pressione alta e colesterolo alto.",
    "Origine dell'Asia meridionale, africana o caraibica.",
  ],

  symptoms: {
    typical: [
      "Spesso nessun sintomo per anni",
      "Sete intensa",
      "Bisogno di urinare spesso, anche di notte",
      "Stanchezza",
    ],
    lessCommon: [
      "Vista offuscata",
      "Ferite che guariscono lentamente",
      "Infezioni frequenti, ad esempio intime o della pelle",
      "Formicolio o intorpidimento a mani e piedi",
      "Perdita di peso senza motivo",
    ],
  },

  treatments: {
    options: [
      {
        title: "Alimentazione",
        text: "Pasti regolari ed equilibrati, ricchi di verdure, legumi e cereali integrali, con pochi zuccheri semplici. Un dietista può aiutarti.",
      },
      { title: "Attività fisica", text: "Muoverti ogni giorno aiuta le cellule a usare meglio l'insulina." },
      {
        title: "Farmaci",
        text: "Il medico può prescrivere farmaci per bocca o iniettabili e, in alcuni casi, l'insulina. Alcuni proteggono anche cuore e reni.",
      },
      {
        title: "Controlli regolari",
        text: "Emoglobina glicata, pressione, colesterolo, reni, occhi e piedi vanno controllati periodicamente per prevenire le complicazioni.",
      },
    ],
    selfCare: [
      "Se il medico lo indica, misura la glicemia a casa e annota i valori.",
      "Controlla spesso i piedi e cura anche le piccole ferite.",
      "Non fumare.",
      "In Italia le persone con diabete hanno diritto all'esenzione dal ticket per molti controlli: chiedi al medico.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Hai sete intensa, urini spesso o ti senti stanco senza motivo.",
      "Hai fattori di rischio e non controlli la glicemia da tempo.",
      "Hai ferite ai piedi che non guariscono.",
      "I valori di glicemia restano spesso alti nonostante la cura.",
    ],
    urgent: [
      "Hai una sete fortissima, vomito, respiro profondo o affannoso e ti senti molto debole o confuso.",
      "Hai sintomi di glicemia troppo bassa, come sudore freddo, tremore e confusione, che non migliorano prendendo zucchero, o la persona non risponde.",
    ],
  },

  prevention: [
    "Mantieni un peso sano.",
    "Muoviti ogni giorno.",
    "Riduci zuccheri, bevande zuccherate e cibi ultraprocessati.",
    "Se hai fattori di rischio, controlla periodicamente la glicemia.",
  ],

  specialist: {
    id: "diabetologo",
    why: "Il medico di base fa la diagnosi e segue molte persone con diabete; il diabetologo, spesso in un centro diabetologico, imposta e aggiorna le cure.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Diabete di tipo 2",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/d/diabete-di-tipo-2",
      lang: "it",
    },
    {
      publisher: "Ministero della Salute",
      title: "Diabete",
      url: "https://www.salute.gov.it/new/it/tema/diabete/",
      lang: "it",
    },
    { publisher: "NHS", title: "Type 2 diabetes", url: "https://www.nhs.uk/conditions/type-2-diabetes/", lang: "en" },
    { publisher: "MedlinePlus", title: "Diabetes Type 2", url: "https://medlineplus.gov/diabetestype2.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["sete-intensa", "urinare-molto", "stanchezza"],
    otherSymptoms: ["vista-offuscata", "ferite-lente", "formicolii", "perdita-peso", "bocca-secca"],
    moreLikelyIf: [
      "Sei in sovrappeso, hai familiari con diabete o più di 40 anni.",
      "I sintomi sono comparsi lentamente.",
    ],
    lessLikelyIf: [
      "Hai bruciore quando urini: urinare spesso può dipendere da una cistite.",
      "Sei giovane e hai perso molto peso in poche settimane: va escluso il diabete di tipo 1, che richiede cure rapide.",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
