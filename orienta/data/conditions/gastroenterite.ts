import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "gastroenterite",
  name: "Gastroenterite",
  aliases: ["influenza intestinale", "virus intestinale", "norovirus", "diarrea e vomito"],
  areas: ["digestione"],
  bodyZones: ["stomaco", "pancia"],

  overview:
    "La gastroenterite è un'infiammazione di stomaco e intestino, causata più spesso da virus come norovirus e rotavirus e a volte da batteri presenti in cibi contaminati. Provoca diarrea, vomito e crampi: di solito passa in pochi giorni e la cosa più importante è bere a sufficienza.",

  animation: {
    scene: "infezione-virale",
    params: { virus: "norovirus", sede: "intestino" },
    captions: [
      "Il norovirus si prende con mani, cibi o superfici contaminate: ne bastano pochissime particelle.",
      "Nell'intestino si aggancia alle cellule che assorbono acqua e nutrienti.",
      "Le cellule infettate funzionano male: l'intestino perde liquidi e arrivano diarrea, crampi e a volte vomito.",
      "Il sistema immunitario elimina il virus in pochi giorni. Intanto la cosa più importante è reintegrare i liquidi.",
    ],
  },

  history: {
    nameOrigin:
      "Dal greco «gaster», stomaco, ed «enteron», intestino, più il suffisso «-ite», infiammazione. Il nome popolare «influenza intestinale» è improprio: i virus dell'influenza non c'entrano.",
    events: [
      {
        when: "1968",
        text: "Un'epidemia di vomito e diarrea colpisce una scuola di Norwalk, in Ohio: il virus responsabile prenderà il nome di Norwalk, e poi di norovirus.",
      },
      {
        when: "1972",
        text: "Albert Kapikian identifica il virus di Norwalk al microscopio elettronico: è il primo virus riconosciuto come causa di gastroenterite.",
      },
      {
        when: "1973",
        text: "In Australia Ruth Bishop e il suo gruppo scoprono il rotavirus, la causa più frequente di gastroenterite grave nei bambini piccoli.",
      },
      {
        when: "Anni '70",
        text: "Si diffonde la soluzione di reidratazione orale, fatta di acqua, zuccheri e sali. Nel 1978 la rivista The Lancet la definisce forse il progresso medico più importante del secolo.",
      },
      {
        when: "2006",
        text: "Arrivano i vaccini contro il rotavirus, oggi offerti gratuitamente ai neonati nel calendario vaccinale italiano.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Una famiglia e il virus che passa di mano in mano",
      story:
        "Dopo una festa di compleanno, Tommaso, 5 anni, vomita più volte e ha la diarrea. Il giorno dopo si ammalano anche i genitori. Bevono a piccoli sorsi soluzioni reidratanti, si lavano spesso le mani e puliscono il bagno con candeggina diluita. In tre giorni stanno tutti meglio.",
      lesson:
        "Il norovirus si diffonde facilmente: lavarsi le mani con acqua e sapone è più efficace del solo gel alcolico. La priorità è non disidratarsi.",
    },
  ],

  causes: [
    "Virus, soprattutto il norovirus negli adulti e il rotavirus nei bambini piccoli.",
    "Batteri come Salmonella, Campylobacter o alcuni ceppi di Escherichia coli, spesso da cibi contaminati.",
    "Più di rado parassiti, ad esempio bevendo acqua non potabile in viaggio.",
  ],
  riskFactors: [
    "Neonati e bambini piccoli, che si disidratano più in fretta.",
    "Età avanzata.",
    "Difese immunitarie basse.",
    "Vivere o lavorare in comunità come asili, scuole e residenze per anziani.",
    "Viaggi in Paesi con scarse condizioni igieniche.",
  ],

  symptoms: {
    typical: ["Diarrea", "Nausea e vomito", "Crampi alla pancia", "Febbre non alta"],
    lessCommon: [
      "Mal di testa e dolori muscolari",
      "Poco appetito",
      "Segni di disidratazione: sete, urine scure e scarse, capogiri",
    ],
  },

  treatments: {
    options: [
      {
        title: "Bere tanto, a piccoli sorsi",
        text: "È la cura principale. L'acqua e soprattutto le soluzioni reidratanti, che trovi in farmacia, reintegrano acqua e sali.",
      },
      {
        title: "Mangiare quando te la senti",
        text: "Comincia con cibi semplici e poco grassi, evitando fritti e piccanti. Ai neonati continua a dare il latte materno o artificiale.",
      },
      {
        title: "Farmaci per i sintomi",
        text: "Il farmacista può consigliarti un antidolorifico o, per gli adulti e per poche ore, un farmaco contro la diarrea. Non darli ai bambini sotto i 12 anni senza il parere del medico.",
      },
      {
        title: "Antibiotici solo in casi particolari",
        text: "Non servono per le forme virali. Il medico li valuta in alcune infezioni batteriche.",
      },
    ],
    selfCare: [
      "Evita succhi di frutta e bibite gassate: possono peggiorare la diarrea.",
      "Resta a casa fino a 48 ore dopo l'ultimo episodio di vomito o diarrea.",
      "Lavati le mani con acqua e sapone, soprattutto dopo il bagno e prima di toccare il cibo.",
      "Finché sei malato, non preparare da mangiare per altre persone.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Hai segni di disidratazione che non migliorano con le soluzioni reidratanti.",
      "Vomiti di continuo e non riesci a trattenere i liquidi.",
      "La diarrea dura più di 7 giorni o il vomito più di 2.",
      "C'è sangue nella diarrea.",
      "Si tratta di un bambino sotto i 12 mesi, o di un bambino che smette di bere o bagna pochi pannolini.",
    ],
    urgent: [
      "Vomiti sangue o materiale scuro simile a fondi di caffè.",
      "Hai un dolore alla pancia improvviso e fortissimo.",
      "Sei confuso o molto debole, oppure pelle e labbra sono pallide, grigie o bluastre.",
      "Respiri con grande fatica.",
      "Hai collo rigido e fastidio alla luce, o un mal di testa improvviso e forte.",
    ],
  },

  prevention: [
    "Lavati spesso le mani con acqua e sapone.",
    "Lava frutta e verdura, cuoci bene carne e uova e conserva i cibi in frigorifero.",
    "In viaggio bevi acqua in bottiglie sigillate.",
    "Per i neonati c'è il vaccino contro il rotavirus, gratuito nel calendario vaccinale.",
  ],

  specialist: {
    id: "medico-di-base",
    why: "Di solito si cura a casa. Il medico di base o il pediatra valutano i casi con disidratazione, sangue nelle feci o sintomi che durano.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Gastroenteriti",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/g/gastroenteriti",
      lang: "it",
    },
    {
      publisher: "NHS",
      title: "Diarrhoea and vomiting",
      url: "https://www.nhs.uk/symptoms/diarrhoea-and-vomiting/",
      lang: "en",
    },
    { publisher: "NHS", title: "Norovirus (vomiting bug)", url: "https://www.nhs.uk/conditions/norovirus/", lang: "en" },
    { publisher: "MedlinePlus", title: "Gastroenteritis", url: "https://medlineplus.gov/gastroenteritis.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["diarrea", "vomito", "nausea", "mal-di-pancia"],
    otherSymptoms: ["febbre", "stanchezza", "perdita-appetito", "mal-di-testa", "bocca-secca"],
    moreLikelyIf: [
      "Altre persone vicino a te hanno gli stessi sintomi.",
      "I sintomi sono comparsi all'improvviso, da poche ore o pochi giorni.",
      "Hai mangiato qualcosa di sospetto o sei stato in viaggio.",
    ],
    lessLikelyIf: [
      "Il dolore è fisso in basso a destra e peggiora camminando: va escluso un problema come l'appendicite.",
      "La diarrea va avanti da settimane.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
