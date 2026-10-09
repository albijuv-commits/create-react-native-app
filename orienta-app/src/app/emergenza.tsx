import { StyleSheet, View } from "react-native";
import { CURE_NON_URGENTI, TELEFONO_AMICO, TELEFONO_AZZURRO } from "@data/emergency/helplines";
import { RED_FLAG_IDS } from "@data/emergency/red-flags";
import { formatItalianDate } from "@/lib/conditions/knowledge-base";
import { CallEmergency, HelplineCard, RedFlagItem } from "~/components/emergency/emergency";
import { Bullets, Card, Screen, Section } from "~/components/ui/layout";
import { Txt } from "~/components/ui/text";

/** Sempre raggiungibile dal pulsante in alto: 112, i segnali da riconoscere e i numeri di aiuto */
export default function EmergenzaScreen() {
  return (
    <Screen>
      <View style={styles.intro}>
        <Txt variant="display" tone="red" header>
          Emergenza
        </Txt>
        <Txt>Se pensi che la tua vita o quella di qualcun altro sia in pericolo, chiama subito.</Txt>
      </View>

      <CallEmergency />

      <Card tone="redSoft">
        <Txt variant="heading" header>
          Mentre aspetti i soccorsi
        </Txt>
        <Bullets
          items={[
            "Resta calmo e rispondi alle domande dell'operatore: ti guiderà passo per passo.",
            "Di' dove ti trovi nel modo più preciso possibile.",
            "Non restare da solo: chiedi aiuto a chi è vicino.",
            "Non prendere farmaci, cibo o bevande se non te lo dice l'operatore.",
          ]}
        />
      </Card>

      <Section title="Riconosci i segnali d'allarme" lead="Tocca un segnale per sapere cosa fare.">
        <View style={styles.list}>
          {RED_FLAG_IDS.map((id) => (
            <RedFlagItem key={id} id={id} />
          ))}
        </View>
      </Section>

      <Section title="Numeri di aiuto" lead={`Numeri e orari verificati sui siti ufficiali il ${formatItalianDate(TELEFONO_AMICO.verifiedAt)}.`}>
        <View style={styles.list}>
          <HelplineCard helpline={TELEFONO_AMICO} />
          <HelplineCard helpline={TELEFONO_AZZURRO} />
          <HelplineCard helpline={CURE_NON_URGENTI} />
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 8 },
  list: { gap: 10 },
});
