import { AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold, useFonts } from "@expo-google-fonts/atkinson-hyperlegible";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, useTheme } from "~/theme/theme";
import { FONTS } from "~/theme/type";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold });
  if (!loaded && !error) return null;
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <AppStack />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });

function AppStack() {
  const { scheme, colors, ready } = useTheme();

  // Lo splash resta finché non sappiamo il tema scelto: niente lampi di colore sbagliato
  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  const navigationTheme = useMemo(() => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    // Ogni peso di Atkinson Hyperlegible è una famiglia a sé: niente grassetto simulato
    const font = (fontFamily: string) => ({ fontFamily, fontWeight: "400" as const });
    return {
      ...base,
      colors: { ...base.colors, primary: colors.primary, background: colors.bg, card: colors.bg, text: colors.ink, border: colors.line, notification: colors.accent },
      fonts: { regular: font(FONTS.regular), medium: font(FONTS.regular), bold: font(FONTS.bold), heavy: font(FONTS.bold) },
    };
  }, [scheme, colors]);

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerTintColor: colors.primary, headerShadowVisible: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Orienta" }} />
        <Stack.Screen name="emergenza" options={{ title: "Emergenza", headerTintColor: colors.red }} />
        <Stack.Screen name="vetrino" options={{ title: "Galleria del vetrino" }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
