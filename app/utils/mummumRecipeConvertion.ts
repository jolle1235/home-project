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
    return match ? parseInt(match[1], 10) : 0;
  };

  const parseYield = (yieldStr: string | undefined): number => {
    if (!yieldStr) return 0;
    const match = yieldStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  return {
    _id: "",
    recipeName: data.name ?? "",
    description: data.description ?? data.recipeInstructions ?? "",
    image: data.image ?? "",
    ingredients: (data.recipeIngredient ?? []).map(parseIngredient),
    time:
      parseDuration(data.totalTime) ||
      parseDuration(data.prepTime) + parseDuration(data.cookTime),
    categories: data.recipeCategory
      ? Array.isArray(data.recipeCategory)
        ? data.recipeCategory
        : [data.recipeCategory]
      : [],
    recommendedPersonAmount: parseYield(data.recipeYield),
    author: data.author ?? "",
  };
}
