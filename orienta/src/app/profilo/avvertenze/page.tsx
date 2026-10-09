import { Phone, Siren } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CURE_NON_URGENTI, EMERGENCY_NUMBER, TELEFONO_AMICO, TELEFONO_AZZURRO, type Helpline } from "@data/emergency/helplines";
import { External, InfoPage, InfoSection } from "@/components/profile/info-page";
import { CONDITIONS } from "@data/conditions";

export const metadata: Metadata = { title: "Avvertenze mediche", description: "Cosa può fare Orienta e cosa no." };

const UPDATED = "7 ottobre 2026";
const SECTIONS = [
  { id: "emergenza", title: "In caso di emergenza" },
  { id: "orienta", title: "Orienta orienta, non diagnostica" },
  { id: "intervista", title: "Intervista e risultati" },
  { id: "schede", title: "Schede delle condizioni" },
  { id: "farmaci", title: "Mercato e farmaci" },
  { id: "medici", title: "Medici e strutture" },
  { id: "regole", title: "Prototipo e regole sui dispositivi medici" },
] as const;

function Line({ h }: { h: Helpline }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-surface p-3">
      <Phone aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
      <span className="min-w-0 flex-1">
        <span className="block font-bold">
          {h.name}:{" "}
          <a href={`tel:${h.tel}`} className="text-primary underline underline-offset-2">
            {h.number}
          </a>
        </span>
        <span className="block text-small text-ink-muted">{h.hours}</span>
      </span>
    </li>
  );
}

export default function AvvertenzePage() {
  const toReview = CONDITIONS.filter((c) => c.reviewStatus === "da revisionare").length;
  return (
    <InfoPage
      title="Avvertenze mediche"
      lead="Orienta ti aiuta a capire i sintomi e a trovare il professionista giusto. Non sostituisce il medico, il farmacista o il pronto soccorso."
      updated={UPDATED}
      sections={[...SECTIONS]}
    >
      <InfoSection id="emergenza" title="In caso di emergenza">
        <p className="flex gap-3 rounded-2xl bg-red-soft p-4 font-bold">
          <Siren aria-hidden className="mt-0.5 size-6 shrink-0 text-red" />
          <span>
            Se stai molto male non usare l&apos;app: chiama subito il 112. Trovi i numeri anche nella pagina{" "}
            <Link href="/emergenza" className="text-red underline underline-offset-2">
              Emergenza
            </Link>
            , sempre disponibile in alto.
          </span>
        </p>
        <ul className="!list-none !pl-0 space-y-2">
          <Line h={EMERGENCY_NUMBER} />
          <Line h={CURE_NON_URGENTI} />
          <Line h={TELEFONO_AMICO} />
          <Line h={TELEFONO_AZZURRO} />
        </ul>
      </InfoSection>

      <InfoSection id="orienta" title="Orienta orienta, non diagnostica">
        <ul>
          <li>Ogni risultato è una possibilità da verificare, non una diagnosi: solo un medico può valutare i tuoi sintomi.</li>
          <li>Orienta non prescrive esami né terapie e non indica farmaci o dosi per i tuoi sintomi.</li>
          <li>Se i sintomi peggiorano, cambiano o non passano, senti il medico anche se Orienta ti ha suggerito di aspettare.</li>
          <li>In gravidanza, con malattie croniche o nei bambini piccoli, chiedi sempre al medico o al pediatra.</li>
        </ul>
      </InfoSection>

      <InfoSection id="intervista" title="Intervista e risultati">
        <ul>
          <li>
            I segnali d&apos;allarme sono controllati con regole fisse, a ogni risposta. Non possono coprire ogni situazione: se senti che qualcosa non va, non
            aspettare la fine dell&apos;intervista.
          </li>
          <li>
            Con l&apos;intelligenza artificiale le domande si adattano alle tue risposte, ma il modello può sbagliare. Può scegliere solo tra le condizioni della
            base di conoscenza di Orienta e non abbassa mai l&apos;urgenza indicata dalle regole.
          </li>
          <li>La base di conoscenza comprende {CONDITIONS.length} condizioni comuni: un disturbo che non c&apos;è può dare un risultato «nessuna corrispondenza».</li>
        </ul>
      </InfoSection>

      <InfoSection id="schede" title="Schede delle condizioni">
        <ul>
          <li>Le schede sono scritte da fonti sanitarie pubbliche, citate in fondo a ogni scheda con la data di aggiornamento.</li>
          <li>
            {toReview > 0
              ? `${toReview} schede su ${CONDITIONS.length} non sono ancora state revisionate da un medico: lo trovi scritto nella scheda.`
              : "Tutte le schede sono state revisionate da un medico."}
          </li>
          <li>Le animazioni del vetrino sono illustrazioni semplificate, non immagini reali.</li>
        </ul>
      </InfoSection>

      <InfoSection id="farmaci" title="Mercato e farmaci">
        <ul>
          <li>Il Mercato è un catalogo informativo: non vende farmaci e non consiglia quale prendere.</li>
          <li>Prima di usare un medicinale leggi il foglietto illustrativo e chiedi consiglio al medico o al farmacista.</li>
          <li>
            Prezzi e regime di fornitura vengono dalle liste dell&apos;AIFA, con la loro data: in farmacia possono essere diversi, soprattutto per i farmaci senza
            ricetta.
          </li>
          <li>Le schede dei principi attivi riassumono documenti ufficiali e non elencano tutti gli effetti indesiderati.</li>
          <li>All&apos;estero lo stesso principio attivo può avere dosaggi, forme e regole di vendita diverse: chiedi al farmacista del posto.</li>
        </ul>
      </InfoSection>

      <InfoSection id="medici" title="Medici e strutture">
        <ul>
          <li>
            I risultati vengono da OpenStreetMap o da Google: possono essere incompleti o non aggiornati. Prima di andare, controlla orari e contatti.
          </li>
          <li>Orienta non ha accordi con medici o strutture e non li ordina per preferenze commerciali.</li>
        </ul>
      </InfoSection>

      <InfoSection id="regole" title="Prototipo e regole sui dispositivi medici">
        <p>
          Orienta è un prototipo. Un software che aiuta a orientare una diagnosi può rientrare nel{" "}
          <External href="https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32017R0745">Regolamento (UE) 2017/745 sui dispositivi medici</External> (MDR):
          prima di una pubblicazione serve una verifica legale e regolatoria. Maggiori informazioni sul sito del{" "}
          <External href="https://www.salute.gov.it/new/it/tema/dispositivi-medici/">Ministero della Salute</External>.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
