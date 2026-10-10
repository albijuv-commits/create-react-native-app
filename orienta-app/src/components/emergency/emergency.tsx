import { ChevronDown, ExternalLink, Phone } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { Helpline } from "@data/emergency/helplines";
import { RED_FLAGS, type RedFlagId } from "@data/emergency/red-flags";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/layout";
import { Txt } from "~/components/ui/text";
import { call, openSource } from "~/lib/links";
import { useTheme } from "~/theme/theme";

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Il grande pulsante del 112, sempre per primo */
export function CallEmergency() {
  return (
    <View style={styles.call}>
      <Button label="Chiama il 112" icon={Phone} variant="danger" size="lg" onPress={() => call("112")} hint="Apre il telefono con il 112 già composto" />
      <Txt variant="small" tone="inkMuted" style={styles.center}>
        Gratuito, sempre attivo, anche senza credito.
      </Txt>
    </View>
  );
}

/** Un numero di aiuto con orari, a chi si rivolge e il pulsante per chiamare */
export function HelplineCard({ helpline: h, tone = "surface2" }: { helpline: Helpline; tone?: "surface" | "surface2" }) {
  return (
    <Card tone={tone}>
      <View>
        <Txt bold>{h.name}</Txt>
        <Txt variant="title" tone="primary" style={styles.number}>
          {h.number}
        </Txt>
        <Txt variant="small" tone="inkMuted">
          {sentence(h.hours)}. {sentence(h.audience)}.
        </Txt>
      </View>
      <Button label={`Chiama ${h.number}`} icon={Phone} variant="secondary" onPress={() => call(h.tel)} hint="Apre il telefono con il numero già composto" />
    </Card>
  );
}

/** Il link a una fonte ufficiale, che si apre nel browser */
export function SourceLink({ title, url }: { title: string; url: string }) {
  const { colors } = useTheme();
  return (
    <Pressable role="link" accessibilityHint="Si apre nel browser" onPress={() => openSource(url)} style={styles.source}>
      <Txt variant="small" bold style={styles.sourceText}>
        Fonte: {title}
      </Txt>
      <ExternalLink color={colors.ink} size={16} />
    </Pressable>
  );
}

/** Un segnale d'allarme da riconoscere: si apre per sapere cosa fare */
export function RedFlagItem({ id }: { id: RedFlagId }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const flag = RED_FLAGS[id];
  return (
    <View style={[styles.flag, { backgroundColor: colors.surface, borderColor: open ? colors.red : colors.line }]}>
      <Pressable role="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((o) => !o)} style={styles.flagHead}>
        <Txt bold style={styles.flagTitle}>
          {flag.title}
        </Txt>
        <ChevronDown color={colors.red} size={22} style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }} />
      </Pressable>
      {open && (
        <View style={styles.flagBody}>
          <Txt variant="small" tone="inkMuted">
            {flag.checklist}.
          </Txt>
          {flag.steps.map((step, i) => (
            <View key={step} style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.redSoft }]}>
                <Txt variant="small" bold tone="red">
                  {i + 1}
                </Txt>
              </View>
              <Txt style={styles.stepText}>{step}</Txt>
            </View>
          ))}
          <SourceLink title={flag.source.title} url={flag.source.url} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  call: { gap: 8 },
  center: { textAlign: "center" },
  number: { fontVariant: ["tabular-nums"] },
  source: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44 },
  sourceText: { textDecorationLine: "underline", flexShrink: 1 },
  flag: { borderWidth: 1, borderRadius: 20 },
  flagHead: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingHorizontal: 16, paddingVertical: 12 },
  flagTitle: { flex: 1 },
  flagBody: { gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  step: { flexDirection: "row", gap: 12 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  stepText: { flex: 1, paddingTop: 3 },
});
