/** Segnaposto mostrato per un attimo mentre si apre una scheda */
export function ConditionSkeleton() {
  return (
    <div aria-busy="true" className="space-y-6 motion-safe:animate-pulse">
      <p className="sr-only">Caricamento della scheda…</p>
      <div className="h-11 w-48 rounded-xl bg-surface-2" />
      <div className="h-10 w-3/4 rounded-xl bg-surface-2" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-surface-2" />
        <div className="h-4 w-5/6 rounded bg-surface-2" />
      </div>
      <div className="mx-auto aspect-square w-full max-w-80 rounded-full bg-surface-2" />
    </div>
  );
}
