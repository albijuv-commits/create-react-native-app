import { useCallback, useRef } from "react";
import type { ScrollView, Text } from "react-native";
import { focusLater } from "./a11y";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * L'indice di una pagina lunga che porta alle sue sezioni: ogni sezione dice dove si trova
 * (`place`, da onLayout) e registra il suo titolo (`heading`, come ref). `jump` fa scorrere la
 * pagina e, a scorrimento finito, porta VoiceOver o TalkBack sul titolo; con «Riduci movimento»
 * senza animazione. Lo usano la scheda di una condizione, quella di un farmaco e le pagine del Profilo.
 */
export function useSectionJump<Id extends string>(gap = 12) {
  const reduced = useReducedMotion();
  const scroller = useRef<ScrollView>(null);
  const offsets = useRef(new Map<Id, number>());
  const headings = useRef(new Map<Id, Text>());

  const place = useCallback((id: Id, y: number) => {
    offsets.current.set(id, y);
  }, []);

  const heading = useCallback((id: Id, node: Text | null) => {
    if (node) headings.current.set(id, node);
    else headings.current.delete(id);
  }, []);

  const jump = useCallback(
    (id: Id) => {
      const y = offsets.current.get(id);
      if (y === undefined) return;
      scroller.current?.scrollTo({ y: Math.max(0, y - gap), animated: !reduced });
      focusLater({ current: headings.current.get(id) ?? null }, reduced ? 100 : 450);
    },
    [gap, reduced],
  );

  return { scroller, place, heading, jump };
}
