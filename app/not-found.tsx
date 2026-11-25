import AppFrame from "./components/AppFrame";
import ErrorState from "./components/ErrorState";

// An unmatched URL (status 404). It renders outside the app shell, so it brings its own
// frame; NavBar needs no providers.
export default function NotFound() {
  return (
    <AppFrame>
      <ErrorState
        title="Siden findes ikke"
        message="Adressen findes ikke i appen. Måske er linket forkert eller forældet."
      />
    </AppFrame>
  );
}
