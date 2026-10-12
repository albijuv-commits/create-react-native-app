import { router } from "expo-router";
import { Siren } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { CONDITIONS } from "@data/conditions";
import { CURE_NON_URGENTI, EMERGENCY_NUMBER, TELEFONO_AMICO, TELEFONO_AZZURRO } from "@data/emergency/helplines";
import { HelplineCard } from "~/components/emergency/emergency";
import { External, InfoPage, InfoSection, Item, Items } from "~/components/profile/info-page";
import { Txt } from "~/components/ui/text";
import { useTheme } from "~/theme/theme";

const UPDATED = "12 ottobre 2026";
const SECTIONS = [
  { id: "emergenza", title: "In caso di emergenza" },
  { id: "orienta", title: "Orienta orienta, non diagnostica" },
  { id: "intervista", title: "Intervista e risultati" },
  { id: "schede", title: "Schede delle condizioni" },
  { id: "farmaci", title: "Mercato e farmaci" },
  { id: "medici", title: "Medici e strutture" },
  { id: "regole", title: "Prototipo e regole sui dispositivi medici" },
] as const;

/** Le avvertenze della web app: cosa può fare Orienta e cosa no, con i numeri da chiamare in cima */
export default function AvvertenzeScreen() {
  const { colors } = useTheme();
  const toReview = CONDITIONS.filter((c) => c.reviewStatus === "da revisionare").length;
  return (
    <InfoPage
      title="Avvertenze mediche"
      lead="Orienta ti aiuta a capire i sintomi e a trovare il professionista giusto. Non sostituisce il medico, il farmacista o il pronto soccorso."
      updated={UPDATED}
      sections={SECTIONS}
    >
      <InfoSection id="emergenza" title="In caso di emergenza">
        <View style={[styles.alert, { backgroundColor: colors.redSoft }]}>
          <Siren color={colors.red} size={24} style={styles.icon} />
          <Txt bold style={styles.flex}>
            Se stai molto male non usare l&apos;app: chiama subito il 112. Trovi i numeri anche nella pagina{" "}
            <Txt bold tone="red" role="link" onPress={() => router.push("/emergenza")} style={styles.underline}>
              Emergenza
            </Txt>
            , sempre raggiungibile dal pulsante rosso in alto.
          </Txt>
        </View>
        <View style={styles.lines}>
          {[EMERGENCY_NUMBER, CURE_NON_URGENTI, TELEFONO_AMICO, TELEFONO_AZZURRO].map((h) => (
            <HelplineCard key={h.number} helpline={h} tone="surface" />
          ))}
        </View>
      </InfoSection>

      <InfoSection id="orienta" title="Orienta orienta, non diagnostica">
        <Items>
          <Item>Ogni risultato è una possibilità da verificare, non una diagnosi: solo un medico può valutare i tuoi sintomi.</Item>
          <Item>Orienta non prescrive esami né terapie e non indica farmaci o dosi per i tuoi sintomi.</Item>
          <Item>Se i sintomi peggiorano, cambiano o non passano, senti il medico anche se Orienta ti ha suggerito di aspettare.</Item>
          <Item>In gravidanza, con malattie croniche o nei bambini piccoli, chiedi sempre al medico o al pediatra.</Item>
        </Items>
      </InfoSection>

      <InfoSection id="intervista" title="Intervista e risultati">
        <Items>
          <Item>
            I segnali d&apos;allarme sono controllati con regole fisse, a ogni risposta. Non possono coprire ogni situazione: se senti che qualcosa non va, non
            aspettare la fine dell&apos;intervista.
          </Item>
          <Item>
            Con l&apos;intelligenza artificiale le domande si adattano alle tue risposte, ma il modello può sbagliare. Può scegliere solo tra le condizioni della base
            di conoscenza di Orienta e non abbassa mai l&apos;urgenza indicata dalle regole.
          </Item>
          <Item>La base di conoscenza comprende {CONDITIONS.length} condizioni comuni: un disturbo che non c&apos;è può dare un risultato «nessuna corrispondenza».</Item>
        </Items>
      </InfoSection>

      <InfoSection id="schede" title="Schede delle condizioni">
        <Items>
          <Item>Le schede sono scritte da fonti sanitarie pubbliche, citate in fondo a ogni scheda con la data di aggiornamento.</Item>
          <Item>
            {toReview > 0
              ? `${toReview} schede su ${CONDITIONS.length} non sono ancora state revisionate da un medico: lo trovi scritto nella scheda.`
              : "Tutte le schede sono state revisionate da un medico."}
          </Item>
          <Item>Le animazioni del vetrino sono illustrazioni semplificate, non immagini reali.</Item>
        </Items>
      </InfoSection>

      <InfoSection id="farmaci" title="Mercato e farmaci">
        <Items>
          <Item>Il Mercato è un catalogo informativo: non vende farmaci e non consiglia quale prendere.</Item>
          <Item>Prima di usare un medicinale leggi il foglietto illustrativo e chiedi consiglio al medico o al farmacista.</Item>
          <Item>
            Prezzi e regime di fornitura vengono dalle liste dell&apos;AIFA, con la loro data: in farmacia possono essere diversi, soprattutto per i farmaci senza
            ricetta.
          </Item>
          <Item>Le schede dei principi attivi riassumono documenti ufficiali e non elencano tutti gli effetti indesiderati.</Item>
          <Item>All&apos;estero lo stesso principio attivo può avere dosaggi, forme e regole di vendita diverse: chiedi al farmacista del posto.</Item>
        </Items>
      </InfoSection>

      <InfoSection id="medici" title="Medici e strutture">
        <Items>
          <Item>I risultati vengono da OpenStreetMap o da Google: possono essere incompleti o non aggiornati. Prima di andare, controlla orari e contatti.</Item>
          <Item>Orienta non ha accordi con medici o strutture e non li ordina per preferenze commerciali.</Item>
        </Items>
      </InfoSection>

      <InfoSection id="regole" title="Prototipo e regole sui dispositivi medici">
        <Txt>
          Orienta è un prototipo. Un software che aiuta a orientare una diagnosi può rientrare nel{" "}
          <External url="https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32017R0745">Regolamento (UE) 2017/745 sui dispositivi medici</External> (MDR):
          prima di una pubblicazione serve una verifica legale e regolatoria. Maggiori informazioni sul sito del{" "}
          <External url="https://www.salute.gov.it/new/it/tema/dispositivi-medici/">Ministero della Salute</External>.
        </Txt>
      </InfoSection>
    </InfoPage>
  );
}

const styles = StyleSheet.create({
  alert: { flexDirection: "row", gap: 12, borderRadius: 16, padding: 16 },
  icon: { marginTop: 2 },
  flex: { flex: 1 },
  underline: { textDecorationLine: "underline" },
  lines: { gap: 12 },
});
