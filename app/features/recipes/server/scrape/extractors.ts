import type { Cheerio, CheerioAPI } from "cheerio";
import { ScrapedRecipe } from "../../types/ScrapedRecipe";
import { cleanText, hasType, normalizeSchemaRecipe, pickImage } from "./normalize";

// An extractor reads one kind of markup. It returns null when the page has
// none of it, so the next extractor in the chain can try.
export type Extractor = ($: CheerioAPI, pageUrl: string) => ScrapedRecipe | null;

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    // Some sites put raw newlines/tabs inside JSON strings.
    try {
      return JSON.parse(raw.replace(/[\u0000-\u001F]+/g, " "));
    } catch {
      return null;
    }
  }
}

// Depth-first search for a Recipe node anywhere in a JSON-LD block
// (top level, arrays, @graph, mainEntity, ...).
function findRecipeNode(
  node: unknown,
  depth = 0,
): Record<string, unknown> | null {
  if (!node || typeof node !== "object" || depth > 8) return null;
  if (Array.isArray(node)) {
    for (const entry of node) {
      const found = findRecipeNode(entry, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (hasType(node, "Recipe")) return node as Record<string, unknown>;
  for (const value of Object.values(node)) {
    const found = findRecipeNode(value, depth + 1);
    if (found) return found;
  }
  return null;
}

export const jsonLdExtractor: Extractor = ($, pageUrl) => {
  for (const el of $('script[type="application/ld+json"]').toArray()) {
    const recipe = findRecipeNode(parseJson($(el).text()));
    if (recipe) return normalizeSchemaRecipe(recipe, pageUrl);
  }
  return null;
};

function microdataValue(node: Cheerio<any>): string {
  const tag = String(node.prop("tagName") ?? "").toLowerCase();
  if (tag === "meta") return node.attr("content") ?? "";
  if (tag === "img" || tag === "source") return node.attr("src") ?? "";
  if (tag === "a" || tag === "link") return node.attr("href") ?? "";
  if (tag === "time") return node.attr("datetime") ?? node.text();
  const content = node.attr("content");
  if (content) return content;
  // Keep block structure so multi-step elements split into lines.
  return cleanText(node.html() ?? "");
}

export const microdataExtractor: Extractor = ($, pageUrl) => {
  const scope = $("[itemscope][itemtype]")
    .filter((_, el) => /schema\.org\/Recipe\b/i.test($(el).attr("itemtype") ?? ""))
    .first();
  if (!scope.length) return null;

  // Only properties owned by the recipe scope, not by nested ones (author, rating...).
  const owned = (prop: string) =>
    scope
      .find(`[itemprop~="${prop}"]`)
      .filter((_, el) => $(el).parent().closest("[itemscope]").get(0) === scope.get(0));
  const all = (prop: string) =>
    owned(prop)
      .toArray()
      .map((el) => microdataValue($(el)))
      .filter(Boolean);
  const one = (prop: string) => {
    for (const el of owned(prop).toArray()) {
      const value = microdataValue($(el));
      if (value) return value;
    }
    return "";
  };

  const authorScope = scope.find('[itemprop~="author"]').first();
  const author =
    authorScope.find('[itemprop~="name"]').first().text() || authorScope.text();

  // Some sites put itemprop="description" on an element that wraps the
  // whole recipe; skip such wrappers and let the meta description fill in.
  const descriptionEl = owned("description")
    .filter((_, el) => $(el).find("[itemprop]").length === 0)
    .first();
  const ingredients = all("recipeIngredient");

  return normalizeSchemaRecipe(
    {
      name: one("name"),
      description: descriptionEl.length ? microdataValue(descriptionEl) : "",
      image: one("image"),
      recipeIngredient: ingredients.length ? ingredients : all("ingredients"),
      recipeInstructions: all("recipeInstructions"),
      totalTime: one("totalTime"),
      prepTime: one("prepTime"),
      cookTime: one("cookTime"),
      recipeYield: one("recipeYield"),
      recipeCategory: all("recipeCategory"),
      author,
    },
    pageUrl,
  );
};

// Title, image and description from page metadata (OpenGraph, <title>).
export function pageMetadata($: CheerioAPI, pageUrl: string) {
  const meta = (key: string) =>
    $(`meta[property="${key}"], meta[name="${key}"]`).first().attr("content") ?? "";
  return {
    title: cleanText(
      meta("og:title") || meta("twitter:title") || $("h1").first().text() || $("title").text(),
    ),
    intro: cleanText(meta("og:description") || meta("description")),
    image: pickImage(meta("og:image") || meta("twitter:image"), pageUrl),
  };
}

// Last resort: page metadata only. Always marked partial.
export const openGraphExtractor: Extractor = ($, pageUrl) => {
  const { title, intro, image } = pageMetadata($, pageUrl);
  if (!title) return null;
  return {
    title,
    intro,
    image,
    ingredients: [],
    instructions: [],
    totalMinutes: 0,
    servings: 0,
    author: "",
    keywords: [],
    sourceUrl: pageUrl,
    partial: true,
  };
};
