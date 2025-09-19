import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    let recipeData: any = null;

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const jsonText = $(el).html();
        if (!jsonText) return;

        const parsed = JSON.parse(jsonText);

        // sometimes it's an array, sometimes an object
        const candidates = Array.isArray(parsed) ? parsed : [parsed];

        for (const c of candidates) {
          if (c["@type"] === "Recipe") {
            recipeData = c;
            break;
          }
          // sometimes wrapped inside @graph
          if (c["@graph"]) {
            const recipe = c["@graph"].find(
              (g: any) => g["@type"] === "Recipe"
            );
            if (recipe) {
              recipeData = recipe;
              break;
            }
          }
        }
      } catch (err) {
        // ignore invalid JSON
      }
    });

    return NextResponse.json({
      title: $("title").text(),
      description: $("meta[name='description']").attr("content") || "",
      recipe: recipeData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
