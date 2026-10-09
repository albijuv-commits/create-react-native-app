"use client";

import { Check, MapPin } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { usePrefs } from "@/lib/prefs/use-prefs";

/** La città predefinita per la ricerca dei medici, nelle preferenze locali */
export function DefaultCity() {
  const [prefs, update] = usePrefs();
  // null finché la persona non scrive: il campo mostra la città salvata, anche quando le
  // preferenze arrivano dal dispositivo dopo l'idratazione o vengono eliminate
  const [draft, setDraft] = useState<string | null>(null);
  const [savedCity, setSavedCity] = useState<string | null>(null);
  const id = useId();
  const hintId = useId();
  // La conferma vale finché la città salvata è ancora quella
  const confirmed = draft === null && savedCity !== null && savedCity === prefs.defaultCity;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const city = (draft ?? prefs.defaultCity).trim().replace(/\s+/g, " ").slice(0, 80);
    update({ defaultCity: city });
    setDraft(null);
    setSavedCity(city);
  };

  return (
    <form onSubmit={submit} className="space-y-2" noValidate>
      <label htmlFor={id} className="block font-bold">
        Città predefinita
      </label>
      <p id={hintId} className="text-small text-ink-muted">
        Nella sezione Medici ti proponiamo di cercare qui. Resta su questo dispositivo.
      </p>
      <div className="flex gap-2">
        <input
          id={id}
          value={draft ?? prefs.defaultCity}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={80}
          autoComplete="address-level2"
          aria-describedby={hintId}
          placeholder="Es. Bologna o 40121"
          className="min-h-12 min-w-0 flex-1 rounded-2xl border-2 border-line bg-surface px-4 text-body placeholder:text-ink-muted/80 focus:border-primary focus:outline-none focus-visible:outline-3 focus-visible:outline-focus"
        />
        <Button type="submit" variant="secondary" className="min-h-12" icon={<MapPin aria-hidden className="size-5" />}>
          Salva
        </Button>
      </div>
      <p aria-live="polite" className="flex items-center gap-1.5 text-small font-bold text-primary empty:hidden">
        {confirmed && <Check aria-hidden className="size-4" />}
        {confirmed ? (savedCity ? "Città salvata." : "Città predefinita tolta.") : ""}
      </p>
    </form>
  );
}
