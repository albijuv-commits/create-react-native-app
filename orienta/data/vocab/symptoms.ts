import type { BodyZoneId } from "./body";

/**
 * Vocabolario controllato dei sintomi. Le condizioni lo usano per i "sintomi chiave"
 * che l'intervista (fase 3) passa al modello e al motore a regole.
 * - `label`: come lo mostriamo alla persona.
 * - `synonyms`: espressioni comuni, in minuscolo, per riconoscerlo in un testo libero.
 * - `zones`: zone della mappa del corpo collegate.
 *
 * I segnali d'allarme (dolore al petto oppressivo, difficoltà a respirare, ecc.) NON stanno qui:
 * sono regole deterministiche separate.
 */
export const SYMPTOMS = [
  // Generali
  { id: "febbre", label: "Febbre", synonyms: ["febbre", "temperatura alta", "febbricola", "ho la febbre"], zones: ["tutto-il-corpo"] },
  { id: "brividi", label: "Brividi", synonyms: ["brividi", "tremo dal freddo"], zones: ["tutto-il-corpo"] },
  { id: "stanchezza", label: "Stanchezza", synonyms: ["stanchezza", "stanco", "stanca", "spossatezza", "affaticamento", "senza forze", "debolezza"], zones: ["tutto-il-corpo"] },
  { id: "dolori-muscolari", label: "Dolori muscolari diffusi", synonyms: ["dolori muscolari", "ossa rotte", "dolori alle ossa", "dolori dappertutto", "mialgie"], zones: ["tutto-il-corpo"] },
  { id: "malessere", label: "Malessere generale", synonyms: ["malessere", "mi sento a pezzi", "mi sento male"], zones: ["tutto-il-corpo"] },
  { id: "perdita-appetito", label: "Poco appetito", synonyms: ["non ho fame", "inappetenza", "poco appetito"], zones: ["stomaco"] },
  { id: "sudorazione", label: "Sudorazione abbondante", synonyms: ["sudo tanto", "sudorazione", "sudato", "sudata"], zones: ["pelle"] },
  { id: "capogiri", label: "Capogiri", synonyms: ["capogiri", "giramenti di testa", "testa che gira", "sbandamento", "vertigini"], zones: ["testa"] },
  { id: "pallore", label: "Pallore", synonyms: ["pallido", "pallida", "pallore"], zones: ["pelle"] },
  { id: "fiato-corto", label: "Fiato corto o affanno", synonyms: ["fiato corto", "affanno", "fiatone", "respiro corto"], zones: ["petto"] },
  { id: "palpitazioni", label: "Battito accelerato o palpitazioni", synonyms: ["palpitazioni", "cuore accelerato", "batticuore", "tachicardia"], zones: ["petto"] },
  { id: "sete-intensa", label: "Molta sete", synonyms: ["tanta sete", "sempre sete", "sete intensa", "molta sete"], zones: ["bocca"] },
  { id: "bocca-secca", label: "Bocca secca", synonyms: ["bocca secca", "bocca asciutta"], zones: ["bocca"] },
  { id: "urine-scure", label: "Urine scure o scarse", synonyms: ["urine scure", "pipì scura", "urino poco"], zones: ["basso-ventre"] },
  { id: "urinare-molto", label: "Urinare molto, anche di notte", synonyms: ["urino tanto", "faccio tanta pipì", "mi alzo di notte per urinare"], zones: ["basso-ventre"] },
  { id: "aumento-peso", label: "Aumento di peso senza motivo", synonyms: ["ingrassato", "ingrassata", "aumento di peso", "preso peso"], zones: ["tutto-il-corpo"] },
  { id: "perdita-peso", label: "Perdita di peso senza motivo", synonyms: ["dimagrito", "dimagrita", "perdo peso", "perdita di peso"], zones: ["tutto-il-corpo"] },
  { id: "freddo-intolleranza", label: "Sentire spesso freddo", synonyms: ["sento sempre freddo", "freddoloso", "freddolosa", "ho sempre freddo"], zones: ["tutto-il-corpo"] },
  { id: "pelle-calda", label: "Pelle molto calda", synonyms: ["pelle bollente", "pelle calda", "scotto"], zones: ["pelle"] },
  { id: "crampi-muscolari", label: "Crampi muscolari", synonyms: ["crampi", "crampo"], zones: ["gambe"] },
  { id: "confusione", label: "Confusione o difficoltà a ragionare", synonyms: ["confuso", "confusa", "confusione", "disorientato", "disorientata"], zones: ["testa"] },
  { id: "sonnolenza", label: "Sonnolenza insolita", synonyms: ["sonnolenza", "assonnato", "assonnata", "intontito", "intontita"], zones: ["testa"] },
  { id: "linfonodi-gonfi", label: "Ghiandole gonfie nel collo", synonyms: ["ghiandole gonfie", "linfonodi gonfi", "linfonodi ingrossati"], zones: ["collo"] },
  { id: "formicolii", label: "Formicolio a mani o piedi", synonyms: ["formicolio", "formicolii", "intorpidimento", "piedi addormentati"], zones: ["mani", "piedi"] },
  { id: "ferite-lente", label: "Ferite che guariscono lentamente", synonyms: ["ferite che non guariscono", "tagli che non si chiudono"], zones: ["pelle"] },
  { id: "vista-offuscata", label: "Vista offuscata", synonyms: ["vista offuscata", "vedo sfocato", "vista annebbiata"], zones: ["occhi"] },
  { id: "capelli-fragili", label: "Capelli fragili o che cadono", synonyms: ["capelli fragili", "perdo i capelli", "caduta dei capelli"], zones: ["testa"] },

  // Testa
  { id: "mal-di-testa", label: "Mal di testa", synonyms: ["mal di testa", "cefalea", "dolore alla testa"], zones: ["testa"] },
  { id: "mal-di-testa-pulsante", label: "Mal di testa pulsante, spesso da un lato", synonyms: ["pulsante", "mi martella la testa", "metà della testa", "da un lato della testa", "emicrania"], zones: ["testa"] },
  { id: "mal-di-testa-a-fascia", label: "Mal di testa come una fascia stretta", synonyms: ["cerchio alla testa", "fascia stretta", "morsa alla testa", "pressione sulla testa"], zones: ["testa"] },
  { id: "mal-di-testa-mattino", label: "Mal di testa al risveglio", synonyms: ["mal di testa al mattino", "mal di testa appena sveglio", "mal di testa al risveglio"], zones: ["testa"] },
  { id: "aura", label: "Disturbi della vista prima del mal di testa", synonyms: ["aura", "lampi di luce", "linee a zig zag", "macchie luminose"], zones: ["occhi", "testa"] },
  { id: "fastidio-luce-rumori", label: "Fastidio per luce o rumori", synonyms: ["la luce mi dà fastidio", "fotofobia", "i rumori mi danno fastidio"], zones: ["testa"] },
  { id: "nausea", label: "Nausea", synonyms: ["nausea", "voglia di vomitare", "stomaco sottosopra"], zones: ["stomaco"] },
  { id: "vomito", label: "Vomito", synonyms: ["vomito", "ho vomitato", "ho rimesso"], zones: ["stomaco"] },
  { id: "dolore-viso", label: "Dolore o pressione al viso", synonyms: ["dolore al viso", "pressione agli zigomi", "dolore alla fronte", "dolore ai seni nasali"], zones: ["naso"] },
  { id: "dolore-mandibola", label: "Dolore alla mandibola o alle tempie", synonyms: ["dolore alla mandibola", "dolore alla mascella", "dolore alle tempie"], zones: ["bocca"] },
  { id: "digrignare", label: "Digrignare o stringere i denti", synonyms: ["digrigno i denti", "stringo i denti", "bruxismo"], zones: ["bocca"] },
  { id: "denti-consumati", label: "Denti consumati o sensibili", synonyms: ["denti consumati", "denti sensibili", "denti scheggiati"], zones: ["bocca"] },

  // Naso, gola, orecchie
  { id: "naso-chiuso", label: "Naso chiuso", synonyms: ["naso chiuso", "naso tappato", "congestione nasale", "non respiro dal naso"], zones: ["naso"] },
  { id: "naso-che-cola", label: "Naso che cola", synonyms: ["naso che cola", "naso che gocciola", "rinorrea", "moccio"], zones: ["naso"] },
  { id: "starnuti", label: "Starnuti", synonyms: ["starnuti", "starnutisco"], zones: ["naso"] },
  { id: "prurito-naso", label: "Prurito al naso o al palato", synonyms: ["prurito al naso", "mi pizzica il naso", "prurito al palato"], zones: ["naso"] },
  { id: "muco-denso", label: "Muco denso, giallo o verde", synonyms: ["muco verde", "muco giallo", "muco denso"], zones: ["naso"] },
  { id: "perdita-olfatto", label: "Olfatto o gusto ridotti", synonyms: ["non sento gli odori", "non sento i sapori", "perdita dell'olfatto", "perdita del gusto"], zones: ["naso"] },
  { id: "mal-di-gola", label: "Mal di gola", synonyms: ["mal di gola", "gola infiammata", "gola irritata", "bruciore alla gola"], zones: ["collo"] },
  { id: "difficolta-deglutire", label: "Dolore o difficoltà a deglutire", synonyms: ["fatico a deglutire", "male a deglutire", "fatico a inghiottire"], zones: ["collo"] },
  { id: "tonsille-gonfie", label: "Tonsille gonfie o con placche", synonyms: ["tonsille gonfie", "placche in gola", "puntini bianchi in gola"], zones: ["collo"] },
  { id: "raucedine", label: "Voce rauca", synonyms: ["raucedine", "voce rauca", "abbassamento di voce"], zones: ["collo"] },
  { id: "dolore-orecchio", label: "Mal d'orecchio", synonyms: ["mal d'orecchio", "dolore all'orecchio", "otalgia"], zones: ["orecchie"] },
  { id: "orecchio-ovattato", label: "Orecchio ovattato o udito ridotto", synonyms: ["orecchio tappato", "orecchio ovattato", "sento meno"], zones: ["orecchie"] },
  { id: "secrezione-orecchio", label: "Liquido che esce dall'orecchio", synonyms: ["esce liquido dall'orecchio", "pus dall'orecchio"], zones: ["orecchie"] },
  { id: "russare", label: "Russare forte", synonyms: ["russo", "russare", "russa forte"], zones: ["collo"] },
  { id: "pause-respiro-sonno", label: "Pause nel respiro durante il sonno", synonyms: ["smetto di respirare quando dormo", "apnee", "pause nel respiro"], zones: ["collo"] },

  // Occhi
  { id: "occhi-rossi", label: "Occhi rossi", synonyms: ["occhi rossi", "occhio rosso", "occhi arrossati"], zones: ["occhi"] },
  { id: "prurito-occhi", label: "Prurito agli occhi", synonyms: ["prurito agli occhi", "occhi che prudono"], zones: ["occhi"] },
  { id: "lacrimazione", label: "Occhi che lacrimano", synonyms: ["lacrimazione", "occhi che lacrimano", "occhi acquosi"], zones: ["occhi"] },
  { id: "secrezione-occhi", label: "Secrezioni o crosticine agli occhi", synonyms: ["cispa", "occhi appiccicati", "crosticine sulle ciglia"], zones: ["occhi"] },
  { id: "sabbia-occhi", label: "Sensazione di sabbia negli occhi", synonyms: ["sabbia negli occhi", "bruciore agli occhi"], zones: ["occhi"] },
  { id: "palpebre-gonfie", label: "Palpebre gonfie", synonyms: ["palpebre gonfie", "occhi gonfi"], zones: ["occhi"] },

  // Petto e respiro
  { id: "tosse-secca", label: "Tosse secca", synonyms: ["tosse secca", "tosse stizzosa", "tosse irritativa"], zones: ["petto", "collo"] },
  { id: "tosse-catarro", label: "Tosse con catarro", synonyms: ["tosse grassa", "catarro", "tosse con catarro"], zones: ["petto"] },
  { id: "respiro-sibilante", label: "Fischio o sibilo quando respiri", synonyms: ["fischio quando respiro", "sibilo", "respiro sibilante"], zones: ["petto"] },
  { id: "petto-costretto", label: "Petto che si stringe quando respiri", synonyms: ["petto stretto", "costrizione al petto"], zones: ["petto"] },
  { id: "dolore-petto-tosse", label: "Fastidio al petto quando tossisci", synonyms: ["male al petto quando tossisco"], zones: ["petto"] },
  { id: "bruciore-petto", label: "Bruciore dietro lo sterno", synonyms: ["bruciore di stomaco", "acidità", "pirosi", "bruciore dietro lo sterno"], zones: ["petto", "stomaco"] },
  { id: "rigurgito-acido", label: "Rigurgito acido in bocca", synonyms: ["rigurgito", "sapore acido in bocca", "reflusso"], zones: ["petto", "bocca"] },

  // Pancia
  { id: "mal-di-pancia", label: "Mal di pancia o crampi addominali", synonyms: ["mal di pancia", "crampi alla pancia", "dolore addominale", "coliche"], zones: ["pancia"] },
  { id: "diarrea", label: "Diarrea", synonyms: ["diarrea", "scariche", "feci liquide"], zones: ["pancia"] },
  { id: "stitichezza", label: "Stitichezza", synonyms: ["stitichezza", "stitico", "stitica", "non vado di corpo"], zones: ["pancia"] },
  { id: "gonfiore-pancia", label: "Pancia gonfia o aria", synonyms: ["pancia gonfia", "gonfiore addominale", "aria nella pancia", "meteorismo"], zones: ["pancia"] },
  { id: "alvo-alterno", label: "Diarrea e stitichezza che si alternano", synonyms: ["a volte diarrea a volte stitichezza", "alvo alterno"], zones: ["pancia"] },

  // Vie urinarie
  { id: "bruciore-urinare", label: "Bruciore quando urini", synonyms: ["bruciore quando urino", "brucia la pipì", "dolore a urinare"], zones: ["basso-ventre"] },
  { id: "urinare-spesso", label: "Stimolo frequente e urgente di urinare", synonyms: ["urino spesso", "vado spesso in bagno", "stimolo continuo", "urgenza di urinare"], zones: ["basso-ventre"] },
  { id: "urine-torbide", label: "Urine torbide o con odore forte", synonyms: ["urine torbide", "pipì torbida", "pipì che puzza"], zones: ["basso-ventre"] },
  { id: "sangue-urine", label: "Sangue nelle urine", synonyms: ["sangue nelle urine", "pipì rossa", "urine rosa"], zones: ["basso-ventre"] },
  { id: "dolore-basso-ventre", label: "Dolore o peso al basso ventre", synonyms: ["dolore al basso ventre", "peso sopra il pube"], zones: ["basso-ventre"] },

  // Pelle
  { id: "prurito-pelle", label: "Prurito alla pelle", synonyms: ["prurito", "mi gratto", "pelle che prude"], zones: ["pelle"] },
  { id: "pelle-secca", label: "Pelle secca", synonyms: ["pelle secca", "pelle che tira", "pelle screpolata"], zones: ["pelle"] },
  { id: "chiazze-rosse", label: "Chiazze rosse sulla pelle", synonyms: ["chiazze rosse", "macchie rosse", "arrossamento della pelle", "eritema"], zones: ["pelle"] },
  { id: "pomfi", label: "Rilievi che compaiono e scompaiono (pomfi)", synonyms: ["pomfi", "ponfi", "bolle sulla pelle", "orticaria"], zones: ["pelle"] },
  { id: "gonfiore-pelle", label: "Gonfiore di palpebre, mani o piedi", synonyms: ["mani gonfie", "piedi gonfi", "gonfiore della pelle"], zones: ["pelle"] },
  { id: "vescicole", label: "Piccole vesciche piene di liquido", synonyms: ["vescicole", "vesciche", "bollicine d'acqua"], zones: ["pelle"] },
  { id: "vescicole-diffuse", label: "Puntini rossi che diventano vescicole e croste", synonyms: ["puntini rossi su tutto il corpo", "vescicole su tutto il corpo", "varicella"], zones: ["pelle", "tutto-il-corpo"] },
  { id: "vescicole-labbra", label: "Vescicole sul labbro", synonyms: ["bollicine sul labbro", "febbre sul labbro", "herpes"], zones: ["bocca"] },
  { id: "formicolio-labbra", label: "Formicolio o bruciore sul labbro", synonyms: ["formicolio al labbro", "mi pizzica il labbro"], zones: ["bocca"] },
  { id: "brufoli", label: "Brufoli e punti neri", synonyms: ["brufoli", "punti neri", "foruncoli", "pustole", "acne"], zones: ["pelle"] },
  { id: "placche-squamose", label: "Chiazze spesse con squame argentee", synonyms: ["squame", "placche sulla pelle", "pelle che si sfoglia"], zones: ["pelle"] },
  { id: "unghie-alterate", label: "Unghie con puntini o ispessite", synonyms: ["unghie ispessite", "puntini sulle unghie"], zones: ["mani", "piedi"] },
  { id: "rash-da-contatto", label: "Irritazione dove la pelle ha toccato una sostanza", synonyms: ["dopo aver toccato", "reazione al metallo", "reazione all'orologio", "allergia al nichel"], zones: ["pelle", "mani"] },

  // Muscoli e articolazioni
  { id: "mal-di-schiena", label: "Mal di schiena", synonyms: ["mal di schiena", "lombalgia", "colpo della strega", "schiena bloccata"], zones: ["schiena-bassa", "schiena-alta"] },
  { id: "dolore-gamba-irradiato", label: "Dolore che scende lungo la gamba", synonyms: ["sciatica", "dolore che scende nella gamba", "nervo sciatico"], zones: ["gambe", "schiena-bassa"] },
  { id: "rigidita", label: "Rigidità o movimenti limitati", synonyms: ["rigido", "rigida", "bloccato", "bloccata", "rigidità"], zones: ["schiena-bassa", "spalle"] },
  { id: "dolore-dopo-trauma", label: "Dolore dopo una storta o un colpo", synonyms: ["storta", "slogatura", "distorsione", "ho girato la caviglia"], zones: ["piedi", "gambe", "mani"] },
  { id: "gonfiore-articolazione", label: "Gonfiore attorno a un'articolazione", synonyms: ["caviglia gonfia", "ginocchio gonfio", "polso gonfio"], zones: ["piedi", "gambe", "mani"] },
  { id: "livido", label: "Livido", synonyms: ["livido", "ematoma"], zones: ["pelle"] },
  { id: "difficolta-carico", label: "Difficoltà a camminare o a caricare peso", synonyms: ["non riesco ad appoggiare il piede", "zoppico"], zones: ["piedi", "gambe"] },
  { id: "dolore-tendine", label: "Dolore a un tendine quando ti muovi", synonyms: ["tendine", "gomito del tennista", "dolore al tallone", "dolore alla spalla quando alzo il braccio"], zones: ["braccia", "spalle", "piedi", "mani"] },
  { id: "tensione-collo-spalle", label: "Tensione a collo e spalle", synonyms: ["cervicale", "collo teso", "spalle contratte"], zones: ["nuca", "spalle"] },

  // Mente e sonno
  { id: "difficolta-addormentarsi", label: "Fatica ad addormentarti", synonyms: ["non riesco ad addormentarmi", "non riesco a dormire", "insonnia"], zones: ["testa"] },
  { id: "risvegli-notturni", label: "Risvegli frequenti o troppo presto", synonyms: ["mi sveglio di notte", "mi sveglio presto", "sonno interrotto"], zones: ["testa"] },
  { id: "sonno-non-ristoratore", label: "Ti svegli stanco anche dopo aver dormito", synonyms: ["sonno non riposante", "mi sveglio stanco", "mi sveglio stanca"], zones: ["testa"] },
  { id: "sonnolenza-diurna", label: "Sonnolenza durante il giorno", synonyms: ["colpi di sonno", "mi addormento di giorno", "sonno di giorno"], zones: ["testa"] },
  { id: "preoccupazione", label: "Preoccupazione costante e difficile da controllare", synonyms: ["ansia", "preoccupato", "preoccupata", "ansioso", "ansiosa", "apprensione"], zones: ["testa"] },
  { id: "irrequietezza", label: "Irrequietezza o tensione", synonyms: ["irrequieto", "irrequieta", "nervoso", "nervosa", "agitato", "agitata"], zones: ["testa"] },
  { id: "irritabilita", label: "Irritabilità", synonyms: ["irritabile", "scatto per niente"], zones: ["testa"] },
  { id: "umore-basso", label: "Umore triste o vuoto quasi ogni giorno", synonyms: ["triste", "giù di morale", "depresso", "depressa", "mi sento vuoto", "mi sento vuota"], zones: ["testa"] },
  { id: "perdita-interesse", label: "Perdita di interesse o di piacere", synonyms: ["niente mi interessa", "non provo piacere", "apatia"], zones: ["testa"] },
  { id: "difficolta-concentrazione", label: "Difficoltà di concentrazione", synonyms: ["non riesco a concentrarmi", "testa annebbiata", "distratto", "distratta"], zones: ["testa"] },
  { id: "attacchi-panico", label: "Attacchi improvvisi di paura intensa", synonyms: ["attacco di panico", "panico"], zones: ["petto", "testa"] },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  synonyms: readonly string[];
  zones: readonly BodyZoneId[];
}>;

export type SymptomId = (typeof SYMPTOMS)[number]["id"];
export const SYMPTOM_IDS = SYMPTOMS.map((s) => s.id) as [SymptomId, ...SymptomId[]];

export function symptomLabel(id: SymptomId): string {
  return SYMPTOMS.find((s) => s.id === id)?.label ?? id;
}
