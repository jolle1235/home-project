import Button from "@/app/components/Button";
import { isConfigured } from "@/app/lib/session";

type Search = { next?: string | string[]; error?: string | string[] };

const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

// A plain form post to /api/login, which answers with a full page load, so the
// app's data loads fresh once the session exists.
export default async function LoginPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const next = first(params.next) ?? ""; // /api/login falls back to /recipes
  const wrongCode = first(params.error) === "1";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-sm flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Home Project</h1>
        {isConfigured() ? (
          <form method="post" action="/api/login" className="flex flex-col gap-4">
            <label htmlFor="code" className="text-sm font-medium text-foreground">
              Husstandskode
            </label>
            <input
              id="code"
              name="code"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              className="w-full rounded-xl border border-muted bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input type="hidden" name="next" value={next} />
            {wrongCode && (
              <p role="alert" className="text-sm text-danger">
                Forkert kode. Prøv igen.
              </p>
            )}
            <Button type="submit" fullWidth>
              Log ind
            </Button>
          </form>
        ) : (
          <p role="alert" className="text-sm text-danger">
            Husstandskoden er ikke sat op. Sæt HOUSEHOLD_CODE og AUTH_SECRET på serveren.
          </p>
        )}
      </div>
    </div>
  );
}
