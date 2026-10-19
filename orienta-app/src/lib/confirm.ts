import { Alert, Platform } from "react-native";

/**
 * Chiede conferma prima di un'azione che non si può annullare: la finestra di sistema del telefono
 * (VoiceOver e TalkBack la leggono da sé); sul web quella del browser.
 */
export function confirmAction({ title, message, confirm, cancel, onConfirm }: { title: string; message: string; confirm: string; cancel: string; onConfirm: () => void }) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancel, style: "cancel" },
    { text: confirm, style: "destructive", onPress: onConfirm },
  ]);
}
