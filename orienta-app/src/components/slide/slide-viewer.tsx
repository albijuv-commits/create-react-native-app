import { ChevronLeft, ChevronRight, Hand, Pause, Play, RotateCcw, type LucideIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View, type AccessibilityActionEvent } from "react-native";
import { Gesture, GestureDetector, PointerType } from "react-native-gesture-handler";
import { SCENE_STEPS, SCENE_TITLES, type SceneSpec } from "@/lib/slides/catalog";
import { Txt } from "~/components/ui/text";
import { useReducedMotion } from "~/lib/use-reduced-motion";
import { useTheme } from "~/theme/theme";
import { SlideSvg } from "./slide-svg";

/** Lente d'ingrandimento: diametro, bordo e ingrandimento, come nella web app */
const LENS = 120;
const LENS_BORDER = 4;
const ZOOM = 2.4;
/** Tenere premuto così a lungo (senza muoversi) apre la lente */
const HOLD_MS = 280;
const SWIPE_PX = 50;

/** Tempo per passo: abbastanza per leggere la didascalia (minimo 5 secondi) */
function stepDuration(caption: string) {
  return Math.max(5000, caption.length * 60);
}

/**
 * Il vetrino interattivo della scheda: scena animata con didascalie passo per passo e comandi
 * Indietro, Riproduci/Pausa, Avanti. Non parte da solo: il movimento risponde a un'azione.
 * Scorrere di lato cambia passo, tenere premuto apre la lente. Con «Riduci movimento» diventa una
 * sequenza di illustrazioni statiche con le stesse didascalie.
 */
export function SlideViewer({ spec, subject }: { spec: SceneSpec; subject: string }) {
  const reduced = useReducedMotion();
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [width, setWidth] = useState(0);
  const [lens, setLens] = useState<{ x: number; y: number; touch: boolean } | null>(null);
  const last = SCENE_STEPS - 1;
  const caption = spec.captions[step]!;
  const title = `${SCENE_TITLES[spec.scene]}: ${subject}`;

  useEffect(() => {
    if (!playing || reduced) return;
    const timer = setTimeout(() => (step < last ? setStep(step + 1) : setPlaying(false)), stepDuration(caption));
    return () => clearTimeout(timer);
  }, [playing, reduced, step, last, caption]);

  // VoiceOver legge la nuova didascalia; su Android e sul web ci pensa la regione «live»
  useEffect(() => {
    if (started && !reduced && Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(`${step + 1}. ${caption}`);
  }, [started, reduced, step, caption]);

  const play = () => {
    setStarted(true);
    if (step === last) setStep(0);
    setPlaying(true);
  };
  const go = (s: number) => {
    setStarted(true);
    setStep(Math.min(last, Math.max(0, s)));
  };

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])
    .failOffsetY([-14, 14])
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_PX && Math.abs(e.translationX) > Math.abs(e.translationY) * 1.5) go(step + (e.translationX < 0 ? 1 : -1));
    });
  const magnify = Gesture.Pan()
    .runOnJS(true)
    .activateAfterLongPress(HOLD_MS)
    .onStart((e) => setLens({ x: e.x, y: e.y, touch: e.pointerType !== PointerType.MOUSE }))
    .onUpdate((e) => setLens((l) => (l ? { ...l, x: e.x, y: e.y } : l)))
    .onFinalize(() => setLens(null));
  const gestures = Gesture.Race(magnify, swipe);

  const onAction = (e: AccessibilityActionEvent) => {
    if (e.nativeEvent.actionName === "increment") go(step + 1);
    else if (e.nativeEvent.actionName === "decrement") go(step - 1);
  };

  return (
    <View style={styles.figure}>
      <GestureDetector gesture={gestures}>
        <View style={styles.stage} collapsable={false} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          <View
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={`${title}. Passo ${step + 1} di ${SCENE_STEPS}.`}
            accessibilityHint="Scorri in su o in giù per cambiare passo"
            accessibilityValue={{ min: 1, max: SCENE_STEPS, now: step + 1, text: `Passo ${step + 1} di ${SCENE_STEPS}` }}
            accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
            onAccessibilityAction={onAction}
          >
            <SlideSvg spec={spec} step={step} playing={playing} reduced={reduced} />
          </View>
          {lens && width > 0 && (
            <View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                styles.lens,
                { left: lens.x - LENS / 2, top: (lens.touch ? lens.y - LENS * 0.7 : lens.y) - LENS / 2, borderColor: colors.surface, backgroundColor: colors.surface, shadowColor: colors.ink },
              ]}
            >
              <View style={{ position: "absolute", width: width * ZOOM, left: LENS / 2 - LENS_BORDER - lens.x * ZOOM, top: LENS / 2 - LENS_BORDER - lens.y * ZOOM }}>
                <SlideSvg spec={spec} step={step} playing={playing} reduced={reduced} />
              </View>
            </View>
          )}
          {!reduced && !started && (
            <Pressable
              role="button"
              accessibilityLabel={`Avvia l'animazione: ${title}`}
              onPress={play}
              style={({ pressed }) => [styles.playOverlay, { backgroundColor: colors.primary, borderColor: colors.surface, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
            >
              <Play color={colors.onPrimary} fill={colors.onPrimary} size={32} style={styles.playIcon} />
            </Pressable>
          )}
        </View>
      </GestureDetector>

      <View style={styles.hint}>
        <Hand color={colors.inkMuted} size={16} />
        <Txt variant="small" tone="inkMuted" style={styles.hintText}>
          Scorri per cambiare passo · tieni premuto per la lente
        </Txt>
      </View>

      {reduced ? (
        <View role="list" accessibilityLabel="Passi dell'illustrazione" style={styles.captionList}>
          {spec.captions.map((c, i) => (
            <View key={i} role="listitem" style={[styles.captionItem, i === step && { backgroundColor: colors.primarySoft }]}>
              <Txt bold tone="primary">
                {i + 1}.
              </Txt>
              <Txt tone={i === step ? "ink" : "inkMuted"} style={styles.captionText}>
                {c}
              </Txt>
            </View>
          ))}
        </View>
      ) : (
        <View accessibilityLiveRegion="polite" style={[styles.caption, { backgroundColor: colors.surface2 }]}>
          <Txt>
            <Txt bold tone="accent">
              {step + 1}.{" "}
            </Txt>
            {caption}
          </Txt>
        </View>
      )}

      <View style={styles.dots} accessibilityLabel="Passi">
        {Array.from({ length: SCENE_STEPS }, (_, i) => (
          <Pressable
            key={i}
            role="button"
            accessibilityLabel={`Vai al passo ${i + 1}`}
            accessibilityState={{ selected: i === step }}
            onPress={() => go(i)}
            style={styles.dotTarget}
          >
            <View style={[styles.dot, i === step ? [styles.dotActive, { backgroundColor: colors.accent }] : { backgroundColor: colors.line }]} />
          </Pressable>
        ))}
      </View>

      <View style={styles.controls}>
        <ControlButton label="Indietro" icon={ChevronLeft} onPress={() => go(step - 1)} disabled={step === 0} />
        {!reduced &&
          (playing ? (
            <ControlButton label="Pausa" icon={Pause} onPress={() => setPlaying(false)} primary />
          ) : step === last && started ? (
            <ControlButton label="Riguarda" icon={RotateCcw} onPress={play} primary />
          ) : (
            <ControlButton label="Riproduci" icon={Play} onPress={play} primary />
          ))}
        <ControlButton label="Avanti" icon={ChevronRight} onPress={() => go(step + 1)} disabled={step === last} />
      </View>
    </View>
  );
}

function ControlButton({ label, icon: Icon, onPress, disabled = false, primary = false }: { label: string; icon: LucideIcon; onPress: () => void; disabled?: boolean; primary?: boolean }) {
  const { colors } = useTheme();
  const fg = primary ? colors.onPrimary : colors.primary;
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.control,
        { backgroundColor: primary ? colors.primary : colors.surface2, opacity: disabled ? 0.35 : 1, transform: [{ scale: pressed && !disabled ? 0.97 : 1 }] },
      ]}
    >
      <Icon color={fg} size={20} strokeWidth={2.2} />
      <Txt variant="small" bold style={{ color: fg }}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  figure: { gap: 12 },
  stage: { width: "100%", maxWidth: 304, alignSelf: "center" },
  lens: {
    position: "absolute",
    width: LENS,
    height: LENS,
    borderRadius: LENS / 2,
    borderWidth: LENS_BORDER,
    overflow: "hidden",
    shadowOpacity: 0.35,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    zIndex: 10,
  },
  playOverlay: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 64,
    height: 64,
    marginLeft: -32,
    marginTop: -32,
    borderRadius: 32,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: { marginLeft: 4 },
  hint: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  hintText: { textAlign: "center", flexShrink: 1 },
  captionList: { gap: 8 },
  captionItem: { flexDirection: "row", gap: 8, borderRadius: 12, padding: 8 },
  captionText: { flex: 1 },
  caption: { minHeight: 72, borderRadius: 12, padding: 12 },
  dots: { flexDirection: "row", justifyContent: "center" },
  dotTarget: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotActive: { width: 24 },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  control: { minHeight: 44, minWidth: 44, alignItems: "center", justifyContent: "center", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
});
