// What every feature page shows while its server render is on the way; the navbar stays.
export default function Loading() {
  return (
    <div
      aria-busy="true"
      className="mx-auto w-full max-w-4xl p-4 flex flex-col gap-4 animate-pulse"
    >
      <span className="sr-only">Indlæser…</span>
      <div className="h-8 w-1/2 rounded-lg bg-secondary" />
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="h-20 w-full rounded-2xl bg-surface shadow-sm" />
      ))}
    </div>
  );
}
