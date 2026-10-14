import type { RefObject } from "react";
import { AccessibilityInfo, Platform } from "react-native";

type Focusable = Parameters<typeof AccessibilityInfo.sendAccessibilityEvent>[0];

/**
 * Porta VoiceOver o TalkBack su un elemento, di solito il titolo di un passo appena comparso, dopo
 * un attimo perché il lettore di schermo veda il nuovo contenuto. Restituisce la funzione che annulla.
 */
export function focusLater(ref: RefObject<Focusable | null>, delay = 250): () => void {
  // Sul web la pagina è un aiuto allo sviluppo: il focus da tastiera lo gestisce il browser
  if (Platform.OS === "web") return () => {};
  const timer = setTimeout(() => {
    if (ref.current) AccessibilityInfo.sendAccessibilityEvent(ref.current, "focus");
  }, delay);
  return () => clearTimeout(timer);
}

/** Fa leggere una frase a VoiceOver; su Android e sul web la legge la regione «live» che la mostra */
export function announceOnIOS(text: string) {
  if (Platform.OS === "ios" && text) AccessibilityInfo.announceForAccessibility(text);
}
