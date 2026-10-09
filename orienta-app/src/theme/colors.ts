/**
 * I colori della web app (orienta/src/app/globals.css), ispirati ai vetrini di istologia:
 * blu-viola dell'ematossilina per titoli e azioni, rosa dell'eosina per gli accenti, verde
 * solo per «Senza ricetta», ambra, arancio e rosso per l'urgenza. Contrasto WCAG AA in tutti e due i temi.
 */
export interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  inkMuted: string;
  line: string;
  primary: string;
  onPrimary: string;
  primarySoft: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  otc: string;
  otcSoft: string;
  calm: string;
  calmSoft: string;
  amber: string;
  amberSoft: string;
  orange: string;
  orangeSoft: string;
  red: string;
  onRed: string;
  redSoft: string;
  focus: string;
}

export const LIGHT: Palette = {
  bg: "#f6f8fb",
  surface: "#ffffff",
  surface2: "#eef0f7",
  ink: "#1a1b2e",
  inkMuted: "#545670",
  line: "#d9dce8",
  primary: "#3b2c85",
  onPrimary: "#ffffff",
  primarySoft: "#e7e3f7",
  accent: "#c2185b",
  onAccent: "#ffffff",
  accentSoft: "#fce4ee",
  otc: "#1b7a47",
  otcSoft: "#dff3e7",
  calm: "#2d5f80",
  calmSoft: "#e1edf5",
  amber: "#8a5300",
  amberSoft: "#fdf0d8",
  orange: "#b4400c",
  orangeSoft: "#fde6da",
  red: "#b42318",
  onRed: "#ffffff",
  redSoft: "#fde4e1",
  focus: "#c2185b",
};

export const DARK: Palette = {
  bg: "#12121f",
  surface: "#1c1c2e",
  surface2: "#26263b",
  ink: "#edebf7",
  inkMuted: "#b4b1c9",
  line: "#36364f",
  primary: "#b3a8ff",
  onPrimary: "#1a1440",
  primarySoft: "#2c2650",
  accent: "#ff8db8",
  onAccent: "#3a0a1e",
  accentSoft: "#3d1a2b",
  otc: "#6fd49d",
  otcSoft: "#163527",
  calm: "#8fc1e3",
  calmSoft: "#1a2c3a",
  amber: "#f2b661",
  amberSoft: "#3a2a10",
  orange: "#ff9e6e",
  orangeSoft: "#3d2014",
  red: "#ff8a80",
  onRed: "#3a0805",
  redSoft: "#3f1715",
  focus: "#ff8db8",
};
