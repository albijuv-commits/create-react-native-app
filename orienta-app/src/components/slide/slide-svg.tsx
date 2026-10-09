import { useId } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Svg from "react-native-svg";
import { sceneScale, type SceneSpec } from "@/lib/slides/catalog";
import { Eyepiece } from "./eyepiece";
import { SceneRenderer } from "./registry";
import { SceneContext, sceneState } from "./scene-context";

/** SVG del vetrino: oculare + scena al passo indicato, quadrato e largo quanto il contenitore. */
export function SlideSvg({
  spec,
  step,
  playing,
  reduced,
  label,
  still = false,
  style,
}: {
  spec: SceneSpec;
  step: number;
  playing: boolean;
  reduced: boolean;
  /** Scena ferma sul passo, senza transizioni (anteprime e galleria): vedi SceneState.still */
  still?: boolean;
  /** Etichetta per gli screen reader; se assente l'immagine è decorativa */
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  // Gli id dei gradienti e dei ritagli devono essere unici nella pagina (sul web più vetrini convivono)
  const id = `v${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <View
      style={[{ width: "100%", aspectRatio: 1 }, style]}
      accessible={label !== undefined}
      role={label !== undefined ? "img" : undefined}
      accessibilityLabel={label}
      importantForAccessibility={label !== undefined ? "yes" : "no-hide-descendants"}
      accessibilityElementsHidden={label === undefined}
    >
      <Svg viewBox="0 0 200 200" width="100%" height="100%">
        <SceneContext.Provider value={sceneState(step, reduced, playing, still)}>
          <Eyepiece id={id} scale={sceneScale(spec, step)}>
            <SceneRenderer spec={spec} />
          </Eyepiece>
        </SceneContext.Provider>
      </Svg>
    </View>
  );
}
