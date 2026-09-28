import * as cheerio from "cheerio";
import { safeFetch } from "@/app/lib/safeFetch";
import { ScrapedRecipe } from "../../types/ScrapedRecipe";
import {
  Extractor,
  jsonLdExtractor,
  microdataExtractor,
  openGraphExtractor,
  pageMetadata,
} from "./extractors";
import { siteAdapters } from "./siteAdapters";

function hostnameOf(pageUrl: string): string {
  try {
    return new URL(pageUrl).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Runs site adapter → JSON-LD → microdata, and uses page metadata
// (OpenGraph) to fill a missing title/image/intro or as a partial fallback.
export function extractRecipeFromHtml(
  html: string,
  pageUrl: string,
): ScrapedRecipe | null {
  const $ = cheerio.load(html);
  const adapter = siteAdapters[hostnameOf(pageUrl)];
  const chain: Extractor[] = [
    ...(adapter ? [adapter] : []),
    jsonLdExtractor,
    microdataExtractor,
  ];

  for (const extract of chain) {
    const recipe = extract($, pageUrl);
    if (recipe && !recipe.partial) {
      const meta = pageMetadata($, pageUrl);
      return {
        ...recipe,
        title: recipe.title || meta.title,
        intro: recipe.intro || meta.intro,
        image: recipe.image || meta.image,
      };
    }
  }
  return openGraphExtractor($, pageUrl);
}

function decode(body: Buffer, contentType: string): string {
  const charset = contentType.match(/charset=["']?([\w-]+)/i)?.[1];
  try {
    return new TextDecoder(charset || "utf-8").decode(body);
  } catch {
    return new TextDecoder("utf-8").decode(body);
  }
}

export async function scrapeRecipe(url: string): Promise<ScrapedRecipe | null> {
  const { body, contentType, finalUrl } = await safeFetch(url, {
    accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  });
  return extractRecipeFromHtml(decode(body, contentType), finalUrl);
}
