import { withSession } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getRecipe } from "@/app/features/recipes/server/recipe.server";

async function handleGet(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
    }

    const recipe = await getRecipe(id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Failed to fetch recipe:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch recipe",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export const GET = withSession(handleGet);
