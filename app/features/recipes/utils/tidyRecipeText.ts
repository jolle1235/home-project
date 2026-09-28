import { ScrapedStep } from "../types/ScrapedRecipe";

// Unifies line endings, turns non-breaking spaces into plain spaces and
// drops zero-width characters. Shared by paste, import and the ingredient parser.
export function normalizeSpacing(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[\u00A0\u2007\u202F]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
}

// Cleans pasted or imported text without changing its layout: normalizes
// spacing, trims line ends, and allows at most one blank line in a row.
export function tidyRecipeText(text: string): string {
  return normalizeSpacing(text)
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+|\n+$/g, "");
}

// Removes a leading step number ("1.", "2)", "Trin 3:", "Step 4 -").
export function stripStepNumber(text: string): string {
  return text
    .replace(/^\s*(?:trin|step)\s*\d+\s*[.:)\-–]?\s*/i, "")
    .replace(/^\s*\d+\s*[.):]\s+/, "")
    .trim();
}

// Builds the description text: intro, then numbered steps as separate
// paragraphs, with "Section:" headings where the source has sections.
export function formatInstructions(intro: string, steps: ScrapedStep[]): string {
  const parts: string[] = [];
  const cleanIntro = intro.trim();
  const firstStep = steps[0]?.text.trim();
  if (cleanIntro && cleanIntro !== firstStep) parts.push(cleanIntro);

  let section: string | undefined;
  steps.forEach((step, index) => {
    if (step.section && step.section !== section) {
      parts.push(`${step.section.replace(/:$/, "")}:`);
    }
    section = step.section;
    parts.push(`${index + 1}. ${stripStepNumber(step.text)}`);
  });

  return tidyRecipeText(parts.join("\n\n"));
}
