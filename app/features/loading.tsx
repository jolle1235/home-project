import PageContainer from "../components/PageContainer";

// What every feature page shows while its server render is on the way; the navbar stays.
// It sits in the page container, so its inset is the page's at every width.
export default function Loading() {
  return (
    <PageContainer aria-busy="true" className="flex flex-col gap-4 animate-pulse">
      <span className="sr-only">Indlæser…</span>
      <div className="h-8 w-1/2 rounded-lg bg-secondary" />
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="h-20 w-full rounded-2xl bg-surface shadow-raised" />
      ))}
    </PageContainer>
  );
}
