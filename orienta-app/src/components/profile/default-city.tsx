import { Check, MapPin } from "lucide-react-native";
import { useState } from "react";
import { Keyboard, Platform, StyleSheet, TextInput, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Txt } from "~/components/ui/text";
import { announceOnIOS } from "~/lib/a11y";
import { useTheme } from "~/theme/theme";
import { textStyle } from "~/theme/type";

/** La città predefinita per la ricerca dei medici, nelle preferenze sul telefono (come nella web app) */
export function DefaultCity() {
  const { colors, scale, prefs, updatePrefs } = useTheme();
  // null finché la persona non scrive: il campo mostra la città salvata, anche dopo «Elimina tutti i miei dati»
  const [draft, setDraft] = useState<string | null>(null);
  const [savedCity, setSavedCity] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  // La conferma vale finché la città salvata è ancora quella
  const confirmed = draft === null && savedCity !== null && savedCity === prefs.defaultCity;

  const submit = () => {
    const city = (draft ?? prefs.defaultCity).trim().replace(/\s+/g, " ").slice(0, 80);
    updatePrefs({ defaultCity: city });
    setDraft(null);
    setSavedCity(city);
    Keyboard.dismiss();
    announceOnIOS(city ? "Città salvata." : "Città predefinita tolta.");
  };

  return (
    <View style={styles.wrap}>
      <Txt bold aria-hidden>
        Città predefinita
      </Txt>
      <Txt variant="small" tone="inkMuted">
        Nella sezione Medici ti proponiamo di cercare qui. Resta su questo telefono.
      </Txt>
      <View style={styles.row}>
        <TextInput
          value={draft ?? prefs.defaultCity}
          onChangeText={setDraft}
          maxLength={80}
          accessibilityLabel="Città predefinita"
          accessibilityHint="Nella sezione Medici ti proponiamo di cercare qui"
          placeholder="Es. Bologna o 40121"
          placeholderTextColor={colors.inkMuted}
          autoComplete="postal-address-locality"
          textContentType="addressCity"
          returnKeyType="done"
          onSubmitEditing={submit}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            textStyle("body", scale, false),
            { color: colors.ink, backgroundColor: colors.surface, borderColor: focused ? colors.primary : colors.line },
            Platform.select({ web: { outlineWidth: 0 }, default: {} }),
          ]}
        />
        <Button label="Salva" icon={MapPin} variant="secondary" onPress={submit} />
      </View>
      <View accessibilityLiveRegion="polite" style={styles.status}>
        {confirmed && (
          <>
            <Check color={colors.primary} size={16} strokeWidth={3} />
            <Txt variant="small" bold tone="primary">
              {savedCity ? "Città salvata." : "Città predefinita tolta."}
            </Txt>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: { flex: 1, minHeight: 52, borderWidth: 2, borderRadius: 16, paddingHorizontal: 16 },
  status: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 20 },
});
