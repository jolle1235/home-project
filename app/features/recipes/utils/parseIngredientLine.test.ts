import { describe, expect, it } from "vitest";
import { parseIngredientLine, parseQuantity } from "./parseIngredientLine";

describe("parseIngredientLine", () => {
  it.each([
    ["200 g hvedemel", 200, "g", "hvedemel", ""],
    ["200g hvedemel", 200, "g", "hvedemel", ""],
    ["2 dl mælk", 2, "dl", "mælk", ""],
    ["1,5 dl fløde", 1.5, "dl", "fløde", ""],
    ["1½ tsk salt", 1.5, "tsk", "salt", ""],
    ["½ tsk peber", 0.5, "tsk", "peber", ""],
    ["1 1/2 spsk olie", 1.5, "spsk", "olie", ""],
    ["2-3 fed hvidløg", 3, "fed", "hvidløg", ""],
    ["2 til 3 gulerødder", 3, "stk", "gulerødder", ""],
    ["ca. 500 g hakket oksekød", 500, "g", "hakket oksekød", ""],
    ["2 æg", 2, "stk", "æg", ""],
    ["1 dåse hakkede tomater (400 g)", 1, "dåse", "hakkede tomater", "400 g"],
    ["1 løg, finthakket", 1, "stk", "løg", "finthakket"],
    ["3 spiseskefulde sukker", 3, "spsk", "sukker", ""],
    ["1 knivspids muskatnød", 1, "knsp", "muskatnød", ""],
    ["2 cups of flour", 2, "cup", "flour", ""],
    ["- 100 g smør", 100, "g", "smør", ""],
    ["Salt og peber", null, "stk", "Salt og peber", ""],
  ])("%s", (line, quantity, unit, name, notes) => {
    expect(parseIngredientLine(line)).toEqual({
      kind: "ingredient",
      quantity,
      unit,
      name,
      notes,
    });
  });

  it("treats a line ending in a colon as a section", () => {
    expect(parseIngredientLine("Til saucen:")).toEqual({
      kind: "section",
      name: "Til saucen",
    });
  });

  it("recognises units from the admin unit list", () => {
    expect(parseIngredientLine("2 bakker jordbær", ["bakker"])).toMatchObject({
      quantity: 2,
      unit: "bakker",
      name: "jordbær",
    });
  });

  it("returns null for blank lines", () => {
    expect(parseIngredientLine("   ")).toBeNull();
  });
});

describe("parseQuantity", () => {
  it.each([
    ["1,5", 1.5],
    ["1.5", 1.5],
    ["1/2", 0.5],
    ["1 1/2", 1.5],
    ["½", 0.5],
    ["", null],
    ["abc", null],
    ["1/0", null],
  ])("%s → %s", (input, expected) => {
    expect(parseQuantity(input)).toBe(expected);
  });
});
