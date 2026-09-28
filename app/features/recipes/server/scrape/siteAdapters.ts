import { Extractor, jsonLdExtractor, microdataExtractor } from "./extractors";
import { promoteHeadingSteps } from "./normalize";

// Site-specific extractors, keyed by hostname without "www.". They run
// before the generic extractors; use one for a site whose markup needs a
// fix-up, or that publishes no schema.org Recipe data at all.
export const siteAdapters: Record<string, Extractor> = {
  // Section headings ("Mornaysauce") come through as ordinary steps.
  "valdemarsro.dk": ($, pageUrl) => {
    const recipe = jsonLdExtractor($, pageUrl) ?? microdataExtractor($, pageUrl);
    return recipe && { ...recipe, instructions: promoteHeadingSteps(recipe.instructions) };
  },
};
