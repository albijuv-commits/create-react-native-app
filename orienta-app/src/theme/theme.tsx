import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { DEFAULT_PREFS, parsePrefs, PREFS_STORAGE_KEY, resolveTheme, type Prefs } from "@/lib/prefs/prefs";
import { DARK, LIGHT, type Palette } from "./colors";
import { TEXT_SCALE } from "./type";

export interface Theme {
  prefs: Prefs;
  /** false finché le preferenze non sono state lette dal dispositivo */
  ready: boolean;
  updatePrefs: (patch: Partial<Prefs>) => void;
  resetPrefs: () => void;
  scheme: "light" | "dark";
  colors: Palette;
  /** Moltiplicatore della dimensione del testo scelta nel Profilo */
  scale: number;
}

const ThemeContext = createContext<Theme | null>(null);

/**
 * Tema e preferenze dell'app. Le preferenze (tema, dimensione del testo, città predefinita) sono
 * le stesse della web app, con lo stesso schema Zod, e restano su questo dispositivo.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemDark = useColorScheme() === "dark";
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(PREFS_STORAGE_KEY).then(
      (raw) => {
        if (!active) return;
        setPrefs(parsePrefs(raw));
        setReady(true);
      },
      () => {
        // Archiviazione non disponibile: restano le preferenze di partenza
        if (active) setReady(true);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const updatePrefs = useCallback(
    (patch: Partial<Prefs>) => {
      const next = { ...prefs, ...patch };
      setPrefs(next);
      AsyncStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next)).catch(() => {
        // Se non si può salvare, la preferenza vale fino alla chiusura dell'app
      });
    },
    [prefs],
  );

  const resetPrefs = useCallback(() => {
    setPrefs(DEFAULT_PREFS);
    AsyncStorage.removeItem(PREFS_STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo<Theme>(() => {
    const scheme = resolveTheme(prefs.theme, systemDark);
    return { prefs, ready, updatePrefs, resetPrefs, scheme, colors: scheme === "dark" ? DARK : LIGHT, scale: TEXT_SCALE[prefs.textSize] };
  }, [prefs, ready, updatePrefs, resetPrefs, systemDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("useTheme va usato dentro ThemeProvider");
  return theme;
}
