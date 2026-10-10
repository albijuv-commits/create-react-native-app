import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { Check, ChevronDown, ClipboardCopy, FileDown, LoaderCircle, Share2, type LucideIcon } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, Share, StyleSheet, View } from "react-native";
import riepilogo from "@/assets/illustrations/riepilogo-medico.webp";
import { Txt } from "~/components/ui/text";
import { announceOnIOS } from "~/lib/a11y";
import { shareSummaryPdf } from "~/lib/summary-pdf";
import { useTheme } from "~/theme/theme";

type Status = "idle" | "copiato" | "copia-fallita" | "pdf-in-corso" | "pdf-pronto" | "pdf-fallito";

const MESSAGES: Record<Status, string> = {
  idle: "",
  copiato: "Riepilogo copiato: puoi incollarlo in un messaggio o in una email.",
  "copia-fallita": "Non riusciamo a copiare: apri il riepilogo qui sotto, tieni premuto sul testo e copialo.",
  "pdf-in-corso": "Preparo il PDF…",
  "pdf-pronto": "PDF pronto.",
  "pdf-fallito": "Non riusciamo a creare il PDF. Puoi copiare il testo.",
};

/**
 * Il riepilogo da portare al medico: si legge qui, si copia, si condivide o si crea un PDF da salvare
 * o mandare. Il PDF si crea sul telefono e si cancella dopo la condivisione.
 */
export function DoctorSummary({ text }: { text: string }) {
  const { colors } = useTheme();
  const [status, setStatus] = useState<Status>("idle");
  const [open, setOpen] = useState(false);
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (reset.current !== null) clearTimeout(reset.current);
    },
    [],
  );

  const show = (next: Status, clearAfter?: number) => {
    setStatus(next);
    announceOnIOS(MESSAGES[next]);
    if (reset.current !== null) clearTimeout(reset.current);
    reset.current = clearAfter ? setTimeout(() => setStatus("idle"), clearAfter) : null;
  };

  const copy = async () => {
    try {
      if (!(await Clipboard.setStringAsync(text))) throw new Error("copia non riuscita");
      show("copiato", 2500);
    } catch {
      setOpen(true);
      show("copia-fallita");
    }
  };

  const pdf = async () => {
    show("pdf-in-corso");
    try {
      const how = await shareSummaryPdf(text);
      // Sul web si apre la finestra di stampa del browser, che dice già cosa succede
      if (how === "condiviso") show("pdf-pronto", 2500);
      else show("idle");
    } catch {
      show("pdf-fallito");
    }
  };

  const share = async () => {
    try {
      await Share.share({ title: "Riepilogo per il medico", message: text });
    } catch {
      // La persona ha chiuso la finestra di condivisione: niente da segnalare
    }
  };

  return (
    <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.line }]}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Txt variant="heading" header>
            Riepilogo per il medico
          </Txt>
          <Txt variant="small" tone="inkMuted">
            Racconta in modo ordinato cosa hai descritto e cosa hai risposto. Mostralo al medico o mandaglielo.
          </Txt>
        </View>
        <Image source={riepilogo} style={styles.art} contentFit="contain" accessible={false} />
      </View>

      <View style={styles.actions}>
        <Action label={status === "copiato" ? "Copiato" : "Copia"} icon={status === "copiato" ? Check : ClipboardCopy} onPress={copy} />
        <Action label="PDF" icon={status === "pdf-in-corso" ? LoaderCircle : FileDown} onPress={pdf} disabled={status === "pdf-in-corso"} hint="Crea un PDF da salvare o mandare" />
        <Action label="Condividi" icon={Share2} onPress={share} />
      </View>

      <Txt variant="small" bold tone="primary" accessibilityLiveRegion="polite" style={styles.status}>
        {MESSAGES[status]}
      </Txt>

      <View style={[styles.details, { backgroundColor: colors.surface2 }]}>
        <Pressable role="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((o) => !o)} style={styles.detailsHead}>
          <Txt bold tone="primary" style={styles.flex}>
            Leggi il riepilogo
          </Txt>
          <ChevronDown color={colors.primary} size={20} style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }} />
        </Pressable>
        {open && (
          <Txt variant="small" selectable style={styles.text}>
            {text}
          </Txt>
        )}
      </View>
    </View>
  );
}

/** Pulsante compatto con icona sopra l'etichetta: tre stanno in fila anche su un telefono stretto */
function Action({ label, icon: Icon, onPress, disabled = false, hint }: { label: string; icon: LucideIcon; onPress: () => void; disabled?: boolean; hint?: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled, busy: disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        { borderColor: colors.primary, backgroundColor: colors.surface, opacity: disabled ? 0.6 : 1, transform: [{ scale: pressed && !disabled ? 0.97 : 1 }] },
      ]}
    >
      <Icon color={colors.primary} size={22} strokeWidth={2.2} />
      <Txt variant="small" bold tone="primary">
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { gap: 12, borderWidth: 1, borderRadius: 24, padding: 20 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  headText: { flex: 1, gap: 4 },
  art: { width: 80, height: 80 },
  actions: { flexDirection: "row", gap: 8 },
  action: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, minHeight: 64, borderWidth: 2, borderRadius: 16, paddingHorizontal: 4, paddingVertical: 8 },
  status: { minHeight: 22 },
  details: { borderRadius: 16 },
  detailsHead: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 48, paddingHorizontal: 16 },
  flex: { flex: 1 },
  text: { paddingHorizontal: 16, paddingBottom: 16 },
});
