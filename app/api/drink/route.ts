import { NextRequest, NextResponse } from "next/server";
import { Drink } from "../../features/drinks/utils/Drink";
import { createDrink, getDrinks } from "../../features/drinks/utils/drinkUtils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ingredientsParam = searchParams.get("ingredients");
    const ingredientNames = ingredientsParam
      ? ingredientsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const drinks = await getDrinks({ ingredientNames });
    return NextResponse.json(drinks);
  } catch (error) {
    console.error("Error fetching drinks:", error);
    return NextResponse.json(
      { error: "Failed to fetch drinks" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const drink: Omit<Drink, "_id"> = {
      title: data.title,
      image: data.image,
      ingredients: data.ingredients,
      time: data.time,
      numberOfPeople: data.numberOfPeople,
      description: data.description ?? "",
      alternatives: data.alternatives ?? "",
      author: data.author ?? "",
    } as Omit<Drink, "_id">;
    const newDrink = await createDrink(drink as Drink);
    return NextResponse.json(newDrink);
  } catch (error) {
    console.error("Error creating drink:", error);
    return NextResponse.json(
      { error: "Failed to create drink" },
      { status: 500 },
    );
  }
}
