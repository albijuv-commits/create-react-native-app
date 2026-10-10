import { Image } from "expo-image";
import { House, LocateFixed, MapPin, Search, Settings } from "lucide-react-native";
import { useRef, useState } from "react";
import { Linking, Platform, StyleSheet, TextInput, View } from "react-native";
import mappa from "@/assets/illustrations/stato-mappa.webp";
import { DoctorsRequestError } from "@/lib/doctors/client";
import { FieldError } from "~/components/triage/parts";
import { Button } from "~/components/ui/button";
import { Txt } from "~/components/ui/text";
import { apiBaseUrl, findPlace } from "~/lib/api";
import { currentPosition, LocationError } from "~/lib/location";
import { useTheme } from "~/theme/theme";
import { textStyle } from "~/theme/type";
import { OsmCredit } from "./credits";

export interface Origin {
  kind: "gps" | "luogo";
  label: string;
  lat: number;
  lon: number;
}

/**
 * Dove cercare: la posizione del telefono (con il permesso della persona) oppure città o CAP.
 * La ricerca del luogo parte solo all'invio e passa dal servizio di Orienta: Nominatim non permette
 * il completamento automatico.
 */
export function LocationPicker({ origin, onOrigin }: { origin: Origin | null; onOrigin: (origin: Origin) => void }) {
  const { colors, scale, prefs } = useTheme();
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [busy, setBusy] = useState<"posizione" | "luogo" | "predefinita" | null>(null);
  const [error, setError] = useState<{ message: string; settings: boolean } | null>(null);
  const controller = useRef<AbortController | null>(null);
  const canSearchPlaces = apiBaseUrl() !== null;
  const defaultCity = canSearchPlaces ? prefs.defaultCity.trim() : "";
  const open = !origin || editing;

  const choose = (next: Origin) => {
    setError(null);
    setEditing(false);
    onOrigin(next);
  };

  const locate = async () => {
    setBusy("posizione");
    setError(null);
    try {
      const point = await currentPosition();
      choose({ kind: "gps", label: "La tua posizione", ...point });
    } catch (e) {
      setError(
        e instanceof LocationError
          ? { message: e.message, settings: e.settings }
          : { message: "Non riusciamo a trovare la tua posizione in questo momento. Scrivi la città o il CAP.", settings: false },
      );
    } finally {
      setBusy(null);
    }
  };

  const find = async (q: string, kind: "luogo" | "predefinita") => {
    if (q.length < 2) {
      setError({ message: "Scrivi il nome di una città o un CAP.", settings: false });
      return;
    }
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    setBusy(kind);
    setError(null);
    try {
      const place = await findPlace(q, c.signal);
      if (c.signal.aborted) return;
      if (!place) setError({ message: `Non troviamo «${q}». Controlla come è scritto, oppure prova con il CAP.`, settings: false });
      else choose({ kind: "luogo", ...place });
    } catch (e) {
      if (c.signal.aborted) return;
      setError({ message: e instanceof DoctorsRequestError ? e.message : "Qualcosa è andato storto. Riprova tra poco.", settings: false });
    } finally {
      if (!c.signal.aborted) setBusy(null);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Txt variant="heading" header style={styles.flex}>
          Dove?
        </Txt>
        {!origin && <Image source={mappa} style={styles.art} contentFit="contain" accessible={false} />}
      </View>

      {origin && (
        <View style={[styles.current, { backgroundColor: colors.surface2 }]}>
          <MapPin color={colors.primary} size={24} />
          <View style={styles.flex}>
            <Txt variant="small" tone="inkMuted">
              Vicino a
            </Txt>
            <Txt bold>{origin.label}</Txt>
          </View>
          {!editing && (
            <Button label="Cambia" variant="ghost" onPress={() => setEditing(true)} hint={`Cambia posizione, ora: ${origin.label}`} style={styles.change} />
          )}
        </View>
      )}

      {open && (
        <View style={styles.form}>
          {defaultCity !== "" && (
            <Button
              label={busy === "predefinita" ? `Cerco ${defaultCity}…` : `Cerca a ${defaultCity}`}
              icon={House}
              variant="secondary"
              size="lg"
              busy={busy === "predefinita"}
              disabled={busy !== null}
              onPress={() => void find(defaultCity, "predefinita")}
            />
          )}

          <Button
            label={busy === "posizione" ? "Cerco la tua posizione…" : "Usa la mia posizione"}
            icon={LocateFixed}
            size="lg"
            busy={busy === "posizione"}
            disabled={busy !== null}
            onPress={() => void locate()}
          />

          {canSearchPlaces ? (
            <>
              <View aria-hidden style={styles.or}>
                <View style={[styles.rule, { backgroundColor: colors.line }]} />
                <Txt variant="small" tone="inkMuted">
                  oppure
                </Txt>
                <View style={[styles.rule, { backgroundColor: colors.line }]} />
              </View>

              <View style={styles.field}>
                <Txt bold aria-hidden>
                  Città o CAP
                </Txt>
                <View style={styles.searchRow}>
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    maxLength={80}
                    accessibilityLabel="Città o CAP"
                    placeholder="Ad esempio Bologna o 40121"
                    placeholderTextColor={colors.inkMuted}
                    autoComplete="postal-address-locality"
                    textContentType="addressCity"
                    returnKeyType="search"
                    onSubmitEditing={() => void find(query.trim(), "luogo")}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={[
                      styles.input,
                      textStyle("body", scale, false),
                      { color: colors.ink, backgroundColor: colors.surface, borderColor: focused ? colors.primary : colors.line },
                      Platform.select({ web: { outlineWidth: 0 }, default: {} }),
                    ]}
                  />
                  <Button
                    label="Cerca"
                    icon={Search}
                    variant="secondary"
                    busy={busy === "luogo"}
                    disabled={busy !== null}
                    onPress={() => void find(query.trim(), "luogo")}
                  />
                </View>
              </View>
            </>
          ) : (
            <Txt variant="small" tone="inkMuted">
              Questa app non è collegata al servizio di Orienta: puoi cercare solo con la tua posizione e vedrai DATI DI ESEMPIO.
            </Txt>
          )}

          {error && (
            <View style={styles.error}>
              <FieldError>{error.message}</FieldError>
              {error.settings && <Button label="Apri le impostazioni" icon={Settings} variant="ghost" onPress={() => void Linking.openSettings()} />}
            </View>
          )}

          <Txt variant="small" tone="inkMuted">
            La posizione serve solo per questa ricerca: prima di cercare la arrotondiamo a circa 100 metri e non la salviamo.
          </Txt>
          {origin && <Button label="Annulla" variant="ghost" onPress={() => setEditing(false)} />}
        </View>
      )}

      {canSearchPlaces && <OsmCredit before="Luoghi cercati con Nominatim · dati © " />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  art: { width: 72, height: 72 },
  current: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 12 },
  change: { minHeight: 44 },
  form: { gap: 12 },
  or: { flexDirection: "row", alignItems: "center", gap: 12 },
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
  field: { gap: 8 },
  searchRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, minHeight: 52, borderWidth: 2, borderRadius: 16, paddingHorizontal: 16 },
  error: { gap: 4 },
});
