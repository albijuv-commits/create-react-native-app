import * as WebBrowser from "expo-web-browser";
import { Linking } from "react-native";

/** Apre il telefono con il numero già scritto: la chiamata la fa la persona */
export function call(tel: string) {
  void Linking.openURL(`tel:${tel}`);
}

/** Apre una fonte esterna nel browser di sistema, sopra l'app */
export function openSource(url: string) {
  void WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url));
}
