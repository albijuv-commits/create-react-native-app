import { router } from "expo-router";
import { Archive, Check, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { HistoryEntry } from "@/lib/storage/history";
import { Button } from "~/components/ui/button";
import { Txt } from "~/components/ui/text";
import { announceOnIOS } from "~/lib/a11y";
import { deleteSession, saveSession } from "~/lib/history";
import { useTheme } from "~/theme/theme";

type Status = "idle" | "saving" | "saved" | "removed" | "save-failed" | "remove-failed";

const ANNOUNCE: Partial<Record<Status, string>> = {
  saved: "Sessione salvata nello storico, solo su questo telefono.",
  removed: "Sessione eliminata dallo storico.",
  "save-failed": "Non riusciamo a salvare la sessione su questo telefono.",
  "remove-failed": "Non riusciamo a eliminare la sessione dallo storico.",
};

/**
 * Salvare la sessione è una scelta della persona, come nella web app: il consenso dell'intervista
 * vale solo per l'intervista. Lo storico resta su questo telefono e si può eliminare quando si vuole.
 */
export function SaveToHistory({ entry }: { entry: HistoryEntry }) {
  const { colors } = useTheme();
  const [status, setStatus] = useState<Status>("idle");

  const show = (next: Status) => {
    setStatus(next);
    const text = ANNOUNCE[next];
    if (text) announceOnIOS(text);
  };

  const save = async () => {
    setStatus("saving");
    try {
      await saveSession(entry);
      show("saved");
    } catch {
      show("save-failed");
    }
  };

  const remove = async () => {
    try {
      await deleteSession(entry.id);
      show("removed");
    } catch {
      // La sessione è ancora salvata: si resta sul riquadro «salvata», con l'errore
      show("remove-failed");
    }
  };

  return (
    <View style={[styles.box, { backgroundColor: colors.surface2 }]}>
      <Txt variant="heading" header>
        Storico delle sessioni
      </Txt>
      {status === "saved" || status === "remove-failed" ? (
        <>
          <View style={styles.row} accessibilityLiveRegion="polite">
            <Check color={colors.primary} size={20} style={styles.icon} />
            <Txt variant="small" style={styles.flex}>
              Salvata solo su questo telefono. La ritrovi nel{" "}
              <Txt variant="small" bold tone="primary" role="link" accessibilityHint="Apre il Profilo" onPress={() => router.navigate("/profilo")} style={styles.link}>
                Profilo
              </Txt>
              .
            </Txt>
          </View>
          <Button label="Elimina dallo storico" icon={Trash2} variant="ghost" onPress={() => void remove()} />
        </>
      ) : (
        <>
          <Txt variant="small" accessibilityLiveRegion="polite">
            {status === "removed"
              ? "Eliminata dallo storico: su questo telefono non resta."
              : "Puoi salvare questa sessione per rileggerla più avanti. Resta solo su questo telefono e la elimini quando vuoi."}
          </Txt>
          {status !== "removed" && (
            <Button label="Salva nello storico" icon={Archive} variant="secondary" busy={status === "saving"} onPress={() => void save()} />
          )}
        </>
      )}
      {status === "save-failed" && (
        <Txt variant="small" bold tone="red" accessibilityLiveRegion="polite">
          Non riusciamo a salvare su questo telefono. Riprova tra poco.
        </Txt>
      )}
      {status === "remove-failed" && (
        <Txt variant="small" bold tone="red" accessibilityLiveRegion="polite">
          Non riusciamo a eliminarla: è ancora nello storico. Riprova tra poco.
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 12, borderRadius: 24, padding: 20 },
  row: { flexDirection: "row", gap: 8 },
  icon: { marginTop: 2 },
  flex: { flex: 1 },
  link: { textDecorationLine: "underline" },
});
