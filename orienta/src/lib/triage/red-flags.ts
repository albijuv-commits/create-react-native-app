import { RED_FLAG_IDS, type RedFlagId } from "@data/emergency/red-flags";
import type { SymptomId } from "@data/vocab/symptoms";
import { normalizeText } from "@/lib/text/normalize";

/**
 * Controllo DETERMINISTICO dei segnali d'allarme. È codice, non AI: gira prima di ogni
 * chiamata al modello e dopo ogni risposta, sul browser e sul server. Se scatta, l'app
 * mostra la schermata Emergenza.
 *
 * Fonti del controllo:
 * - il testo libero, con regole su parole vicine (normalizzato: minuscolo, senza accenti);
 * - le voci spuntate nell'elenco «Hai uno di questi segnali?»;
 * - i sintomi già riconosciuti (per esempio la febbre, che rende grave il collo rigido).
 * In caso di dubbio la regola preferisce scattare: un falso allarme costa meno di un'emergenza persa.
 */
export interface RedFlagInput {
  text?: string;
  /** Segnali spuntati nell'elenco */
  checked?: readonly RedFlagId[];
  symptoms?: readonly SymptomId[];
}

interface Text {
  str: string;
  words: string[];
}

const has = (t: Text, re: RegExp) => re.test(t.str);

/** Vero se una parola che soddisfa `a` sta a non più di `n` parole da una che soddisfa `b` */
function near(t: Text, a: RegExp, b: RegExp, n: number): boolean {
  const ia = t.words.flatMap((w, i) => (a.test(w) ? [i] : []));
  if (!ia.length) return false;
  const ib = t.words.flatMap((w, i) => (b.test(w) ? [i] : []));
  return ia.some((i) => ib.some((j) => i !== j && Math.abs(i - j) <= n));
}

const CHEST = /^(petto|torace|sterno|cuore)$/;
const FEVER = /\b(febbre|febbricola|temperatura alta|febbrone)\b/;
const HEADACHE = /\b(mal di testa|cefalea|dolore alla testa|testa che scoppia|emicrania)\b/;

type Rule = (t: Text, ctx: { fever: boolean }) => boolean;

const RULES: Record<RedFlagId, Rule> = {
  // Dolore al petto oppressivo o che si irradia
  "dolore-petto": (t) =>
    has(t, /\binfarto\b/) ||
    near(t, /^(oppressione|morsa|stretta|macigno|schiacciamento)$/, CHEST, 3) ||
    (near(t, /^(dolore|dolori|male|peso|pressione|fitta|fitte)$/, CHEST, 3) &&
      (near(t, /^(opprim\w*|oppressiv\w*|schiacc\w*|stringe|stretta|morsa|macigno|peso)$/, CHEST, 6) ||
        has(t, /\b(irradi\w*|si estende|si allarga|braccio|braccia|mandibola|mascella)\b/))),

  // Difficoltà a respirare (non il naso chiuso)
  respiro: (t) =>
    has(t, /\b(non riesco|fatico|faccio fatica|fatica|difficolta|difficile|stento)( \w+){0,2} a respirare\b/) ||
    has(t, /\bnon respiro\b(?! (bene )?(dal|col|con il) naso)/) ||
    has(t, /\b(difficolta|insufficienza) respirator\w*\b|\brespir\w* (a|con) (fatica|difficolta)\b|\baffanno (anche )?a riposo\b/) ||
    has(t, /\b(mi manca l aria|manca l aria|fame d aria|soffoco|sto soffocando|senza fiato)\b/) ||
    has(t, /\blabbra (blu|bluastre|viola|violacee|cianotiche)\b|\bcianosi\b/),

  // Segni di ictus
  ictus: (t) =>
    has(t, /\b(ictus|paresi|paralisi)\b/) ||
    has(t, /\b(bocca|viso|faccia)( \w+){0,2} (storta|storto|cadente|cade|paralizzat\w*)\b/) ||
    has(t, /\b(non riesco|non riesce|fatico|fatica|difficolta)( \w+){0,2} a parlare\b/) ||
    has(t, /\b(parlo male|parla male|parla strano|biascic\w*|parole confuse|confonde le parole|non trovo le parole|non trova le parole)\b/) ||
    has(t, /\bnon (riesco|riesce) a muovere (il|la|un|una) (braccio|gamba|mano)\b/) ||
    (has(t, /\b(meta|lato) del (corpo|viso)\b/) && has(t, /\b(debol\w*|paralizz\w*|non si muove|addormentat\w*|insensibil\w*)\b/)),

  // Gonfiore di labbra, lingua o gola
  "gonfiore-gola": (t) =>
    has(t, /\b(anafilass\w*|anafilattic\w*|angioedema|edema della glottide)\b/) ||
    near(t, /^(labbr\w*|lingua)$/, /^gonf\w*$/, 3) ||
    has(t, /\b(gola che si chiude|si chiude la gola|mi si chiude la gola|chiusura della gola)\b/) ||
    (near(t, /^gola$/, /^gonf\w*$/, 3) && has(t, /\b(respir\w*|soffoc\w*|saliva)\b/)),

  // Mal di testa improvviso, il peggiore di sempre
  "mal-di-testa-improvviso": (t) =>
    has(t, /\b(peggior\w* mal di testa|mal di testa piu forte (della mia vita|di sempre|mai avuto)|peggiore della mia vita)\b/) ||
    (has(t, HEADACHE) &&
      has(t, /\b(improvvis\w*|all improvviso|di colpo|esplos\w*|fulmine|tuono|lampo)\b/) &&
      has(t, /\b(fort\w*|lancinant\w*|terribil\w*|atroce|insopportabil\w*|peggiore|mai avuto)\b/)),

  // Febbre alta con collo rigido, o macchie che non scompaiono premendo
  "febbre-meningite": (t, ctx) =>
    ((ctx.fever || has(t, FEVER)) &&
      has(t, /\b(collo rigido|rigidita (del|al) collo|nuca rigida|collo bloccato|non riesco a piegare (il collo|la testa))\b/)) ||
    has(t, /\bpetecchi\w*\b|\bmacchie (viola|violacee)\b/) ||
    (has(t, /\bmacchi\w*\b/) && has(t, /\bnon (scompai\w*|spariscono|sbiadiscono|vanno via)\b/) && has(t, /\b(prem\w*|bicchiere|vetro)\b/)),

  // Svenimento, perdita di coscienza, convulsioni (non la sensazione di svenire)
  "svenimento-convulsioni": (t) =>
    has(
      t,
      /\b(svenut\w*|svengo|svenimento|svenimenti|perso i sensi|perso conoscenza|perdita di (coscienza|conoscenza|sensi)|priv\w* di sensi|non risponde|convulsion\w*|crisi epilettic\w*|attacco epilettic\w*|crisi convulsiv\w*)\b/,
    ),

  // Sanguinamento abbondante, vomito con sangue, feci nere
  sanguinamento: (t) =>
    has(t, /\b(emorragi\w*|sangue che non si ferma|perdo (molto|tanto) sangue)\b/) ||
    has(t, /\bsanguin\w*( \w+){0,3} (abbondant\w*|tantissim\w*|non si ferma|non smette)\b/) ||
    has(t, /\bvomit\w*( \w+){0,3} sangue\b|\bsangue nel vomito\b|\bematemesi\b/) ||
    has(t, /\bfeci (nere|nerastre|picee|color catrame|come (il )?catrame)\b|\bmelena\b/),

  // Pensieri di farsi del male (meglio un falso allarme che un aiuto mancato)
  autolesionismo: (t) =>
    has(
      t,
      /\b(farmi del male|farmi male da sol\w*|uccidermi|ammazzarmi|suicid\w*|togliermi la vita|non voglio piu vivere|farla finita|tagliarmi|autolesion\w*|vorrei morire|voglio morire|meglio se fossi mort\w*|vorrei sparire per sempre)\b/,
    ),

  // Più persone in casa con mal di testa, nausea, sonnolenza: monossido di carbonio.
  // Una stufa o una caldaia nominata insieme ai sintomi basta; senza, servono mal di testa e un
  // secondo sintomo tipico in più persone (così una gastroenterite in famiglia non fa scattare l'allarme)
  monossido: (t) =>
    has(t, /\bmonossido\b/) ||
    (has(t, /\b(stufa|stufetta|caldaia|camino|braciere|scaldabagno|generatore)\b/) &&
      has(t, /\b(mal di testa|nausea|sonnolen\w*|stordit\w*|vomit\w*|capogir\w*)\b/)) ||
    (has(
      t,
      /\b(anche (mio|mia|i miei|le mie|gli altri|altri|loro|lui|lei)|tutti (in casa|noi|e due|e tre|a casa)|tutta la famiglia|altri in casa|altre persone in casa|anche gli altri)\b/,
    ) &&
      has(t, /\bmal di testa\b/) &&
      has(t, /\b(nausea|sonnolen\w*|stordit\w*|capogir\w*|vomit\w*)\b/)),
};

/** I segnali d'allarme presenti, nell'ordine dell'elenco ufficiale */
export function detectRedFlags(input: RedFlagInput): RedFlagId[] {
  const str = normalizeText(input.text ?? "");
  const t: Text = { str, words: str ? str.split(" ") : [] };
  const ctx = { fever: input.symptoms?.includes("febbre") ?? false };
  const checked = new Set(input.checked ?? []);
  return RED_FLAG_IDS.filter((id) => checked.has(id) || (str !== "" && RULES[id](t, ctx)));
}
