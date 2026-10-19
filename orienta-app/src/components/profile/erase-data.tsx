import { Trash2 } from "lucide-react-native";
import { useRef, useState } from "react";
import { StyleSheet, View, type Text } from "react-native";
import { Button } from "~/components/ui/button";
import { Txt } from "~/components/ui/text";
import { focusLater } from "~/lib/a11y";
import { confirmAction } from "~/lib/confirm";
import { eraseAllMyData, type ErasePart } from "~/lib/erase";
import { useTheme } from "~/theme/theme";

type Status = { kind: "idle" } | { kind: "busy" } | { kind: "done"; failed: ErasePart[] };

const WHAT = [
  "lo storico delle sessioni;",
  "le preferenze e la città predefinita;",
  "i preferiti e il confronto del Mercato;",
  "il riepilogo pronto per l'email al medico;",
  "un'intervista lasciata a metà.",
];

/** «Elimina tutti i miei dati»: con una conferma, perché non si può annullare */
export function EraseData() {
  const { colors, resetPrefs } = useTheme();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const result = useRef<Text>(null);

  const erase = async () => {
    setStatus({ kind: "busy" });
    const { failed } = await eraseAllMyData();
    resetPrefs();
    setStatus({ kind: "done", failed });
    focusLater(result);
  };

  const ask = () =>
    confirmAction({
      title: "Eliminare tutti i tuoi dati?",
      message: `Da questo telefono spariscono:\n${WHAT.map((w) => `• ${w}`).join("\n")}\n\nNon si può annullare.`,
      confirm: "Sì, elimina tutto",
      cancel: "Annulla",
      onConfirm: () => void erase(),
    });

  return (
    <View style={styles.wrap}>
      <Button label="Elimina tutti i miei dati" icon={Trash2} variant="danger" busy={status.kind === "busy"} onPress={ask} />
      {status.kind === "done" && (
        <View style={[styles.result, { backgroundColor: colors.surface2 }]}>
          <Txt ref={result} variant="small" bold accessibilityRole="alert" accessibilityLiveRegion="polite">
            {status.failed.length === 0
              ? "Fatto: su questo telefono non resta nessun dato di Orienta."
              : `Quasi tutto eliminato. Non siamo riusciti a cancellare: ${status.failed.join(", ")}. Puoi farlo dalle impostazioni del telefono, cancellando i dati dell'app, oppure disinstallandola.`}
          </Txt>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  result: { borderRadius: 16, padding: 16 },
});
