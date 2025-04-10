"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for error in URL
    const errorMessage = searchParams?.get("error");
    if (errorMessage) {
      setError(errorMessage);
    }

    // Redirect if authenticated
    if (status === "authenticated" && session) {
      router.replace("/recipes");
    }
  }, [session, status, router, searchParams]);

  async function signInAndNavigate(signinMethod: string) {
    try {
      const result = await signIn(signinMethod, {
        callbackUrl: "/recipes",
      });

      if (result?.error) {
        setError(result.error);
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setError("An unexpected error occurred");
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-lg">
        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        <p className="text-gray-600 text-center mb-8">
          Sign in to your account
        </p>
        <button
          onClick={() => signInAndNavigate("google")}
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
