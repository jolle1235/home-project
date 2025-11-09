import { NextResponse } from "next/server";
import { Recipe } from "../../model/Recipe";
import {
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "../../lib/recipeUtils";

export async function GET() {
  try {
    const recipes = await getRecipes();
    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.recipeName || !data.description || !data.ingredients || !Array.isArray(data.ingredients)) {
      return NextResponse.json(
        { error: "Missing required fields: recipeName, description, or ingredients" },
        { status: 400 }
      );
    }

    const recipe: Omit<Recipe, "_id"> = {
      recipeName: data.recipeName,
      description: data.description,
      image: data.image || "",
      ingredients: data.ingredients,
      time: data.time || 0,
      categories: data.categories || [],
      recommendedPersonAmount: data.recommendedPersonAmount || 0,
      author: data.author || "",
    };
    
    console.log("Creating recipe:", { recipeName: recipe.recipeName, ingredientsCount: recipe.ingredients.length });
    const newRecipe = await createRecipe(recipe as Recipe);
    console.log("Recipe created successfully:", newRecipe._id);
    return NextResponse.json(newRecipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create recipe";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const recipe: Recipe = {
      _id: data._id,
      recipeName: data.recipeName,
      description: data.description,
      image: data.image,
      ingredients: data.ingredients,
      time: data.time,
      categories: data.categories,
      recommendedPersonAmount: data.recommendedPersonAmount,
      author: data.author,
    };
    const updatedRecipe = await updateRecipe(recipe);
    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const data = await request.json();
    await deleteRecipe(data._id);
    return NextResponse.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
