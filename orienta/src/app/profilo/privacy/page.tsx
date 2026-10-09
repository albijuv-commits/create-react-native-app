import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { External, InfoPage, InfoSection } from "@/components/profile/info-page";
import { MAX_SESSIONS } from "@/lib/storage/history";

export const metadata: Metadata = { title: "Informativa privacy", description: "Quali dati usa Orienta, dove vanno e come eliminarli." };

const UPDATED = "7 ottobre 2026";
const SECTIONS = [
  { id: "in-breve", title: "In breve" },
  { id: "titolare", title: "Chi è responsabile dei dati" },
  { id: "intervista", title: "Intervista sui sintomi" },
  { id: "dispositivo", title: "Dati salvati sul tuo dispositivo" },
  { id: "medici", title: "Ricerca dei medici e mappa" },
  { id: "mercato", title: "Mercato" },
  { id: "tecnici", title: "Dati tecnici" },
  { id: "analisi", title: "Niente analisi, niente pubblicità" },
  { id: "diritti", title: "I tuoi diritti" },
] as const;

/**
 * L'informativa descrive quello che il codice fa davvero. I dati del titolare non si inventano:
 * si configurano con PRIVACY_CONTROLLER e PRIVACY_CONTACT; finché mancano, la pagina lo dice.
 */
export default function PrivacyPage() {
  const controller = process.env.PRIVACY_CONTROLLER?.trim();
  const contact = process.env.PRIVACY_CONTACT?.trim();
  return (
    <InfoPage
      title="Informativa privacy"
      lead="Quali dati usa Orienta, perché, dove vanno e come puoi eliminarli. Con i dati sulla salute stiamo particolarmente attenti: per il GDPR sono una categoria particolare (art. 9)."
      updated={UPDATED}
      sections={[...SECTIONS]}
    >
      <InfoSection id="in-breve" title="In breve">
        <ul>
          <li>Non serve un account. Orienta non usa cookie e non conserva i tuoi dati sui suoi server.</li>
          <li>
            I dati sulla tua salute restano sul dispositivo. Partono solo se scegli l&apos;intervista con l&apos;intelligenza artificiale, dopo il tuo consenso
            esplicito.
          </li>
          <li>
            Storico, preferenze e liste del Mercato sono salvati solo nel tuo browser. Li elimini quando vuoi dal{" "}
            <Link href="/profilo" className="font-bold text-primary underline underline-offset-2">
              Profilo
            </Link>
            , anche tutti insieme.
          </li>
          <li>Nessuno strumento di analisi, nessuna pubblicità, in nessuna pagina.</li>
        </ul>
      </InfoSection>

      <InfoSection id="titolare" title="Chi è responsabile dei dati">
        {controller ? (
          <p>
            Titolare del trattamento: <span className="font-bold">{controller}</span>.
            {contact && (
              <>
                {" "}
                Per domande sulla privacy e per esercitare i tuoi diritti: <span className="font-bold">{contact}</span>.
              </>
            )}
          </p>
        ) : (
          <p className="flex gap-3 rounded-2xl border-2 border-dashed border-amber bg-amber-soft p-4">
            <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-amber" />
            <span>
              <span className="font-bold">Da completare prima della pubblicazione.</span> Chi pubblica Orienta deve indicare qui il titolare del trattamento e un
              contatto per la privacy (variabili PRIVACY_CONTROLLER e PRIVACY_CONTACT), insieme alle garanzie per il trasferimento dei dati al fornitore dell&apos;AI.
            </span>
          </p>
        )}
      </InfoSection>

      <InfoSection id="intervista" title="Intervista sui sintomi">
        <p>
          Per l&apos;intervista usi età, sesso, eventuale gravidanza, la descrizione dei disturbi, i sintomi, le zone del corpo e le risposte alle domande.
        </p>
        <ul>
          <li>
            <span className="font-bold">Metodo semplificato</span> (senza AI): tutto avviene nel browser con regole fisse. Nessun dato lascia il dispositivo.
          </li>
          <li>
            <span className="font-bold">Con l&apos;AI</span>, solo se la attivi e dai il consenso esplicito: le risposte arrivano al server di Orienta e da lì al
            modello Claude di Anthropic PBC, negli Stati Uniti, che sceglie le domande e confronta i sintomi con le schede di Orienta. Il server di Orienta non le
            salva e non le scrive nei log. Anthropic le tratta secondo le sue condizioni: <External href="https://www.anthropic.com/legal/privacy">informativa di Anthropic</External>.
          </li>
          <li>
            Base giuridica: il tuo consenso esplicito (art. 9, paragrafo 2, lettera a del GDPR). Puoi revocarlo in qualsiasi momento: basta continuare con il metodo
            semplificato o non usare l&apos;intervista.
          </li>
          <li>Sotto i 14 anni l&apos;intervista chiede che sia presente un genitore o un tutore.</li>
          <li>I segnali d&apos;allarme si controllano con regole scritte nel codice, nel browser e sul server: non dipendono dall&apos;AI.</li>
        </ul>
      </InfoSection>

      <InfoSection id="dispositivo" title="Dati salvati sul tuo dispositivo">
        <ul>
          <li>
            <span className="font-bold">Storico delle sessioni</span> (IndexedDB): solo le sessioni che scegli di salvare con «Salva nello storico», al massimo{" "}
            {MAX_SESSIONS}. Contiene il livello di urgenza, le possibilità emerse, i sintomi e il riepilogo per il medico.
          </li>
          <li>
            <span className="font-bold">Preferenze</span> (localStorage): tema, dimensione del testo, città predefinita.
          </li>
          <li>
            <span className="font-bold">Preferiti e confronto del Mercato</span> (localStorage).
          </li>
          <li>
            <span className="font-bold">Riepilogo per il medico</span> (sessionStorage): se dai risultati vai a cercare uno specialista, il riepilogo passa alla
            sezione Medici dentro la stessa scheda e sparisce quando la chiudi. L&apos;email al medico la invii tu, dalla tua app di posta.
          </li>
          <li>
            <span className="font-bold">Pagine per l&apos;uso senza rete</span> (service worker): le pagine visitate si conservano senza i parametri
            dell&apos;indirizzo, per esempio senza il nome di una condizione.
          </li>
        </ul>
        <p>
          Restano finché non li elimini: dal Profilo puoi cancellare una sessione, tutto lo storico o tutti i dati insieme con «Elimina tutti i miei dati».
          Chiunque usi questo dispositivo e questo browser può vederli: se lo condividi, ricordalo.
        </p>
      </InfoSection>

      <InfoSection id="medici" title="Ricerca dei medici e mappa">
        <ul>
          <li>
            La posizione si usa solo se la condividi con il permesso del browser. Prima di partire viene arrotondata a circa 100 metri e serve solo per la
            ricerca: il server la passa a OpenStreetMap (servizio Overpass) oppure, se attivo, a Google (Places API), senza salvarla.
          </li>
          <li>Se scrivi una città o un CAP, il server lo cerca con Nominatim di OpenStreetMap.</li>
          <li>
            Per non sovraccaricare questi servizi gratuiti, il server tiene in memoria i risultati delle ricerche dei medici per un&apos;ora e quelli delle città
            per una settimana, senza collegarli a chi li ha chiesti.
          </li>
          <li>
            La mappa scarica le immagini direttamente dai server di OpenStreetMap: il tuo browser comunica loro l&apos;indirizzo IP e la zona mostrata. Vedi
            l&apos;<External href="https://osmfoundation.org/wiki/Privacy_Policy">informativa di OpenStreetMap Foundation</External>. Con Google come fonte la mappa
            non si usa; vedi l&apos;<External href="https://policies.google.com/privacy">informativa di Google</External>.
          </li>
        </ul>
      </InfoSection>

      <InfoSection id="mercato" title="Mercato">
        <p>
          Le ricerche nel catalogo arrivano al server solo per interrogare il catalogo e non si salvano. Preferiti e confronto restano nel browser. I link al
          foglietto illustrativo portano ai siti dell&apos;AIFA, con le loro regole sulla privacy.
        </p>
      </InfoSection>

      <InfoSection id="tecnici" title="Dati tecnici">
        <ul>
          <li>
            Per evitare abusi, il server conta le richieste di ogni indirizzo IP per pochi minuti (da 1 a 10, secondo il servizio). Il conteggio resta in memoria e
            non si scrive da nessuna parte.
          </li>
          <li>I messaggi di errore del server non contengono i dati inseriti dalle persone.</li>
          <li>Il servizio che ospita l&apos;app può registrare dati tecnici di accesso (indirizzo IP, pagina, data e ora) secondo le proprie condizioni.</li>
        </ul>
      </InfoSection>

      <InfoSection id="analisi" title="Niente analisi, niente pubblicità">
        <p>
          Orienta non usa strumenti di analisi, pixel, pubblicità o cookie, in nessuna pagina e in particolare in quelle dei sintomi. Anche i caratteri sono
          serviti dall&apos;app stessa, senza richieste ad altri siti.
        </p>
      </InfoSection>

      <InfoSection id="diritti" title="I tuoi diritti">
        <p>
          Puoi chiedere l&apos;accesso ai tuoi dati, la rettifica, la cancellazione, la limitazione, la portabilità, opporti al trattamento e revocare il consenso
          in qualsiasi momento (articoli da 15 a 22 del <External href="https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32016R0679">GDPR</External>).
          Quasi tutto è già nelle tue mani: i dati sono sul tuo dispositivo e li elimini dal Profilo.
        </p>
        <p>
          Se ritieni che i tuoi dati siano trattati in modo non corretto puoi rivolgerti al{" "}
          <External href="https://www.garanteprivacy.it/home/diritti/come-agire-per-tutelare-i-tuoi-dati-personali">Garante per la protezione dei dati personali</External>.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
