"use client";

import { SCENE_STEPS, type SceneSpec } from "@/lib/slides/catalog";
import { SlideSvg } from "@/components/slide/slide-svg";

export function SceneGallery({ items }: { items: { id: string; name: string; spec: SceneSpec }[] }) {
  return (
    <div className="space-y-8">
      {items.map((it) => (
        <section key={it.id} id={it.id} aria-labelledby={`g-${it.id}`} className="space-y-2">
          <h2 id={`g-${it.id}`} className="text-heading font-bold">
            {it.name} <span className="text-small font-normal text-ink-muted">· {it.spec.scene}</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: SCENE_STEPS }, (_, step) => (
              <figure key={step} className="space-y-1">
                <SlideSvg spec={it.spec} step={step} playing={false} reduced />
                <figcaption className="text-small text-ink-muted">
                  <span className="font-bold text-accent">{step + 1}.</span> {it.spec.captions[step]}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
