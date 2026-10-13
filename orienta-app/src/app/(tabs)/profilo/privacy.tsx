import { router } from "expo-router";
import { TriangleAlert } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { MAX_SESSIONS } from "@/lib/storage/history";
import { External, InfoPage, InfoSection, Item, Items, Strong } from "~/components/profile/info-page";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";

const UPDATED = "12 ottobre 2026";
const SECTIONS = [
  { id: "in-breve", title: "In breve" },
  { id: "titolare", title: "Chi è responsabile dei dati" },
  { id: "intervista", title: "Intervista sui sintomi" },
  { id: "telefono", title: "Dati salvati sul telefono" },
  { id: "medici", title: "Ricerca dei medici" },
  { id: "mercato", title: "Mercato" },
  { id: "tecnici", title: "Dati tecnici" },
  { id: "analisi", title: "Niente analisi, niente pubblicità" },
  { id: "diritti", title: "I tuoi diritti" },
] as const;

/**
 * L'informativa descrive quello che l'app fa davvero, come quella della web app. I dati del titolare
 * non si inventano: si mettono nella build con EXPO_PUBLIC_PRIVACY_CONTROLLER ed
 * EXPO_PUBLIC_PRIVACY_CONTACT; finché mancano, la pagina lo dice.
 */
export default function PrivacyScreen() {
  const { colors } = useTheme();
  const controller = process.env.EXPO_PUBLIC_PRIVACY_CONTROLLER?.trim();
  const contact = process.env.EXPO_PUBLIC_PRIVACY_CONTACT?.trim();
  return (
    <InfoPage
      title="Informativa privacy"
      lead="Quali dati usa Orienta, perché, dove vanno e come puoi eliminarli. Con i dati sulla salute stiamo particolarmente attenti: per il GDPR sono una categoria particolare (art. 9)."
      updated={UPDATED}
      sections={SECTIONS}
    >
      <InfoSection id="in-breve" title="In breve">
        <Items>
          <Item>Non serve un account. Orienta non conserva i tuoi dati sui suoi server.</Item>
          <Item>
            I dati sulla tua salute restano sul telefono. Partono solo se scegli l&apos;intervista con l&apos;intelligenza artificiale, dopo il tuo consenso
            esplicito.
          </Item>
          <Item>
            Storico, preferenze e liste del Mercato sono salvati solo nella memoria dell&apos;app sul telefono. Li elimini quando vuoi dal{" "}
            <Txt bold tone="primary" role="link" onPress={() => router.dismissTo("/profilo")} style={styles.underline}>
              Profilo
            </Txt>
            , anche tutti insieme.
          </Item>
          <Item>Nessuno strumento di analisi, nessuna pubblicità, nessun tracciamento.</Item>
        </Items>
      </InfoSection>

      <InfoSection id="titolare" title="Chi è responsabile dei dati">
        {controller ? (
          <Txt>
            Titolare del trattamento: <Strong>{controller}</Strong>.
            {contact ? (
              <>
                {" "}
                Per domande sulla privacy e per esercitare i tuoi diritti: <Strong>{contact}</Strong>.
              </>
            ) : null}
          </Txt>
        ) : (
          <View style={[styles.todo, { borderColor: colors.amber, backgroundColor: colors.amberSoft }]}>
            <TriangleAlert color={colors.amber} size={20} style={styles.icon} />
            <Txt style={styles.flex}>
              <Strong>Da completare prima della pubblicazione.</Strong> Chi pubblica Orienta deve indicare qui il titolare del trattamento e un contatto per la
              privacy (variabili EXPO_PUBLIC_PRIVACY_CONTROLLER ed EXPO_PUBLIC_PRIVACY_CONTACT nella build), insieme alle garanzie per il trasferimento dei dati al
              fornitore dell&apos;AI.
            </Txt>
          </View>
        )}
      </InfoSection>

      <InfoSection id="intervista" title="Intervista sui sintomi">
        <Txt>Per l&apos;intervista usi età, sesso, eventuale gravidanza, la descrizione dei disturbi, i sintomi, le zone del corpo e le risposte alle domande.</Txt>
        <Items>
          <Item>
            <Strong>Metodo semplificato</Strong> (senza AI): tutto avviene sul telefono con regole fisse. Nessun dato lascia il telefono.
          </Item>
          <Item>
            <Strong>Con l&apos;AI</Strong>, solo se la attivi e dai il consenso esplicito: le risposte arrivano al server di Orienta e da lì al modello Claude di
            Anthropic PBC, negli Stati Uniti, che sceglie le domande e confronta i sintomi con le schede di Orienta. Il server di Orienta non le salva e non le
            scrive nei log. Anthropic le tratta secondo le sue condizioni: <External url="https://www.anthropic.com/legal/privacy">informativa di Anthropic</External>.
          </Item>
          <Item>Per sapere se l&apos;AI è disponibile l&apos;app fa una richiesta al server che non contiene nessun dato tuo.</Item>
          <Item>
            Base giuridica: il tuo consenso esplicito (art. 9, paragrafo 2, lettera a del GDPR). Puoi revocarlo in qualsiasi momento: basta continuare con il metodo
            semplificato o non usare l&apos;intervista.
          </Item>
          <Item>Sotto i 14 anni l&apos;intervista chiede che sia presente un genitore o un tutore.</Item>
          <Item>I segnali d&apos;allarme si controllano con regole scritte nel codice, sul telefono e sul server: non dipendono dall&apos;AI.</Item>
        </Items>
      </InfoSection>

      <InfoSection id="telefono" title="Dati salvati sul telefono">
        <Items>
          <Item>
            <Strong>Storico delle sessioni</Strong>: solo le sessioni che scegli di salvare con «Salva nello storico», al massimo {MAX_SESSIONS}. Contiene il livello
            di urgenza, le possibilità emerse, i sintomi, l&apos;età e il riepilogo per il medico.
          </Item>
          <Item>
            <Strong>Preferenze</Strong>: tema, dimensione del testo, città predefinita.
          </Item>
          <Item>
            <Strong>Preferiti e confronto del Mercato</Strong>.
          </Item>
          <Item>
            <Strong>Riepilogo per il medico</Strong>: se dai risultati vai a cercare uno specialista, il riepilogo passa alla sezione Medici solo in memoria, finché
            l&apos;app resta aperta e al massimo per sei ore. L&apos;email al medico la invii tu, dalla tua app di posta.
          </Item>
          <Item>
            <Strong>PDF del riepilogo</Strong>: si crea sul telefono quando lo chiedi, in una cartella temporanea dell&apos;app. Su iPhone si cancella dopo la
            condivisione; su Android, dove alcune app lo leggono più tardi, alla condivisione successiva o con «Elimina tutti i miei dati». Il testo copiato resta negli appunti del
            telefono finché non copi altro.
          </Item>
        </Items>
        <Txt>
          Storico, preferenze e liste sono nella memoria privata dell&apos;app e restano finché non li elimini: dal Profilo puoi cancellare una sessione, tutto lo
          storico o tutti i dati insieme con «Elimina tutti i miei dati». Disinstallando l&apos;app spariscono anche loro. Chiunque usi il telefono sbloccato può
          vederli: se lo condividi, ricordalo.
        </Txt>
        <Txt>
          Su Android i dati di Orienta non entrano nel backup automatico su Google Drive. Su iPhone, se è attivo il backup del telefono (su iCloud o sul
          computer), può includere anche i dati di Orienta, come quelli delle altre app.
        </Txt>
      </InfoSection>

      <InfoSection id="medici" title="Ricerca dei medici">
        <Items>
          <Item>
            La posizione si usa solo se tocchi «Usa la mia posizione» e dai il permesso del telefono. Prima di partire viene arrotondata a circa 100 metri e serve
            solo per la ricerca: il server di Orienta la passa a OpenStreetMap (servizio Overpass) oppure, se attivo, a Google (Places API), senza salvarla. Questi
            servizi ricevono la richiesta dal server di Orienta, non dal tuo telefono. Le distanze si calcolano sul telefono.
          </Item>
          <Item>Se scrivi una città o un CAP, il server lo cerca con Nominatim di OpenStreetMap.</Item>
          <Item>
            Per non sovraccaricare questi servizi gratuiti, il server tiene in memoria i risultati delle ricerche dei medici per un&apos;ora e quelli delle città per
            una settimana, senza collegarli a chi li ha chiesti.
          </Item>
          <Item>La mappa dei risultati è disegnata nell&apos;app: non scarica immagini da altri servizi, quindi nessuno riceve la zona che stai guardando.</Item>
          <Item>Se l&apos;app non è collegata al servizio di Orienta, la sezione mostra dati di esempio e la posizione non lascia il telefono.</Item>
          <Item>
            Vedi anche l&apos;<External url="https://osmfoundation.org/wiki/Privacy_Policy">informativa di OpenStreetMap Foundation</External> e quella di{" "}
            <External url="https://policies.google.com/privacy">Google</External>.
          </Item>
        </Items>
      </InfoSection>

      <InfoSection id="mercato" title="Mercato">
        <Txt>
          Le ricerche nel catalogo arrivano al server solo per interrogare il catalogo e non si salvano; senza il servizio si cerca nel campione di esempio, sul
          telefono. Preferiti e confronto restano sul telefono. Le foto delle confezioni che non sono già nell&apos;app arrivano dal server di Orienta. I link al
          foglietto illustrativo e alle fonti si aprono nel browser, sui siti dell&apos;AIFA e degli altri enti, con le loro regole sulla privacy.
        </Txt>
      </InfoSection>

      <InfoSection id="tecnici" title="Dati tecnici">
        <Items>
          <Item>
            Per evitare abusi, il server conta le richieste di ogni indirizzo IP per pochi minuti (da 1 a 10, secondo il servizio). Il conteggio resta in memoria e
            non si scrive da nessuna parte.
          </Item>
          <Item>
            Testi, sintomi, ricerche, codici dei farmaci e posizione viaggiano nel corpo delle richieste, mai negli indirizzi: non finiscono nei registri di
            accesso. Fanno eccezione le foto delle confezioni, che come ogni immagine si scaricano con il loro indirizzo.
          </Item>
          <Item>I messaggi di errore del server non contengono i dati inseriti dalle persone.</Item>
          <Item>Il servizio che ospita il server di Orienta può registrare dati tecnici di accesso (indirizzo IP, data e ora) secondo le proprie condizioni.</Item>
          <Item>L&apos;app non contiene chiavi di servizi esterni: le tiene il server.</Item>
        </Items>
      </InfoSection>

      <InfoSection id="analisi" title="Niente analisi, niente pubblicità">
        <Txt>
          Orienta non usa strumenti di analisi, tracciamento, pubblicità o identificativi pubblicitari e non manda segnalazioni automatiche di utilizzo o di
          errori. Caratteri e illustrazioni sono dentro l&apos;app, senza richieste ad altri siti.
        </Txt>
      </InfoSection>

      <InfoSection id="diritti" title="I tuoi diritti">
        <Txt>
          Puoi chiedere l&apos;accesso ai tuoi dati, la rettifica, la cancellazione, la limitazione, la portabilità, opporti al trattamento e revocare il consenso in
          qualsiasi momento (articoli da 15 a 22 del <External url="https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32016R0679">GDPR</External>). Quasi
          tutto è già nelle tue mani: i dati sono sul telefono e li elimini dal Profilo.
        </Txt>
        <Txt>
          Se ritieni che i tuoi dati siano trattati in modo non corretto puoi rivolgerti al{" "}
          <External url="https://www.garanteprivacy.it/home/diritti/come-agire-per-tutelare-i-tuoi-dati-personali">Garante per la protezione dei dati personali</External>
          .
        </Txt>
      </InfoSection>
    </InfoPage>
  );
}

const styles = StyleSheet.create({
  underline: { textDecorationLine: "underline" },
  todo: { flexDirection: "row", gap: 12, borderWidth: 2, borderStyle: "dashed", borderRadius: 16, padding: 16 },
  icon: { marginTop: 3 },
  flex: { flex: 1 },
});
