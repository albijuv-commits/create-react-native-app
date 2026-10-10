import { ArrowRight, LockKeyhole, Siren, Sparkles, Stethoscope, type LucideIcon } from "lucide-react-native";
import { useState, type ReactNode, type Ref } from "react";
import { StyleSheet, View, type Text } from "react-native";
import consenso from "@/assets/illustrations/passo-consenso.webp";
import { Button } from "~/components/ui/button";
import { Txt } from "~/components/ui/text";
import { apiBaseUrl } from "~/lib/api";
import { openSource } from "~/lib/links";
import { useTheme } from "~/theme/theme";
import { CheckRow, FieldError, StepHeader } from "./parts";

export interface ConsentState {
  /** Ha capito che l'app non fa diagnosi e che per le emergenze c'è il 112 */
  terms: boolean;
  /** Consenso all'uso dei dati sulla salute per questa intervista (art. 9 GDPR) */
  health: boolean;
  /** Consenso facoltativo all'invio al modello AI */
  ai: boolean;
}

export function ConsentStep({
  value,
  onChange,
  aiAvailable,
  onNext,
  headingRef,
}: {
  value: ConsentState;
  onChange: (next: ConsentState) => void;
  /** null mentre si controlla se l'AI è attiva sul server */
  aiAvailable: boolean | null;
  onNext: () => void;
  headingRef: Ref<Text>;
}) {
  const [tried, setTried] = useState(false);
  const missing = !value.terms || !value.health;
  // L'informativa completa sta nella web app; qui il link compare solo se la web app è configurata
  const site = apiBaseUrl();

  const submit = () => {
    if (missing) {
      setTried(true);
      return;
    }
    onNext();
  };

  return (
    <View style={styles.page}>
      <StepHeader
        step="Passo 1 di 4"
        title="Prima di iniziare"
        lead="Ti facciamo qualche domanda sui sintomi e ti mostriamo quali condizioni potrebbero essere compatibili e a chi rivolgerti."
        image={consenso}
        headingRef={headingRef}
      />

      <View style={styles.facts}>
        <Fact icon={Stethoscope}>
          <Txt variant="small" bold>
            Non è una diagnosi.{" "}
          </Txt>
          Solo un medico può valutare i tuoi sintomi.
        </Fact>
        <Fact icon={Siren} tone="red">
          <Txt variant="small" bold>
            Se stai molto male non usare l&apos;app:{" "}
          </Txt>
          chiama subito il 112.
        </Fact>
        <Fact icon={LockKeyhole}>
          <Txt variant="small" bold>
            I tuoi dati restano tuoi.{" "}
          </Txt>
          Non li salviamo e nell&apos;app non usiamo strumenti di analisi o di tracciamento.
          {site ? (
            <>
              {" "}
              <Txt variant="small" bold tone="primary" role="link" onPress={() => openSource(`${site}/profilo/privacy`)} style={styles.link}>
                Leggi l&apos;informativa privacy
              </Txt>
            </>
          ) : null}
        </Fact>
      </View>

      <View style={styles.group} role="group" accessibilityLabel="Il tuo consenso">
        <Txt variant="heading" header>
          Il tuo consenso
        </Txt>
        <CheckRow
          checked={value.terms}
          onChange={(terms) => onChange({ ...value, terms })}
          invalid={tried && !value.terms}
          label="Ho capito che Orienta mi orienta ma non fa diagnosi, e che in caso di emergenza devo chiamare il 112."
        />
        <CheckRow
          checked={value.health}
          onChange={(health) => onChange({ ...value, health })}
          invalid={tried && !value.health}
          label="Acconsento all'uso dei dati sulla mia salute che inserirò, solo per questa intervista."
          note="Sono dati particolari secondo l'articolo 9 del GDPR. Restano su questo telefono e si cancellano quando chiudi l'intervista."
        />
        {aiAvailable ? (
          <CheckRow
            checked={value.ai}
            onChange={(ai) => onChange({ ...value, ai })}
            icon={<AiIcon />}
            label="Facoltativo: voglio domande più mirate con l'intelligenza artificiale."
            note="La descrizione e le risposte, senza nome né contatti, passano dal server di Orienta al modello Claude di Anthropic solo per scegliere le domande e confrontarle con le schede di Orienta. Il server non le registra. Senza questo consenso usiamo regole fisse, direttamente sul telefono."
          />
        ) : null}
        {tried && missing ? <FieldError>Per continuare spunta le prime due caselle.</FieldError> : null}
      </View>

      <Button label="Continua" icon={ArrowRight} size="lg" onPress={submit} />
    </View>
  );
}

function AiIcon() {
  const { colors } = useTheme();
  return <Sparkles color={colors.accent} size={20} style={styles.aiIcon} />;
}

function Fact({ icon: Icon, tone = "primary", children }: { icon: LucideIcon; tone?: "primary" | "red"; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.fact}>
      <View style={[styles.factIcon, { backgroundColor: tone === "red" ? colors.redSoft : colors.primarySoft }]}>
        <Icon color={tone === "red" ? colors.red : colors.primary} size={20} />
      </View>
      <Txt variant="small" style={styles.factText}>
        {children}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: 24 },
  facts: { gap: 12 },
  fact: { flexDirection: "row", gap: 12 },
  factIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  factText: { flex: 1, paddingTop: 6 },
  link: { textDecorationLine: "underline" },
  group: { gap: 12 },
  aiIcon: { marginTop: 2 },
});
