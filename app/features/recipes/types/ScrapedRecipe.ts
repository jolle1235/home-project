// What /api/scrape returns: a site-independent recipe, before it is turned
// into form state. Ingredients and steps are still plain text here.
export interface ScrapedStep {
  section?: string;
  text: string;
}

export interface ScrapedRecipe {
  title: string;
  intro: string;
  image: string;
  ingredients: string[];
  instructions: ScrapedStep[];
  totalMinutes: number;
  servings: number;
  author: string;
  keywords: string[];
  sourceUrl: string;
  // true when only page metadata (title/image) was found, not a real recipe
  partial: boolean;
}
