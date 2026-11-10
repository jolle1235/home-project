import { withSession } from "@/app/lib/auth";
import { NextResponse } from "next/server";
import { Recipe, toRecipeType } from "../../features/recipes/types/Recipe";
import {
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "../../features/recipes/server/recipe.server";

// The stored fields, with defaults, from a POST/PUT body.
function toRecipeFields(data: any): Omit<Recipe, "_id"> {
  return {
    recipeName: data.recipeName || "",
    description: data.description || "",
    image: data.image || "",
    sourceUrl: data.sourceUrl || "",
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    time: data.time || 0,
    categories: data.categories || [],
    recommendedPersonAmount: data.recommendedPersonAmount || 0,
    author: data.author || "",
    type: toRecipeType(data.type),
  };
}

async function handleGet() {
  try {
    const recipes = await getRecipes();
    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 },
    );
  }
}

async function handlePost(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!Array.isArray(data.ingredients)) {
      return NextResponse.json(
        { error: "Missing required fields: ingredients must be an array" },
        { status: 400 },
      );
    }

    const recipe = toRecipeFields(data);

    console.log("Creating recipe:", {
      recipeName: recipe.recipeName,
      ingredientsCount: recipe.ingredients.length,
    });
    const newRecipe = await createRecipe(recipe as Recipe);
    console.log("Recipe created successfully:", newRecipe._id);
    return NextResponse.json(newRecipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create recipe";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

async function handlePut(request: Request) {
  try {
    const data = await request.json();
    const recipe: Recipe = { _id: data._id, ...toRecipeFields(data) };
    const updatedRecipe = await updateRecipe(recipe);
    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 },
    );
  }
}

async function handleDelete(request: Request) {
  try {
    const data = await request.json();
    await deleteRecipe(data._id);
    return NextResponse.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 },
    );
  }
}

export const GET = withSession(handleGet);
export const POST = withSession(handlePost);
export const PUT = withSession(handlePut);
export const DELETE = withSession(handleDelete);
