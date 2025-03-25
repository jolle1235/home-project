import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/signin");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h2>REDIRECTING TO LOGIN</h2>
    </div>
  );
}