import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "influenza",
  name: "Influenza",
  aliases: ["influenza stagionale", "febbre influenzale"],
  areas: ["respiro", "corpo"],
  bodyZones: ["tutto-il-corpo", "collo", "petto"],

  overview:
    "L'influenza è un'infezione delle vie respiratorie causata dai virus influenzali, che circolano soprattutto in inverno. Arriva all'improvviso con febbre alta, dolori e grande stanchezza e di solito passa in circa una settimana, ma nelle persone fragili può dare complicazioni serie.",

  animation: {
    scene: "infezione-virale",
    params: { virus: "influenza", sede: "gola" },
    captions: [
      "Il virus dell'influenza arriva con le goccioline di tosse e starnuti di una persona malata.",
      "Le sue proteine di superficie, emoagglutinina e neuraminidasi, gli permettono di agganciarsi alle cellule delle vie respiratorie.",
      "In poche ore si moltiplica: le cellule infettate liberano nuovi virus e il corpo reagisce con la febbre.",
      "Anticorpi e globuli bianchi fermano l'infezione. Il vaccino insegna in anticipo al corpo a riconoscere il virus.",
    ],
  },

  history: {
    nameOrigin:
      "Il nome è italiano: nel Medioevo le epidemie che tornavano ogni inverno venivano attribuite all'«influenza» degli astri o del freddo. Dall'italiano la parola è passata a molte altre lingue, compreso l'inglese.",
    events: [
      {
        when: "1918-1920",
        text: "La pandemia detta «spagnola» colpisce circa un terzo della popolazione mondiale e causa decine di milioni di morti.",
      },
      {
        when: "1933",
        text: "Nel Regno Unito Wilson Smith, Christopher Andrewes e Patrick Laidlaw isolano per la prima volta il virus dell'influenza umana.",
      },
      {
        when: "Anni '40",
        text: "Arrivano i primi vaccini antinfluenzali, usati all'inizio per i soldati durante la Seconda guerra mondiale.",
      },
      {
        when: "1952",
        text: "Nasce la rete di sorveglianza dell'Organizzazione mondiale della sanità, che ancora oggi indica ogni anno quali ceppi inserire nel vaccino.",
      },
      {
        when: "1999",
        text: "Vengono approvati i primi antivirali che bloccano la neuraminidasi, una proteina che il virus usa per diffondersi.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Giulia, 72 anni: perché il vaccino conta",
      story:
        "Giulia ha una bronchite cronica. A gennaio le sale all'improvviso la febbre alta, con dolori in tutto il corpo. Il terzo giorno ha il fiato corto e chiama il medico, che la visita e la invia in ospedale per una polmonite. Dopo la guarigione decide di vaccinarsi ogni autunno.",
      lesson:
        "Con l'età e con le malattie croniche l'influenza può complicarsi. Il fiato corto va segnalato subito, e il vaccino annuale riduce il rischio di forme gravi.",
    },
  ],

  causes: [
    "I virus influenzali di tipo A e B, che cambiano un po' ogni anno: per questo il vaccino va ripetuto ogni autunno.",
    "Il contagio avviene con le goccioline di tosse e starnuti e con le mani che toccano superfici contaminate. Si è più contagiosi nei primi giorni di malattia.",
  ],
  riskFactors: [
    "Età avanzata: in Italia il vaccino è offerto gratuitamente dai 60 anni.",
    "Gravidanza.",
    "Malattie croniche di cuore, polmoni, reni o fegato, e diabete.",
    "Difese immunitarie basse.",
    "Primi anni di vita.",
  ],

  symptoms: {
    typical: [
      "Febbre alta comparsa all'improvviso",
      "Dolori muscolari e alle articolazioni",
      "Stanchezza intensa",
      "Tosse secca",
      "Mal di gola",
      "Mal di testa",
    ],
    lessCommon: [
      "Brividi e sudorazione",
      "Difficoltà a dormire",
      "Poco appetito",
      "Nei bambini: mal d'orecchio, occhi arrossati, ghiandole gonfie, a volte nausea, vomito o diarrea",
    ],
  },

  treatments: {
    options: [
      { title: "Riposo e liquidi", text: "Riposa, dormi e bevi molto: l'urina dovrebbe restare chiara." },
      {
        title: "Antifebbrili e antidolorifici",
        text: "Abbassano la febbre e alleviano i dolori. Chiedi al medico o al farmacista quale scegliere e non prendere insieme più prodotti che contengono lo stesso principio attivo.",
      },
      {
        title: "Antivirali su prescrizione",
        text: "In alcuni casi, soprattutto nelle persone a rischio, il medico può prescrivere un antivirale da iniziare presto.",
      },
      {
        title: "Antibiotici solo se servono",
        text: "Non agiscono sul virus: il medico li prescrive solo se compare un'infezione batterica, come una polmonite.",
      },
    ],
    selfCare: [
      "Resta a casa finché hai la febbre, per non contagiare gli altri.",
      "Non dare acido acetilsalicilico (aspirina) a bambini e ragazzi sotto i 16 anni.",
      "Annota la temperatura e come cambiano i sintomi: ti sarà utile se senti il medico.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Hai 65 anni o più, sei in gravidanza o hai partorito da poco.",
      "Hai una malattia cronica o difese immunitarie basse.",
      "Ti senti molto male o hai il fiato corto.",
      "Dopo 7 giorni non migliori, oppure migliori e poi peggiori di nuovo.",
      "Sei preoccupato per i sintomi di un neonato o di un bambino.",
    ],
    urgent: [
      "Hai un dolore al petto improvviso.",
      "Respiri con grande fatica: boccheggi, ti senti soffocare o non riesci a parlare.",
      "Tossisci sangue.",
      "Sei confuso, molto sonnolento o hai convulsioni.",
    ],
  },

  prevention: [
    "Vaccinati ogni autunno, soprattutto se hai 60 anni o più, una malattia cronica o sei in gravidanza: per queste persone il vaccino è gratuito.",
    "Lavati spesso le mani.",
    "Copri bocca e naso quando tossisci o starnutisci, con un fazzoletto o nel gomito.",
    "Se hai sintomi, resta a casa ed evita il contatto con persone fragili.",
  ],

  specialist: {
    id: "medico-di-base",
    why: "Il medico di base valuta chi è più a rischio, decide se servono antivirali e riconosce in tempo le complicazioni.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Influenza",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/i/influenza",
      lang: "it",
    },
    {
      publisher: "Ministero della Salute",
      title: "Influenza",
      url: "https://www.salute.gov.it/new/it/tema/influenza/",
      lang: "it",
    },
    { publisher: "NHS", title: "Flu", url: "https://www.nhs.uk/conditions/flu/", lang: "en" },
    { publisher: "MedlinePlus", title: "Flu", url: "https://medlineplus.gov/flu.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["febbre", "dolori-muscolari", "stanchezza", "tosse-secca"],
    otherSymptoms: ["mal-di-gola", "mal-di-testa", "brividi", "perdita-appetito", "naso-che-cola"],
    moreLikelyIf: [
      "La febbre è salita all'improvviso, nel giro di poche ore.",
      "Ti senti così stanco da non riuscire a fare le attività di tutti i giorni.",
      "È inverno e l'influenza circola nella tua zona.",
    ],
    lessLikelyIf: [
      "I sintomi riguardano solo il naso e sono comparsi lentamente.",
      "Hai fatto il vaccino antinfluenzale quest'anno: riduce il rischio, anche se non lo azzera.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
