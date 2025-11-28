import { Recipe } from "../model/Recipe";
import { Ingredient } from "../model/Ingredient";
import { Item } from "../model/Item";

function parseIngredient(line: string): Ingredient {
  const parts = line.trim().split(" ");
  let quantity = 1;
  let unit = "";
  let name = line;

  // Try to parse first token as a number
  const first = parts[0].replace(",", "."); // handle commas like 0,5
  const num = parseFloat(first);
  if (!isNaN(num)) {
    quantity = num;
    unit = parts[1] ?? "";
    name = parts.slice(2).join(" ");
  } else {
    // fallback: just treat the whole line as name
    quantity = 1;
    unit = "";
    name = line;
  }

  const item: Item = {
    _id: "",
    name,
    category: "unknown",
    defaultUnit: "unknown",
  };

  return {
    _id: "",
    item,
    unit,
    marked: false,
    quantity,
  };
}

export function mapSchemaRecipeToRecipe(data: any): Recipe {
  const parseDuration = (iso: string | undefined): number => {
    if (!iso) return 0;
    const match = iso.match(/PT(\d+)M/);
    console.log("duration:", match);
    return match ? parseInt(match[1], 10) : 0;
  };

  const parseYield = (yieldStr: string | undefined): number => {
    if (!yieldStr) return 0;
    const match = yieldStr.match(/(\d+)/);
    console.log("yield:", match);
    return match ? parseInt(match[1], 10) : 0;
  };

  return {
    _id: "",
    recipeName: data.recipe.name ?? "",
    description: data.recipe.recipeInstructions ?? data.description ?? "",
    image: data.recipe.image ?? "",
    ingredients: (data.recipe.recipeIngredient ?? []).map(parseIngredient),
    time:
      parseDuration(data.recipe.totalTime) ||
      parseDuration(data.recipe.prepTime) + parseDuration(data.cookTime),
    categories: [],
    recommendedPersonAmount: parseYield(data.recipe.recipeYield),
    author: data.recipe.author ?? "",
  };
}
