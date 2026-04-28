import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

function getFirstImage(image: any): string | null {
  if (!image) return null;

  if (typeof image === "string") return image;

  if (Array.isArray(image)) {
    const first = image[0];
    if (typeof first === "string") return first;
    if (typeof first === "object") return first?.url || null;
  }

  if (typeof image === "object") {
    return image.url || null;
  }

  return null;
}

function extractRecipe($: cheerio.CheerioAPI) {
  let recipe: any = null;

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const arr = Array.isArray(json) ? json : [json];

      for (const obj of arr) {
        if (obj["@type"] === "Recipe") {
          recipe = obj;
          return false;
        }

        if (obj["@graph"]) {
          const found = obj["@graph"].find((g: any) => g["@type"] === "Recipe");
          if (found) {
            recipe = found;
            return false;
          }
        }
      }
    } catch {}
  });

  return recipe;
}

function normalizeInstructions(recipe: any): string[] {
  const instructions = recipe?.recipeInstructions;
  if (!instructions) return [];

  if (typeof instructions === "string") {
    return [instructions];
  }

  if (Array.isArray(instructions)) {
    return instructions
      .map((i: any) => (typeof i === "string" ? i : i?.text))
      .filter(Boolean);
  }

  if (typeof instructions === "object") {
    if (typeof instructions.text === "string") {
      return [instructions.text];
    }
    if (Array.isArray(instructions.itemListElement)) {
      return instructions.itemListElement
        .map((i: any) => (typeof i === "string" ? i : i?.text))
        .filter(Boolean);
    }
  }

  return [];
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ success: false, error: "Missing URL" });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid URL" });
    }

    let html = "";

    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      html = await res.text();
    } catch {
      return NextResponse.json({
        success: false,
        error: "Could not fetch URL",
      });
    }

    const $ = cheerio.load(html);
    const recipe = extractRecipe($);

    return NextResponse.json({
      success: true,

      title: recipe?.name || $("h1").first().text() || $("title").text() || "",

      description:
        recipe?.description ||
        $("meta[name='description']").attr("content") ||
        "",

      image: getFirstImage(recipe?.image),

      ingredients: recipe?.recipeIngredient || [],

      instructions: normalizeInstructions(recipe),
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}
