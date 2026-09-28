import { describe, expect, it } from "vitest";
import { extractRecipeFromHtml } from "./index";
import {
  cleanText,
  flattenInstructions,
  parseDuration,
  parseYield,
  promoteHeadingSteps,
} from "./normalize";

const URL = "https://example.dk/opskrift/lasagne";

function page(head: string, body = "") {
  return `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;
}

function jsonLd(data: unknown) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

describe("JSON-LD", () => {
  it("finds a Recipe inside a Yoast-style @graph with an @type array", () => {
    const html = page(
      jsonLd({
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "WebPage", name: "Lasagne | Example" },
          {
            "@type": ["Recipe", "NewsArticle"],
            name: "Lasagne &amp; salat",
            description: "<p>Klassisk lasagne.</p>",
            image: [{ "@type": "ImageObject", url: "/img/lasagne.jpg" }],
            recipeIngredient: ["500 g hakket oksekød", " 1 dåse hakkede tomater "],
            recipeInstructions: [
              { "@type": "HowToStep", text: "Brun kødet." },
              { "@type": "HowToStep", text: "Tilsæt tomater." },
            ],
            totalTime: "PT1H15M",
            recipeYield: ["4", "4 personer"],
            author: [{ "@type": "Person", name: "Mette" }],
            recipeCategory: "Aftensmad",
            keywords: "pasta, italiensk",
          },
        ],
      }),
    );

    expect(extractRecipeFromHtml(html, URL)).toEqual({
      title: "Lasagne & salat",
      intro: "Klassisk lasagne.",
      image: "https://example.dk/img/lasagne.jpg",
      ingredients: ["500 g hakket oksekød", "1 dåse hakkede tomater"],
      instructions: [{ text: "Brun kødet." }, { text: "Tilsæt tomater." }],
      totalMinutes: 75,
      servings: 4,
      author: "Mette",
      keywords: ["Aftensmad", "pasta", "italiensk"],
      sourceUrl: URL,
      partial: false,
    });
  });

  it("flattens HowToSection steps and keeps the section names", () => {
    const html = page(
      jsonLd([
        { "@type": "Organization", name: "Example" },
        {
          "@type": "Recipe",
          name: "Kage",
          recipeIngredient: ["200 g mel"],
          recipeInstructions: [
            {
              "@type": "HowToSection",
              name: "Dej",
              itemListElement: [
                { "@type": "HowToStep", text: "Ælt dejen." },
                { "@type": "HowToStep", text: "Lad hæve." },
              ],
            },
            {
              "@type": "HowToSection",
              name: "Glasur",
              itemListElement: [{ "@type": "HowToStep", text: "Rør flormelis." }],
            },
          ],
          prepTime: "PT20M",
          cookTime: "PT40M",
          recipeYield: 12,
        },
      ]),
    );

    const recipe = extractRecipeFromHtml(html, URL)!;
    expect(recipe.instructions).toEqual([
      { section: "Dej", text: "Ælt dejen." },
      { section: "Dej", text: "Lad hæve." },
      { section: "Glasur", text: "Rør flormelis." },
    ]);
    expect(recipe.totalMinutes).toBe(60);
    expect(recipe.servings).toBe(12);
  });

  it("splits a single HTML instructions string into steps", () => {
    const html = page(
      jsonLd({
        "@type": "Recipe",
        name: "Suppe",
        recipeIngredient: ["1 l bouillon"],
        recipeInstructions: "<ol><li>Kog op.</li><li>Smag til.</li></ol>",
      }),
    );
    expect(extractRecipeFromHtml(html, URL)!.instructions).toEqual([
      { text: "Kog op." },
      { text: "Smag til." },
    ]);
  });

  it("tolerates raw newlines inside JSON strings", () => {
    const html = page(
      `<script type="application/ld+json">{"@type":"Recipe","name":"Brød","recipeIngredient":["1 kg mel"],"recipeInstructions":"Bland alt.\nBag."}</script>`,
    );
    expect(extractRecipeFromHtml(html, URL)!.title).toBe("Brød");
  });

  it("fills a missing image from OpenGraph", () => {
    const html = page(
      `<meta property="og:image" content="https://cdn.example.dk/og.jpg">` +
        jsonLd({ "@type": "Recipe", name: "Salat", recipeIngredient: ["1 salathoved"] }),
    );
    expect(extractRecipeFromHtml(html, URL)!.image).toBe("https://cdn.example.dk/og.jpg");
  });
});

describe("microdata", () => {
  it("reads itemprop values and ignores nested scopes", () => {
    const html = page(
      "",
      `<div itemscope itemtype="https://schema.org/Recipe">
        <h1 itemprop="name">Frikadeller</h1>
        <span itemprop="author" itemscope itemtype="https://schema.org/Person">
          <span itemprop="name">Hanne</span>
        </span>
        <img itemprop="image" src="/frikadeller.jpg">
        <meta itemprop="totalTime" content="PT45M">
        <span itemprop="recipeYield">4 personer</span>
        <ul>
          <li itemprop="recipeIngredient">500 g hakket svinekød</li>
          <li itemprop="recipeIngredient">1 æg</li>
        </ul>
        <div itemprop="recipeInstructions"><p>Rør farsen.</p><p>Steg dem.</p></div>
      </div>`,
    );

    expect(extractRecipeFromHtml(html, URL)).toMatchObject({
      title: "Frikadeller",
      author: "Hanne",
      image: "https://example.dk/frikadeller.jpg",
      ingredients: ["500 g hakket svinekød", "1 æg"],
      instructions: [{ text: "Rør farsen." }, { text: "Steg dem." }],
      totalMinutes: 45,
      servings: 4,
      partial: false,
    });
  });
});

describe("microdata description", () => {
  it("falls back to the meta description when itemprop=description wraps the recipe", () => {
    const html = page(
      `<meta name="description" content="Kort intro.">`,
      `<div itemscope itemtype="http://schema.org/Recipe">
        <div itemprop="description">
          <h1 itemprop="name">Lasagne</h1>
          <span itemprop="recipeIngredient">200 g lasagneplader</span>
        </div>
      </div>`,
    );
    expect(extractRecipeFromHtml(html, URL)!.intro).toBe("Kort intro.");
  });

  it("keeps a long description that is only text", () => {
    const long = "Lang tekst. ".repeat(80).trim();
    const html = page(
      "",
      `<div itemscope itemtype="http://schema.org/Recipe">
        <h1 itemprop="name">Lasagne</h1>
        <div itemprop="description">${long}</div>
        <span itemprop="recipeIngredient">200 g lasagneplader</span>
      </div>`,
    );
    expect(extractRecipeFromHtml(html, URL)!.intro).toBe(long);
  });
});

describe("site adapters", () => {
  it("valdemarsro.dk: heading-like steps become sections", () => {
    const html = page(
      jsonLd({
        "@type": "Recipe",
        name: "Lasagne",
        recipeIngredient: ["400 g hakket oksekød"],
        recipeInstructions: [
          "Lasagnesauce",
          "Brun kødet i en gryde.",
          "Mornaysauce",
          "Smelt smørret.",
        ],
      }),
    );
    expect(extractRecipeFromHtml(html, "https://www.valdemarsro.dk/lasagne/")!.instructions).toEqual([
      { section: "Lasagnesauce", text: "Brun kødet i en gryde." },
      { section: "Mornaysauce", text: "Smelt smørret." },
    ]);
    // Other sites keep the steps as they are.
    expect(extractRecipeFromHtml(html, URL)!.instructions).toHaveLength(4);
  });
});

describe("fallbacks", () => {
  it("returns a partial result from OpenGraph when there is no recipe data", () => {
    const html = page(
      `<meta property="og:title" content="Mormors æblekage">
       <meta property="og:image" content="https://example.dk/kage.jpg">
       <meta name="description" content="Den bedste.">`,
    );
    expect(extractRecipeFromHtml(html, URL)).toMatchObject({
      title: "Mormors æblekage",
      image: "https://example.dk/kage.jpg",
      intro: "Den bedste.",
      ingredients: [],
      partial: true,
    });
  });

  it("returns null for a page with nothing usable", () => {
    expect(extractRecipeFromHtml(page(""), URL)).toBeNull();
  });
});

describe("normalize helpers", () => {
  it.each([
    ["PT30M", 30],
    ["PT1H30M", 90],
    ["P0DT2H", 120],
    ["PT0H90M", 90],
    ["P1D", 1440],
    ["PT1H30M30S", 91],
    ["90 min", 90],
    ["1 time 15 min", 75],
    ["", 0],
    [undefined, 0],
  ])("parseDuration(%s) = %s", (input, expected) => {
    expect(parseDuration(input)).toBe(expected);
  });

  it.each([
    [4, 4],
    ["6 personer", 6],
    [["8", "8 stk"], 8],
    [null, 0],
  ])("parseYield(%s) = %s", (input, expected) => {
    expect(parseYield(input)).toBe(expected);
  });

  it("cleanText decodes double-encoded entities and keeps <br> as line breaks", () => {
    expect(cleanText("R&amp;amp;D<br>ny linje")).toBe("R&D\nny linje");
  });

  it("flattenInstructions handles an ItemList wrapper", () => {
    expect(
      flattenInstructions({
        "@type": "ItemList",
        itemListElement: [{ "@type": "HowToStep", name: "Skær grøntsager." }],
      }),
    ).toEqual([{ text: "Skær grøntsager." }]);
  });

  it("promoteHeadingSteps turns heading-like steps into sections", () => {
    expect(
      promoteHeadingSteps([
        { text: "Lasagnesauce" },
        { text: "Sauter løg og hvidløg." },
        { text: "Lad saucen simre." },
        { text: "Mornaysauce" },
        { text: "Smelt smørret." },
      ]),
    ).toEqual([
      { section: "Lasagnesauce", text: "Sauter løg og hvidløg." },
      { section: "Lasagnesauce", text: "Lad saucen simre." },
      { section: "Mornaysauce", text: "Smelt smørret." },
    ]);
  });

  it("promoteHeadingSteps leaves short real steps alone", () => {
    const steps = [{ text: "Bland alt" }, { text: "Bag" }, { text: "Server." }];
    expect(promoteHeadingSteps(steps)).toEqual(steps);
  });
});
