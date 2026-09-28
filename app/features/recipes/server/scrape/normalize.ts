import * as cheerio from "cheerio";
import { ScrapedRecipe, ScrapedStep } from "../../types/ScrapedRecipe";
import { normalizeSpacing } from "../../utils/tidyRecipeText";

// Turns a schema.org Recipe object (from JSON-LD or microdata) into a
// ScrapedRecipe. Sites fill these fields in many shapes, so every reader
// here is defensive.

const ENTITY = /&(#\d+|#x[\da-f]+|[a-z]+);/i;

// Strips tags and decodes entities, keeping line breaks from <br>, <p>, <li>.
export function cleanText(value: unknown): string {
  if (value == null) return "";
  let text = String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|div|h[1-6])>/gi, "\n");
  // Some sites double-encode (&amp;amp;), so decode up to twice.
  for (let i = 0; i < 2 && (/<[a-z/]/i.test(text) || ENTITY.test(text)); i++) {
    text = cheerio.load(text, null, false).root().text();
  }
  return normalizeSpacing(text)
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toArray(value: unknown): unknown[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function typesOf(node: unknown): string[] {
  if (!node || typeof node !== "object") return [];
  return toArray((node as Record<string, unknown>)["@type"]).map((t) =>
    String(t).split(/[/:]/).pop()!.toLowerCase(),
  );
}

export function hasType(node: unknown, type: string): boolean {
  return typesOf(node).includes(type.toLowerCase());
}

// Minutes from an ISO 8601 duration (PT1H30M, P0DT2H) or loose text ("90 min").
export function parseDuration(value: unknown): number {
  if (typeof value === "number") return Math.round(value);
  if (typeof value !== "string" || !value.trim()) return 0;
  const iso = value
    .trim()
    .match(
      /^P(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i,
    );
  if (iso) {
    const [, d, h, m, s] = iso.map((part) => Number(part) || 0);
    return Math.round(d * 1440 + h * 60 + m + s / 60);
  }
  const hours = value.match(/(\d+(?:[.,]\d+)?)\s*(?:t\b|timer|time|h\b|hours?)/i);
  const minutes = value.match(/(\d+)\s*(?:min|m\b)/i);
  const total =
    (hours ? parseFloat(hours[1].replace(",", ".")) * 60 : 0) +
    (minutes ? parseInt(minutes[1], 10) : 0);
  if (total) return Math.round(total);
  const bare = value.match(/^\s*(\d+)\s*$/);
  return bare ? parseInt(bare[1], 10) : 0;
}

export function parseYield(value: unknown): number {
  for (const entry of toArray(value)) {
    if (typeof entry === "number" && entry > 0) return Math.round(entry);
    const match = String(entry ?? "").match(/\d+/);
    if (match) return parseInt(match[0], 10);
  }
  return 0;
}

function resolveUrl(value: string, base: string): string {
  try {
    return new URL(value, base).toString();
  } catch {
    return "";
  }
}

export function pickImage(value: unknown, base: string): string {
  for (const entry of toArray(value)) {
    if (typeof entry === "string" && entry.trim()) {
      return resolveUrl(entry.trim(), base);
    }
    if (entry && typeof entry === "object") {
      const obj = entry as Record<string, unknown>;
      const url = obj.url ?? obj.contentUrl ?? obj["@id"];
      if (typeof url === "string" && url.trim()) {
        return resolveUrl(url.trim(), base);
      }
    }
  }
  return "";
}

function pickName(value: unknown): string {
  return toArray(value)
    .map((entry) =>
      entry && typeof entry === "object"
        ? cleanText((entry as Record<string, unknown>).name)
        : cleanText(entry),
    )
    .filter(Boolean)
    .join(", ");
}

function splitList(value: unknown): string[] {
  return toArray(value)
    .flatMap((entry) => String(entry ?? "").split(","))
    .map((entry) => cleanText(entry))
    .filter(Boolean);
}

// recipeInstructions comes as a string, string[], HowToStep[], HowToSection[]
// (each with nested itemListElement), or an ItemList. Flatten to steps,
// carrying the section name along.
export function flattenInstructions(
  value: unknown,
  section?: string,
): ScrapedStep[] {
  if (value == null) return [];

  if (typeof value === "string") {
    return cleanText(value)
      .split(/\n+/)
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text) => ({ section, text }));
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenInstructions(entry, section));
  }

  if (typeof value === "object") {
    const node = value as Record<string, unknown>;
    if (hasType(node, "HowToSection")) {
      const name = cleanText(node.name) || section;
      return flattenInstructions(
        node.itemListElement ?? node.steps ?? node.recipeInstructions,
        name,
      );
    }
    if (node.itemListElement && !node.text) {
      return flattenInstructions(node.itemListElement, section);
    }
    const text = cleanText(node.text ?? node.name ?? node.description);
    return text ? [{ section, text }] : [];
  }

  return [];
}

// For sites that put section headings in as ordinary steps ("Mornaysauce");
// used from siteAdapters. A short step without end punctuation, followed by a real
// step, becomes the section of the steps after it. Only applied when the
// list starts with such a heading and has at least two, so short real steps
// ("Bag") are left alone.
export function promoteHeadingSteps(steps: ScrapedStep[]): ScrapedStep[] {
  const isShort = (step: ScrapedStep) =>
    step.text.length <= 40 && !step.text.includes("\n") && !/[.!?]$/.test(step.text);
  const headings = steps.map(
    (step, i) => !step.section && isShort(step) && i + 1 < steps.length && !isShort(steps[i + 1]),
  );
  if (!headings[0] || headings.filter(Boolean).length < 2) return steps;

  const result: ScrapedStep[] = [];
  let section: string | undefined;
  steps.forEach((step, i) => {
    if (headings[i]) section = step.text.replace(/:$/, "");
    else result.push(step.section || !section ? step : { section, text: step.text });
  });
  return result;
}

export function normalizeSchemaRecipe(
  recipe: Record<string, unknown>,
  pageUrl: string,
): ScrapedRecipe {
  const ingredients = toArray(recipe.recipeIngredient ?? recipe.ingredients)
    .flatMap((entry) => cleanText(entry).split("\n"))
    .map((line) => line.trim())
    .filter(Boolean);

  const instructions = flattenInstructions(recipe.recipeInstructions);

  return {
    title: cleanText(recipe.name ?? recipe.headline),
    intro: cleanText(recipe.description),
    image: pickImage(recipe.image ?? recipe.thumbnailUrl, pageUrl),
    ingredients,
    instructions,
    totalMinutes:
      parseDuration(recipe.totalTime) ||
      parseDuration(recipe.prepTime) + parseDuration(recipe.cookTime),
    servings: parseYield(recipe.recipeYield ?? recipe.yield),
    author: pickName(recipe.author),
    keywords: [
      ...splitList(recipe.recipeCategory),
      ...splitList(recipe.keywords),
      ...splitList(recipe.recipeCuisine),
    ],
    sourceUrl: pageUrl,
    partial: ingredients.length === 0 && instructions.length === 0,
  };
}
