import { describe, expect, it } from "vitest";
import { ScrapedRecipe } from "../types/ScrapedRecipe";
import { emptyDraft, recipeToDraft, scrapedToDraft } from "./recipeDraft";

const scraped = (keywords: string[]): ScrapedRecipe => ({
  title: "Mojito",
  intro: "",
  image: "",
  ingredients: ["4 cl hvid rom"],
  instructions: [],
  totalMinutes: 5,
  servings: 1,
  author: "",
  keywords,
  sourceUrl: "https://example.dk/mojito",
  partial: false,
});

const options = { units: [], categories: [] };

describe("drink type", () => {
  it("marks imports tagged as drinks or cocktails", () => {
    expect(scrapedToDraft(scraped(["Cocktails"]), options).type).toBe("drink");
    expect(scrapedToDraft(scraped(["Drinks", "Sommer"]), options).type).toBe("drink");
    expect(scrapedToDraft(scraped(["Aftensmad"]), options).type).toBe("recipe");
  });

  it("treats recipes without a type as food", () => {
    expect(
      recipeToDraft({
        _id: "1",
        recipeName: "Lasagne",
        description: "",
        image: "",
        ingredients: [],
        time: 60,
        categories: [],
        recommendedPersonAmount: 4,
        author: "",
      }).type,
    ).toBe("recipe");
  });

  it("new drafts can start as a drink", () => {
    expect(emptyDraft("drink").type).toBe("drink");
    expect(emptyDraft().type).toBe("recipe");
  });
});
