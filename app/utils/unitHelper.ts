export type Unit = "g" | "kg" | "stk" | "ml" | "l";

const UNIT_ALIASES: Record<string, Unit> = {
  g: "g",
  ".g": "g",
  " g": "g",
  gram: "g",
  grams: "g",

  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",

  stk: "stk",
  styk: "stk",
  stykker: "stk",
  pcs: "stk",
  piece: "stk",
  pieces: "stk",

  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",

  l: "l",
  liter: "l",
  liters: "l",
};

function normalizeUnitString(unit: string): string {
  return unit
    .toLowerCase()
    .trim()
    .replace(/\./g, "") // remove dots
    .replace(/\s+/g, ""); // remove spaces
}

export function unifyUnit(inputUnit: string): Unit | null {
  const normalized = normalizeUnitString(inputUnit);

  if (UNIT_ALIASES[normalized]) {
    return UNIT_ALIASES[normalized];
  }

  return null; // unknown unit
}
