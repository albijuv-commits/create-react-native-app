import type { ErrorBoundaryProps } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { EMERGENCY_NUMBER } from "@data/emergency/helplines";
import { call } from "~/lib/links";
import { DARK, LIGHT } from "~/theme/colors";

/**
 * Se una schermata si blocca per un errore: nessun dettaglio tecnico (potrebbe contenere ciò che la
 * persona ha scritto), il 112 sempre a portata e un pulsante per riprovare. Non usa il tema né i
 * caratteri dell'app, che in quel momento potrebbero non esserci.
 */
export function ErrorScreen({ retry }: Pick<ErrorBoundaryProps, "retry">) {
  const colors = useColorScheme() === "dark" ? DARK : LIGHT;
  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <Text role="heading" style={[styles.title, { color: colors.primary }]}>
        Qualcosa è andato storto
      </Text>
      <Text style={[styles.text, { color: colors.ink }]}>Questa schermata non si è aperta come doveva. I dati salvati sul telefono non sono stati toccati.</Text>
      <View style={[styles.box, { backgroundColor: colors.redSoft }]}>
        <Text style={[styles.text, styles.bold, { color: colors.ink }]}>Se stai male non aspettare: chiama il {EMERGENCY_NUMBER.number}.</Text>
        <Pressable
          role="button"
          accessibilityLabel={`Chiama il ${EMERGENCY_NUMBER.number}`}
          accessibilityHint="Apre il telefono con il numero già composto"
          onPress={() => call(EMERGENCY_NUMBER.tel)}
          style={({ pressed }) => [styles.button, { backgroundColor: colors.red, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
        >
          <Text style={[styles.buttonText, { color: colors.onRed }]}>Chiama il {EMERGENCY_NUMBER.number}</Text>
        </Pressable>
      </View>
      <Pressable
        role="button"
        onPress={() => void retry()}
        style={({ pressed }) => [styles.button, styles.secondary, { borderColor: colors.primary, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
      >
        <Text style={[styles.buttonText, { color: colors.primary }]}>Riprova</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: "center", gap: 20, padding: 24, paddingTop: 64, width: "100%", maxWidth: 640, alignSelf: "center" },
  title: { fontSize: 30, lineHeight: 36, fontWeight: "700" },
  text: { fontSize: 18, lineHeight: 27 },
  bold: { fontWeight: "700" },
  box: { gap: 12, borderRadius: 24, padding: 20 },
  button: { minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 18, paddingHorizontal: 20 },
  secondary: { borderWidth: 2 },
  buttonText: { fontSize: 18, fontWeight: "700" },
});
