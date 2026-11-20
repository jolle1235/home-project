import { notFound } from "next/navigation";
import { requireSession } from "@/app/lib/auth";
import { getRecipe } from "../server/recipe.server";
import RecipeDetailPageClient from "../client/RecipeDetailPageClient";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const recipe = await getRecipe(id);
  if (!recipe) notFound();

  return <RecipeDetailPageClient initialRecipe={recipe} />;
}
