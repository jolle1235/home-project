import { describe, expect, it } from "vitest";
import { Ingredient } from "../../../model/Ingredient";
import {
  EditorRow,
  emptyIngredientRow,
  ingredientsToRows,
  rowsToIngredients,
  sectionRow,
  withTrailingEmptyRow,
} from "./ingredientRows";

const stored: Ingredient[] = [
  {
    _id: "i1",
    item: { _id: "item1", name: "Mel", category: "Bageri", defaultUnit: "g" },
    unit: "g",
    quantity: 200,
    marked: true,
  },
  {
    _id: "i2",
    item: { _id: "unknown", name: "Tomater", category: "unknown", defaultUnit: "dåse" },
    unit: "dåse",
    quantity: 1,
    marked: false,
    section: "Til saucen",
    notes: "hakkede",
  },
];

describe("ingredient rows", () => {
  it("round-trips stored ingredients, including sections and notes", () => {
    const rows = ingredientsToRows(stored);
    expect(rows.map((r) => r.kind)).toEqual([
      "ingredient",
      "section",
      "ingredient",
      "ingredient", // trailing empty row
    ]);
    expect(rowsToIngredients(rows)).toEqual(stored);
  });

  it("drops empty rows and defaults a blank quantity to 1", () => {
    const rows: EditorRow[] = [
      { ...emptyIngredientRow(), name: "Salt", unit: "knivspids" },
      emptyIngredientRow(),
    ];
    expect(rowsToIngredients(rows)).toEqual([
      {
        _id: "unknown",
        marked: false,
        item: { _id: "unknown", name: "Salt", category: "unknown", defaultUnit: "knsp" },
        unit: "knsp",
        quantity: 1,
      },
    ]);
  });

  it("parses comma decimals and fractions typed into the quantity field", () => {
    const rows: EditorRow[] = [
      { ...emptyIngredientRow(), name: "Mælk", quantity: "1,5", unit: "dl" },
      { ...emptyIngredientRow(), name: "Smør", quantity: "1/2", unit: "pk" },
    ];
    expect(rowsToIngredients(rows).map((i) => i.quantity)).toEqual([1.5, 0.5]);
  });

  it("an empty section name ends the previous section", () => {
    const rows: EditorRow[] = [
      sectionRow("Dej"),
      { ...emptyIngredientRow(), name: "Mel" },
      sectionRow(""),
      { ...emptyIngredientRow(), name: "Salt" },
    ];
    expect(rowsToIngredients(rows).map((i) => i.section)).toEqual(["Dej", undefined]);
  });

  it("keeps exactly one trailing empty row, reusing the first one", () => {
    const first = emptyIngredientRow();
    const rows = withTrailingEmptyRow([
      { ...emptyIngredientRow(), name: "Mel" },
      first,
      emptyIngredientRow(),
    ]);
    expect(rows).toHaveLength(2);
    expect(rows[1].key).toBe(first.key);
    expect(withTrailingEmptyRow([])).toHaveLength(1);
  });
});
