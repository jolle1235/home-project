import { requireSession } from "@/app/lib/auth";
import { getRecipes } from "./server/recipe.server";
import RecipePageClient from "./client/RecipePageClient";
import { toRecipeType } from "./types/Recipe";

export default async function RecipePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await requireSession();
  const [initialRecipes, { type }] = await Promise.all([
    getRecipes(),
    searchParams,
  ]);

  return (
    <RecipePageClient
      initialRecipes={initialRecipes}
      initialKind={toRecipeType(type)}
    />
  );
}
