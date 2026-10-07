"use client";

import { Check } from "lucide-react";
import { usePrefs } from "@/lib/prefs/use-prefs";
import type { Prefs } from "@/lib/prefs/prefs";
import { cn } from "@/lib/cn";

interface Option<T extends string> {
  value: T;
  label: string;
}

function Segmented<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="font-bold">{legend}</legend>
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-surface-2 p-1">
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <label
              key={o.value}
              className={cn(
                "flex min-h-11 cursor-pointer items-center justify-center gap-1 rounded-xl px-2 text-center text-small has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-focus",
                selected ? "bg-surface font-bold text-primary shadow-sm" : "text-ink-muted",
              )}
            >
              <input
                type="radio"
                className="sr-only"
                name={legend}
                value={o.value}
                checked={selected}
                onChange={() => onChange(o.value)}
              />
              {selected && <Check aria-hidden className="size-4 shrink-0" />}
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

const THEMES: readonly Option<Prefs["theme"]>[] = [
  { value: "system", label: "Automatico" },
  { value: "light", label: "Chiaro" },
  { value: "dark", label: "Scuro" },
];

const SIZES: readonly Option<Prefs["textSize"]>[] = [
  { value: "normal", label: "Normale" },
  { value: "large", label: "Grande" },
  { value: "xlarge", label: "Molto grande" },
];

export function PreferencesPanel() {
  const [prefs, update] = usePrefs();
  return (
    <div className="space-y-5">
      <Segmented legend="Tema" options={THEMES} value={prefs.theme} onChange={(theme) => update({ theme })} />
      <Segmented
        legend="Dimensione del testo"
        options={SIZES}
        value={prefs.textSize}
        onChange={(textSize) => update({ textSize })}
      />
    </div>
  );
}
