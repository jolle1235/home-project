import Link from "next/link";

// A missing recipe or an id that isn't one.
export default function RecipeNotFound() {
  return (
    <div className="w-full py-12 flex flex-col items-center gap-4 text-center">
      <p className="text-danger">Kunne ikke indlæse opskriften.</p>
      <Link href="/recipes" className="text-primary underline">
        Tilbage til opskrifter
      </Link>
    </div>
  );
}
