import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "ansia",
  name: "Ansia",
  aliases: ["disturbo d'ansia generalizzata", "ansia generalizzata", "attacchi di panico", "agitazione", "stress"],
  areas: ["mente"],
  bodyZones: ["testa", "petto", "stomaco"],

  overview:
    "Provare ansia ogni tanto è normale, ma nel disturbo d'ansia la preoccupazione è eccessiva, difficile da controllare e presente quasi ogni giorno per mesi. Si accompagna a tensione, irrequietezza, sonno disturbato e sintomi fisici come il batticuore, e si cura bene con la psicoterapia e, se serve, con i farmaci.",

  animation: {
    scene: "allarme",
    params: {},
    captions: [
      "Nel cervello c'è un sistema d'allarme, con al centro una piccola struttura chiamata amigdala, che ci protegge dai pericoli.",
      "Davanti a una minaccia, vera o immaginata, l'allarme suona e manda segnali a tutto il corpo.",
      "Il cuore accelera, il respiro si fa veloce, i muscoli si tendono e lo stomaco si stringe. Nell'ansia l'allarme scatta troppo spesso o non si spegne.",
      "La psicoterapia, il respiro lento e il movimento insegnano al corpo ad abbassare il volume dell'allarme.",
    ],
  },

  history: {
    nameOrigin:
      "Dal latino «anxietas», legato al verbo «angere», stringere, soffocare: è la stessa radice di «angoscia».",
    events: [
      { when: "1895", text: "Sigmund Freud descrive la «nevrosi d'ansia», separandola da altri disturbi nervosi." },
      {
        when: "Anni '60",
        text: "Arrivano le benzodiazepine: efficaci sul breve periodo, ma con il rischio di dipendenza se usate a lungo.",
      },
      {
        when: "Anni '60-'80",
        text: "Aaron Beck e altri sviluppano la terapia cognitivo-comportamentale, oggi una delle cure più efficaci per l'ansia.",
      },
      {
        when: "1980",
        text: "Il manuale diagnostico statunitense DSM-III introduce il «disturbo d'ansia generalizzata».",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Stefano, 29 anni: sempre in allerta",
      story:
        "Da mesi Stefano si preoccupa per tutto: il lavoro, la salute dei genitori, i soldi. Dorme male, ha spesso il cuore che batte forte e un nodo allo stomaco. Il medico lo visita, esclude problemi fisici e lo indirizza a uno psicologo. Con un percorso di terapia cognitivo-comportamentale impara a riconoscere i pensieri che lo agitano e a gestirli.",
      lesson:
        "L'ansia che dura e pesa sulla vita è un disturbo che si cura. Chiedere aiuto è un segno di forza, non di debolezza.",
    },
  ],

  causes: [
    "Un insieme di predisposizione, carattere ed esperienze di vita.",
    "Eventi stressanti o traumatici.",
    "Malattie fisiche croniche o dolorose.",
    "Alcol, droghe o troppa caffeina, che possono scatenarla o peggiorarla.",
  ],
  riskFactors: [
    "Familiari con disturbi d'ansia o depressione.",
    "Esperienze difficili come violenza, bullismo o lutti.",
    "Altri disturbi d'ansia o depressione.",
    "Essere donna: il disturbo è più frequente nelle donne.",
  ],

  symptoms: {
    typical: [
      "Preoccupazione eccessiva, quasi ogni giorno, difficile da controllare",
      "Irrequietezza o senso di tensione",
      "Stanchezza",
      "Difficoltà a concentrarti",
      "Irritabilità",
      "Disturbi del sonno",
    ],
    lessCommon: [
      "Batticuore, respiro veloce, sudorazione",
      "Capogiri",
      "Mal di stomaco, nausea o diarrea",
      "Tensione muscolare e mal di testa",
      "Attacchi di panico: ondate improvvise di paura intensa con forti sintomi fisici",
    ],
  },

  treatments: {
    options: [
      {
        title: "Psicoterapia",
        text: "La terapia cognitivo-comportamentale è la cura più studiata: aiuta a riconoscere e cambiare i pensieri e i comportamenti che alimentano l'ansia.",
      },
      {
        title: "Farmaci",
        text: "Il medico o lo psichiatra possono prescrivere farmaci, di solito antidepressivi, che richiedono qualche settimana per funzionare. Non sospenderli senza parlarne con il medico.",
      },
      {
        title: "Auto-aiuto guidato",
        text: "Libri, corsi e programmi online basati sulla terapia cognitivo-comportamentale, anche con il supporto di un professionista.",
      },
      {
        title: "Stile di vita",
        text: "Attività fisica regolare, sonno sufficiente e meno caffeina e alcol aiutano a ridurre l'ansia.",
      },
    ],
    selfCare: [
      "Parla di come ti senti con qualcuno di cui ti fidi.",
      "Prova la respirazione lenta: inspira dal naso ed espira piano dalla bocca.",
      "Non evitare sempre le situazioni che ti mettono ansia: affrontale un po' alla volta.",
      "Riduci caffè, bevande energetiche e alcol.",
      "Muoviti ogni giorno.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "L'ansia è presente quasi ogni giorno da settimane o mesi e pesa sulla tua vita.",
      "Hai attacchi di panico.",
      "Le cure non stanno funzionando.",
      "Usi alcol o altre sostanze per calmarti.",
    ],
    urgent: [
      "Hai pensieri di farti del male o di toglierti la vita: chiedi aiuto subito, anche chiamando il 112.",
      "Hai per la prima volta un dolore al petto oppressivo o fiato corto: non dare per scontato che sia ansia, chiama il 112.",
    ],
  },

  prevention: [
    "Coltiva relazioni e attività che ti fanno stare bene.",
    "Dormi a sufficienza e fai attività fisica.",
    "Limita alcol e caffeina.",
    "Chiedi aiuto presto, quando l'ansia inizia a pesare.",
  ],

  specialist: {
    id: "psicologo",
    why: "Il medico di base è un buon punto di partenza. Lo psicologo o psicoterapeuta offre la terapia; lo psichiatra valuta i casi in cui servono farmaci.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Ansia nell'adulto (disturbo d'ansia generalizzata)",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/a/ansia-nell-adulto-disturbo-d-ansia-generalizzata-dag",
      lang: "it",
    },
    {
      publisher: "Ministero della Salute",
      title: "Salute mentale",
      url: "https://www.salute.gov.it/new/it/tema/salute-mentale/",
      lang: "it",
    },
    {
      publisher: "NHS",
      title: "Generalised anxiety disorder (GAD)",
      url: "https://www.nhs.uk/mental-health/conditions/generalised-anxiety-disorder-gad/",
      lang: "en",
    },
    { publisher: "MedlinePlus", title: "Anxiety", url: "https://medlineplus.gov/anxiety.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["preoccupazione", "irrequietezza"],
    otherSymptoms: [
      "palpitazioni",
      "difficolta-concentrazione",
      "difficolta-addormentarsi",
      "tensione-collo-spalle",
      "attacchi-panico",
      "stanchezza",
      "irritabilita",
      "capogiri",
    ],
    moreLikelyIf: [
      "La preoccupazione riguarda tante cose diverse ed è presente quasi ogni giorno.",
      "I sintomi durano da mesi e peggiorano nei periodi di stress.",
    ],
    lessLikelyIf: [
      "Il batticuore compare con lo sforzo o con svenimenti: va controllato il cuore.",
      "Sei dimagrito senza motivo, sudi molto e hai tremori: va controllata la tiroide.",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
