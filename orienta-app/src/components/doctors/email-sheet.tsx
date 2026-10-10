import * as Clipboard from "expo-clipboard";
import { Check, ChevronDown, ClipboardCopy, Mail, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Linking, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buildDoctorEmail, mailtoHref } from "@/lib/doctors/email";
import type { Doctor } from "@/lib/doctors/schema";
import { CheckRow, FieldError } from "~/components/triage/parts";
import { Button } from "~/components/ui/button";
import { Txt } from "~/components/ui/text";
import { announceOnIOS } from "~/lib/a11y";
import { useTheme } from "~/theme/theme";

/**
 * Prima di aprire l'app di posta la persona vede a chi scrive e cosa: può togliere il riepilogo dei
 * sintomi, leggere il testo o copiarlo. Poi lo rivede e lo invia lei, dalla sua app: Orienta non
 * invia nulla.
 */
export function EmailSheet({
  doctor,
  specialtyLabel,
  summary,
  onClose,
}: {
  doctor: Doctor | null;
  specialtyLabel: string | null;
  summary: string | null;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [include, setInclude] = useState(true);
  const [textOpen, setTextOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [noMailApp, setNoMailApp] = useState(false);
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (reset.current !== null) clearTimeout(reset.current);
    },
    [],
  );

  const to = doctor?.email ?? null;
  const email = buildDoctorEmail({ specialtyLabel, summary: include ? summary : null });

  const close = () => {
    setTextOpen(false);
    setCopied(false);
    setNoMailApp(false);
    onClose();
  };

  const openMail = async () => {
    if (!to) return;
    try {
      await Linking.openURL(mailtoHref(to, email));
    } catch {
      setNoMailApp(true);
    }
  };

  const copy = async () => {
    try {
      if (!(await Clipboard.setStringAsync(`A: ${to}\nOggetto: ${email.subject}\n\n${email.body}`))) throw new Error("copia non riuscita");
      setCopied(true);
      announceOnIOS("Testo dell'email copiato.");
      if (reset.current !== null) clearTimeout(reset.current);
      reset.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
      setTextOpen(true);
    }
  };

  return (
    <Modal visible={doctor !== null && to !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      {doctor && to && (
        <ScrollView style={{ backgroundColor: colors.surface }} contentContainerStyle={[styles.sheet, { paddingBottom: Math.max(24, insets.bottom + 16) }]}>
          <View style={styles.head}>
            <Txt variant="title" header style={styles.flex}>
              Email a {doctor.name}
            </Txt>
            <Pressable role="button" accessibilityLabel="Chiudi" onPress={close} style={({ pressed }) => [styles.close, pressed && { backgroundColor: colors.surface2 }]}>
              <X color={colors.inkMuted} size={24} />
            </Pressable>
          </View>
          <Txt variant="small" tone="inkMuted">
            Si apre la tua app di posta con il testo già scritto: rileggilo, completalo con il tuo nome e invialo tu.
          </Txt>

          <View style={[styles.box, { backgroundColor: colors.surface2 }]}>
            <Txt variant="small">
              <Txt variant="small" bold>
                A:{" "}
              </Txt>
              {to}
            </Txt>
            <Txt variant="small">
              <Txt variant="small" bold>
                Oggetto:{" "}
              </Txt>
              {email.subject}
            </Txt>
          </View>

          {summary && (
            <CheckRow
              checked={include}
              onChange={setInclude}
              label="Aggiungi il riepilogo dei sintomi"
              note="Quello preparato con l'intervista. Lo vedrai prima di inviare."
            />
          )}

          <View style={[styles.details, { backgroundColor: colors.surface2 }]}>
            <Pressable role="button" accessibilityState={{ expanded: textOpen }} onPress={() => setTextOpen((o) => !o)} style={styles.detailsHead}>
              <Txt bold tone="primary" style={styles.flex}>
                Leggi il testo
              </Txt>
              <ChevronDown color={colors.primary} size={20} style={{ transform: [{ rotate: textOpen ? "180deg" : "0deg" }] }} />
            </Pressable>
            {textOpen && (
              <Txt variant="small" selectable style={styles.body}>
                {email.body}
              </Txt>
            )}
          </View>

          <View style={styles.actions}>
            <Button label="Apri l'app di posta" icon={Mail} size="lg" onPress={() => void openMail()} hint="Si apre l'app di posta con il testo già scritto" />
            <Button label={copied ? "Testo copiato" : "Copia il testo"} icon={copied ? Check : ClipboardCopy} variant="secondary" onPress={() => void copy()} />
          </View>
          {noMailApp && <FieldError>Non troviamo un&apos;app di posta su questo telefono: copia il testo e incollalo dove preferisci.</FieldError>}
        </ScrollView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { gap: 16, padding: 20 },
  head: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  flex: { flex: 1 },
  close: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginTop: -6, marginRight: -8 },
  box: { gap: 4, borderRadius: 16, padding: 16 },
  details: { borderRadius: 16 },
  detailsHead: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 48, paddingHorizontal: 16 },
  body: { paddingHorizontal: 16, paddingBottom: 16 },
  actions: { gap: 8 },
});
