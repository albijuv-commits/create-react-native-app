import * as WebBrowser from "expo-web-browser";
import { Alert, Linking } from "react-native";
import { EMERGENCY_NUMBER } from "@data/emergency/helplines";

/**
 * Apre il telefono con il numero già scritto: la chiamata la fa la persona. Se il dispositivo non
 * sa telefonare (un tablet solo Wi-Fi, per esempio) lo dice, con il numero da comporre altrove.
 */
export function call(tel: string) {
  Linking.openURL(`tel:${tel}`).catch(() => {
    Alert.alert("Non riusciamo ad aprire il telefono", `Componi ${tel} dal tastierino di un telefono.`);
  });
}

/** Il 112, dal numero verificato nei dati dell'app */
export function callEmergency() {
  call(EMERGENCY_NUMBER.tel);
}

/** Apre una fonte esterna nel browser di sistema, sopra l'app */
export function openSource(url: string) {
  void WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url));
}
