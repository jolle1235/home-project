import { getRecipes } from "./server/recipe.server";
import RecipePageClient from "./client/RecipePageClient";

export default async function RecipePage() {
  const initialRecipes = await getRecipes();

  return <RecipePageClient initialRecipes={initialRecipes} />;
}
