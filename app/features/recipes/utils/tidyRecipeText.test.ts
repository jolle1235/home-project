import { describe, expect, it } from "vitest";
import { formatInstructions, stripStepNumber, tidyRecipeText } from "./tidyRecipeText";

describe("tidyRecipeText", () => {
  it("keeps line breaks and indentation but trims line ends", () => {
    expect(tidyRecipeText("Trin et  \r\n  indrykket\r\n")).toBe("Trin et\n  indrykket");
  });

  it("allows at most one blank line in a row", () => {
    expect(tidyRecipeText("a\n\n\n\nb")).toBe("a\n\nb");
  });

  it("replaces non-breaking spaces and removes zero-width characters", () => {
    expect(tidyRecipeText("200\u00A0g\u200B mel")).toBe("200 g mel");
  });
});

describe("stripStepNumber", () => {
  it.each([
    ["1. Forvarm ovnen", "Forvarm ovnen"],
    ["2) Rør smørret", "Rør smørret"],
    ["Trin 3: Bag", "Bag"],
    ["Step 4 - Serve", "Serve"],
    ["2 dl mælk hældes i", "2 dl mælk hældes i"],
  ])("%s", (input, expected) => {
    expect(stripStepNumber(input)).toBe(expected);
  });
});

describe("formatInstructions", () => {
  it("puts the intro first and each step in its own numbered paragraph", () => {
    expect(
      formatInstructions("En nem ret.", [
        { text: "1. Forvarm ovnen." },
        { text: "Bag i 20 min." },
      ]),
    ).toBe("En nem ret.\n\n1. Forvarm ovnen.\n\n2. Bag i 20 min.");
  });

  it("adds a heading when the section changes", () => {
    expect(
      formatInstructions("", [
        { section: "Dej", text: "Ælt dejen." },
        { section: "Dej", text: "Lad hæve." },
        { section: "Fyld", text: "Svits løg." },
      ]),
    ).toBe("Dej:\n\n1. Ælt dejen.\n\n2. Lad hæve.\n\nFyld:\n\n3. Svits løg.");
  });
});
