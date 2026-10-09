"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/cn";

/** Intestazione di un passo dell'intervista: riceve il focus quando il passo compare. */
export function StepHeader({
  step,
  title,
  lead,
  aside,
  headingRef,
  onBack,
}: {
  step?: string;
  title: string;
  lead?: ReactNode;
  /** Illustrazione o oggetto 3D accanto al titolo */
  aside?: ReactNode;
  headingRef?: Ref<HTMLHeadingElement>;
  onBack?: () => void;
}) {
  return (
    <header className="space-y-2 pt-2">
      {(step || onBack) && (
        <div className="flex min-h-11 items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-2xl px-2 text-small font-bold text-primary transition-colors duration-150 hover:bg-primary-soft"
            >
              <ArrowLeft aria-hidden className="size-5" />
              Indietro
            </button>
          )}
          {step && <p className="ml-auto text-small font-bold text-accent">{step}</p>}
        </div>
      )}
      <div className="flex items-center gap-3">
        <h1 ref={headingRef} tabIndex={-1} className="min-w-0 flex-1 text-display font-bold text-primary outline-none">
          {title}
        </h1>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      {lead && <p className="text-ink-muted">{lead}</p>}
    </header>
  );
}

/** Casella da spuntare grande quanto tutta la riga, con una nota facoltativa sotto. */
export function CheckRow({
  checked,
  onChange,
  label,
  note,
  invalid,
  inputRef,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  note?: ReactNode;
  invalid?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition-colors duration-150",
        "has-checked:border-primary has-checked:bg-primary-soft",
        invalid ? "border-red" : "border-line bg-surface hover:border-primary/50",
      )}
    >
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-invalid={invalid || undefined}
        className="mt-0.5 size-6 shrink-0 cursor-pointer accent-primary"
      />
      <span className="space-y-1">
        <span className="block font-bold">{label}</span>
        {note && <span className="block text-small text-ink-muted">{note}</span>}
      </span>
    </label>
  );
}

/** Messaggio di errore di un campo, annunciato quando compare */
export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="text-small font-bold text-red">
      {children}
    </p>
  );
}

/** Pulsante a pillola con stato premuto: chip dei sintomi e delle zone */
export function Chip({
  pressed,
  onClick,
  children,
  icon,
  tone = "accent",
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
  tone?: "accent" | "primary";
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 px-4 py-2 text-small font-bold",
        "transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97]",
        pressed
          ? tone === "accent"
            ? "border-accent bg-accent-soft text-accent"
            : "border-primary bg-primary-soft text-primary"
          : "border-line bg-surface text-ink hover:border-primary",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
