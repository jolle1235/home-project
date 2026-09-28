// Canonical units, in the order the unit picker shows them.
export const KNOWN_UNITS = [
  "stk",
  "g",
  "kg",
  "ml",
  "cl",
  "dl",
  "l",
  "tsk",
  "spsk",
  "knsp",
  "fed",
  "dåse",
  "pk",
  "bundt",
  "skive",
  "håndfuld",
  "nip",
  "cup",
] as const;

export type Unit = (typeof KNOWN_UNITS)[number];

const UNIT_ALIASES: Record<string, Unit> = {
  gram: "g",
  grams: "g",
  gr: "g",

  kilo: "kg",
  kilogram: "kg",
  kilograms: "kg",

  milliliter: "ml",
  milliliters: "ml",
  centiliter: "cl",
  deciliter: "dl",
  liter: "l",
  liters: "l",
  ltr: "l",

  teske: "tsk",
  teskefuld: "tsk",
  teskefulde: "tsk",
  ts: "tsk",
  tsp: "tsk",
  teaspoon: "tsk",
  teaspoons: "tsk",

  spiseske: "spsk",
  spiseskefuld: "spsk",
  spiseskefulde: "spsk",
  ss: "spsk",
  tbsp: "spsk",
  tablespoon: "spsk",
  tablespoons: "spsk",

  knivspids: "knsp",
  knivspidser: "knsp",

  styk: "stk",
  stykker: "stk",
  st: "stk",
  pcs: "stk",
  piece: "stk",
  pieces: "stk",

  dåser: "dåse",
  ds: "dåse",
  pakke: "pk",
  pakker: "pk",
  pkt: "pk",
  bdt: "bundt",
  skiver: "skive",
  håndfulde: "håndfuld",
  cups: "cup",
};

function normalizeUnitString(unit: string): string {
  return unit
    .toLowerCase()
    .trim()
    .replace(/\./g, "") // remove dots
    .replace(/\s+/g, ""); // remove spaces
}

// The canonical unit for a known unit or alias, otherwise null.
export function knownUnit(inputUnit: string): Unit | null {
  const normalized = normalizeUnitString(inputUnit);
  if ((KNOWN_UNITS as readonly string[]).includes(normalized)) {
    return normalized as Unit;
  }
  return UNIT_ALIASES[normalized] ?? null;
}

// Canonical unit if known, otherwise the cleaned input, so custom units
// (e.g. from the admin unit list) are kept. Empty input becomes "stk".
export function unifyUnit(inputUnit: string): string {
  return knownUnit(inputUnit) ?? (normalizeUnitString(inputUnit) || "stk");
}
