"use client";

import { useEffect } from "react";
import ErrorState from "./components/ErrorState";

// Also the error page inside the app shell (app/features/error.tsx), so the navigation
// stays. The error's own text is for the console, never for the user.
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Error occurred:", error);
  }, [error]);

  return (
    <ErrorState
      title="Noget gik galt"
      message="Siden kunne ikke vises. Prøv igen, eller gå tilbage til opskrifterne."
      onRetry={retry}
    />
  );
}
