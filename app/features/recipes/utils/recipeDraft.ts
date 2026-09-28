import { Recipe } from "../types/Recipe";
import { ScrapedRecipe } from "../types/ScrapedRecipe";
import {
  maxRecipeAuthorLength,
  maxRecipeDescriptionLength,
  maxRecipeNameLength,
  maxRecipePersons,
  maxRecipeTime,
} from "../../../utils/validationVariables";
import {
  EditorRow,
  ingredientsToRows,
  linesToRows,
  withTrailingEmptyRow,
} from "./ingredientRows";
import { formatInstructions } from "./tidyRecipeText";

// Everything the add/edit form holds. Used to fill the form (from an
// existing recipe, an import, or a saved draft) and as the draft format.
export interface RecipeDraft {
  recipeName: string;
  description: string;
  time: number;
  recommendedPersonAmount: number;
  image: string;
  sourceUrl: string;
  categories: string[];
  rows: EditorRow[];
  // Not editable in the form, but kept so an edit doesn't erase it.
  author: string;
}

export function emptyDraft(): RecipeDraft {
  return {
    recipeName: "",
    description: "",
    time: 0,
    recommendedPersonAmount: 0,
    image: "",
    sourceUrl: "",
    categories: [],
    rows: withTrailingEmptyRow([]),
    author: "",
  };
}

export function recipeToDraft(recipe: Recipe): RecipeDraft {
  return {
    recipeName: recipe.recipeName || "",
    description: recipe.description || "",
    time: recipe.time || 0,
    recommendedPersonAmount: recipe.recommendedPersonAmount || 0,
    image: recipe.image || "",
    sourceUrl: recipe.sourceUrl || "",
    categories: recipe.categories || [],
    rows: ingredientsToRows(recipe.ingredients || []),
    author: recipe.author || "",
  };
}

export function scrapedToDraft(
  scraped: ScrapedRecipe,
  { units, categories }: { units: string[]; categories: string[] },
): RecipeDraft {
  const keywords = scraped.keywords.map((k) => k.toLowerCase());

  return {
    recipeName: scraped.title.slice(0, maxRecipeNameLength),
    description: formatInstructions(scraped.intro, scraped.instructions).slice(
      0,
      maxRecipeDescriptionLength,
    ),
    time: Math.min(scraped.totalMinutes, maxRecipeTime),
    recommendedPersonAmount: Math.min(scraped.servings, maxRecipePersons),
    image: scraped.image,
    sourceUrl: scraped.sourceUrl,
    categories: categories.filter((c) => keywords.includes(c.toLowerCase())),
    rows: withTrailingEmptyRow(linesToRows(scraped.ingredients, units)),
    author: scraped.author.slice(0, maxRecipeAuthorLength),
  };
}

export function draftHasContent(draft: RecipeDraft): boolean {
  return Boolean(
    draft.recipeName.trim() ||
      draft.description.trim() ||
      draft.image ||
      draft.rows.some((row) => row.name.trim()),
  );
}
