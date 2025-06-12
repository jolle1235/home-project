import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/recipes");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h2>REDIRECTING TO RECIPES</h2>
    </div>
  );
}
