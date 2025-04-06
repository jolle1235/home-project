"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error("Error occurred:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6">
      <h1 className="text-4xl font-bold text-red-600">Oops! Something went wrong</h1>
      <p className="text-lg text-gray-700 mt-2">{error.message || "An unexpected error occurred."}</p>

      <div className="mt-4">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push("/")}
          className="ml-4 px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
