/** Marchio: l'oculare del microscopio con una cellula colorata come in istologia. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="15" fill="var(--primary)" />
      <circle cx="16" cy="16" r="11" fill="var(--surface)" />
      <ellipse cx="17" cy="15" rx="7" ry="6" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
      <circle cx="15.5" cy="15.5" r="2.6" fill="var(--primary)" />
    </svg>
  );
}
