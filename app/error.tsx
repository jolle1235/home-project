"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "./components/smallComponent/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Error occurred:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6">
      <h1 className="text-4xl font-bold text-red-600">
        Oops! Something went wrong
      </h1>
      <p className="text-lg text-gray-700 mt-2">
        {error.message || "An unexpected error occurred."}
      </p>

      <div className="mt-4 flex gap-3 justify-center">
        <Button variant="primary" size="md" onClick={() => reset()}>
          Try Again
        </Button>
        <Button variant="secondary" size="md" onClick={() => router.push("/")}>
          Go Home
        </Button>
      </div>
    </div>
  );
}
