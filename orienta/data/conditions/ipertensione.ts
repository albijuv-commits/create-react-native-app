import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "ipertensione",
  name: "Ipertensione",
  aliases: ["pressione alta", "ipertensione arteriosa"],
  areas: ["corpo"],
  bodyZones: ["petto", "tutto-il-corpo"],

  overview:
    "L'ipertensione, o pressione alta, è una pressione del sangue nelle arterie costantemente sopra i valori normali. Di solito non dà alcun sintomo, ma col tempo affatica cuore, cervello, reni e occhi: misurarla regolarmente è l'unico modo per scoprirla, e si tiene sotto controllo con lo stile di vita e, se serve, con i farmaci.",

  animation: {
    scene: "vaso-pressione",
    params: {},
    captions: [
      "Il cuore spinge il sangue nelle arterie: la pressione è la forza con cui il sangue preme sulle loro pareti.",
      "Con età, sale, sovrappeso, fumo e sedentarietà le arterie diventano più rigide e strette: la pressione sale, di solito senza sintomi.",
      "Anni di pressione alta affaticano il cuore e danneggiano i vasi di cervello, reni e occhi.",
      "Meno sale, movimento, peso sano e, se servono, i farmaci riportano la pressione ai valori giusti e riducono i rischi.",
    ],
  },

  history: {
    nameOrigin:
      "Dal greco «hypér», sopra, e dal latino «tensio», tensione: una tensione del sangue sopra la norma.",
    events: [
      {
        when: "1733",
        text: "Il religioso e scienziato inglese Stephen Hales misura per la prima volta la pressione del sangue, in un cavallo.",
      },
      {
        when: "1896",
        text: "L'italiano Scipione Riva-Rocci inventa lo sfigmomanometro con il bracciale, lo strumento usato ancora oggi.",
      },
      {
        when: "1905",
        text: "Il medico russo Nikolai Korotkov descrive i suoni che, con lo stetoscopio, permettono di misurare la pressione massima e minima.",
      },
      {
        when: "1948",
        text: "Negli Stati Uniti inizia lo studio di Framingham, che dimostra il legame tra pressione alta e malattie del cuore.",
      },
      {
        when: "1958",
        text: "Arrivano i diuretici tiazidici, tra i primi farmaci efficaci e ben tollerati contro la pressione alta.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Mario, 58 anni: la scoperta in farmacia",
      story:
        "Mario si sente benissimo, ma in farmacia accetta di misurare la pressione: 160 su 100. Il medico gli chiede di misurarla a casa per una settimana e conferma l'ipertensione. Mario riduce il sale, cammina ogni giorno, perde qualche chilo e inizia la terapia prescritta. Ai controlli successivi la pressione è nei valori giusti.",
      lesson:
        "La pressione alta di solito non dà sintomi: si scopre solo misurandola. Curarla riduce il rischio di infarto e ictus.",
    },
  ],

  causes: [
    "Nella maggior parte dei casi non c'è una causa unica: contano età, familiarità e stile di vita.",
    "Più di rado dipende da altre malattie, ad esempio dei reni o delle ghiandole surrenali, o da alcuni farmaci.",
  ],
  riskFactors: [
    "Età che avanza.",
    "Familiari con pressione alta.",
    "Troppo sale nell'alimentazione.",
    "Sovrappeso e sedentarietà.",
    "Fumo e alcol.",
    "Stress prolungato.",
    "Diabete e malattie dei reni.",
  ],

  symptoms: {
    typical: [
      "Nella maggior parte dei casi nessun sintomo",
      "Valori di pressione alti, confermati in misurazioni ripetute in giorni diversi",
    ],
    lessCommon: ["Mal di testa", "Vista offuscata", "Dolore al petto, nei casi più gravi"],
  },

  treatments: {
    options: [
      {
        title: "Stile di vita",
        text: "Meno sale, più frutta e verdura, attività fisica regolare, peso sano, poco alcol e niente fumo: a volte bastano, e aiutano sempre.",
      },
      {
        title: "Farmaci antipertensivi",
        text: "Il medico li prescrive se la pressione è molto alta o il rischio per cuore e vasi è elevato. Spesso servono a lungo, a volte più di uno.",
      },
      {
        title: "Misurazioni a casa",
        text: "Un apparecchio validato e misurazioni regolari aiutano il medico a regolare la cura.",
      },
    ],
    selfCare: [
      "Misura la pressione da seduto, dopo qualche minuto di riposo, con il braccio appoggiato all'altezza del cuore.",
      "Annota i valori e portali al medico.",
      "Non sospendere i farmaci perché la pressione è tornata normale: è merito della cura.",
      "Riduci il sale e i cibi già salati, come salumi, formaggi stagionati e snack.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Hai 40 anni o più e non misuri la pressione da tempo.",
      "Le misurazioni a casa sono spesso alte.",
      "Hai spesso mal di testa o la vista offuscata.",
      "Sei in terapia e hai capogiri o altri effetti indesiderati.",
    ],
    urgent: [
      "Hai un dolore o un peso al petto che non passa, che può estendersi a braccio, collo, mandibola o schiena, con sudore, nausea o fiato corto.",
      "Hai segni di ictus: viso storto, braccio debole, difficoltà a parlare.",
      "Hai un mal di testa improvviso e fortissimo.",
    ],
  },

  prevention: [
    "Usa poco sale.",
    "Muoviti: almeno 150 minuti di attività moderata alla settimana.",
    "Mantieni un peso sano.",
    "Limita l'alcol e non fumare.",
    "Misura la pressione regolarmente, anche se stai bene.",
  ],

  specialist: {
    id: "cardiologo",
    why: "Il medico di base diagnostica e cura la maggior parte dei casi. Il cardiologo serve per la pressione difficile da controllare o se ci sono problemi al cuore.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Ipertensione arteriosa o pressione alta",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/i/ipertensione-arteriosa-o-pressione-alta",
      lang: "it",
    },
    {
      publisher: "Ministero della Salute",
      title: "Ipertensione arteriosa",
      url: "https://www.salute.gov.it/new/it/scheda-malattia/ipertensione-arteriosa/",
      lang: "it",
    },
    { publisher: "NHS", title: "High blood pressure", url: "https://www.nhs.uk/conditions/high-blood-pressure/", lang: "en" },
    {
      publisher: "MedlinePlus",
      title: "High Blood Pressure",
      url: "https://medlineplus.gov/highbloodpressure.html",
      lang: "en",
    },
  ],

  triage: {
    matchable: false,
    keySymptoms: [],
    otherSymptoms: ["mal-di-testa", "vista-offuscata"],
    moreLikelyIf: [
      "Le misurazioni ripetute sono alte.",
      "Hai familiari con pressione alta, sei in sovrappeso o mangi molto salato.",
    ],
    lessLikelyIf: [
      "A casa la pressione è normale e risulta alta solo dal medico: può essere l'effetto «camice bianco».",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
