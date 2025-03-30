"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/recipes");
    }
  }, [status, router]);

  async function signInAndNavigate(signinMethod: string) {
    await signIn(signinMethod);
  }

  if (status === "loading") {
    return <p className="text-center mt-10">Checking authentication...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-lg">
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
