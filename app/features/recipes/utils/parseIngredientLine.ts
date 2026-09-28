import { knownUnit } from "../../../utils/unitHelper";
import { normalizeSpacing } from "./tidyRecipeText";

// Parses one ingredient line ("200 g hvedemel", "1½ dl mælk, lun",
// "2-3 fed hvidløg (store)") into quantity, unit, name and notes.
// A line ending in ":" ("Til saucen:") is a section heading.

export type ParsedLine =
  | {
      kind: "ingredient";
      quantity: number | null;
      unit: string;
      name: string;
      notes: string;
    }
  | { kind: "section"; name: string };

const UNICODE_FRACTIONS: Record<string, string> = {
  "¼": "1/4",
  "½": "1/2",
  "¾": "3/4",
  "⅓": "1/3",
  "⅔": "2/3",
  "⅕": "1/5",
  "⅖": "2/5",
  "⅗": "3/5",
  "⅘": "4/5",
  "⅙": "1/6",
  "⅚": "5/6",
  "⅛": "1/8",
  "⅜": "3/8",
  "⅝": "5/8",
  "⅞": "7/8",
};

const QTY = String.raw`(?:\d+\s+\d+\s*\/\s*\d+|\d+\s*\/\s*\d+|\d+(?:[.,]\d+)?)`;
const QUANTITY_RE = new RegExp(
  String.raw`^(${QTY})(?:\s*(?:-|–|—|til|to)\s*(${QTY}))?`,
  "i",
);

function replaceUnicodeFractions(text: string): string {
  return text.replace(/(\d?)\s*([¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/g, (_, whole, frac) =>
    whole ? `${whole} ${UNICODE_FRACTIONS[frac]}` : UNICODE_FRACTIONS[frac],
  );
}

// "1,5" → 1.5, "1/2" → 0.5, "1 1/2" → 1.5. Also accepts "½". Null if not a number.
export function parseQuantity(text: string): number | null {
  const value = replaceUnicodeFractions(text.trim());
  if (!value) return null;
  const mixed = value.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const fraction = value.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction) {
    return Number(fraction[2]) ? Number(fraction[1]) / Number(fraction[2]) : null;
  }
  const number = Number(value.replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

export function roundQuantity(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function parseIngredientLine(
  line: string,
  extraUnits: string[] = [],
): ParsedLine | null {
  let text = normalizeSpacing(line)
    .replace(/^\s*(?:[-*•·–—▢□☐✓]|\d+[.)](?=\s))\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;

  const heading = text.match(/^([^\d].*?):$/);
  if (heading) return { kind: "section", name: heading[1].trim() };

  text = replaceUnicodeFractions(text).replace(/^(?:ca\.?|cirka|omkring|about)\s+/i, "");

  let quantity: number | null = null;
  const qty = text.match(QUANTITY_RE);
  if (qty) {
    // For ranges ("2-3") use the larger amount.
    quantity = parseQuantity(qty[2] ?? qty[1]);
    text = text.slice(qty[0].length).trim();
  }

  let unit = "";
  const token = text.match(/^([^\s,()]+)/)?.[1] ?? "";
  if (token) {
    const extra = extraUnits.find(
      (u) => u.toLowerCase() === token.replace(/\.$/, "").toLowerCase(),
    );
    const canonical = knownUnit(token) ?? extra;
    if (canonical) {
      unit = canonical;
      text = text.slice(token.length).trim();
    }
  }

  text = text.replace(/^(?:of|af)\s+/i, "");

  // "(ca. 400 g)" and anything after the first comma become notes.
  const notes: string[] = [];
  text = text.replace(/\(([^)]*)\)/g, (_, inner: string) => {
    if (inner.trim()) notes.push(inner.trim());
    return " ";
  });
  const comma = text.indexOf(",");
  if (comma !== -1) {
    const after = text.slice(comma + 1).trim();
    if (after) notes.push(after);
    text = text.slice(0, comma);
  }

  return {
    kind: "ingredient",
    quantity: quantity === null ? null : roundQuantity(quantity),
    unit: unit || "stk",
    name: text.replace(/\s+/g, " ").trim(),
    notes: notes.join(", "),
  };
}
