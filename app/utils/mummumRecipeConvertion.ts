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

    // Supports PT30M and PT1H30M
    const hours = iso.match(/(\d+)H/)?.[1];
    const minutes = iso.match(/(\d+)M/)?.[1];

    return (
      (hours ? parseInt(hours) * 60 : 0) + (minutes ? parseInt(minutes) : 0)
    );
  };

  const parseYield = (yieldStr: string | undefined): number => {
    if (!yieldStr) return 0;
    const match = yieldStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // 🔑 Support BOTH formats
  const recipe = data.recipe ?? data;
  const mappedInstructions =
    typeof recipe?.recipeInstructions === "string"
      ? recipe.recipeInstructions
      : Array.isArray(recipe?.recipeInstructions)
        ? recipe.recipeInstructions
            .map((i: any) => (typeof i === "string" ? i : i?.text))
            .filter(Boolean)
            .join("\n")
        : Array.isArray(data?.instructions)
          ? data.instructions.filter(Boolean).join("\n")
          : "";

  return {
    _id: "",
    recipeName: recipe?.name || data?.title || "",
    description: mappedInstructions || data?.description || "",
    image:
      typeof recipe?.image === "string"
        ? recipe.image
        : Array.isArray(recipe?.image)
          ? recipe.image[0]
          : recipe?.image?.url || data?.image || "",
    ingredients: (recipe?.recipeIngredient || data?.ingredients || []).map(
      parseIngredient,
    ),
    time:
      parseDuration(recipe?.totalTime) ||
      parseDuration(recipe?.prepTime) + parseDuration(recipe?.cookTime) ||
      0,
    categories: [],
    recommendedPersonAmount: parseYield(recipe?.recipeYield),
    author:
      typeof recipe?.author === "string"
        ? recipe.author
        : recipe?.author?.name || "",
  };
}
