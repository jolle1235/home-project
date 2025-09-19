"use client";

import { useRef } from "react";
import ActionBtn from "./smallComponent/actionBtn";
import { Recipe } from "../model/Recipe";
import { mapSchemaRecipeToRecipe } from "../utils/mummumRecipeConvertion";

type WebLinkInputProps = {
  onScraped?: (recipe: Recipe) => void;
};

export function WebLinkInput({ onScraped }: WebLinkInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function sendWebpage() {
    if (!inputRef.current) return;

    const url = inputRef.current.value;
    if (!url) return;

    try {
      const res = await fetch("/api/scrape/mummum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      // 🔑 Call parent callback with the recipe
      if (onScraped && data?.recipe) {
        console.log("data:", data);
        const recipe: Recipe = mapSchemaRecipeToRecipe(data);

        onScraped(recipe);
      }
    } catch (err) {
      console.error("Scraping failed:", err);
    }
  }

  return (
    <div className="w-full flex flex-row border-b-2 border-lightgreyBackground p-2">
      <input
        ref={inputRef}
        className="w-10/12"
        id="web_scraper"
        type="text"
        placeholder="Indsæt Link"
      />
      <ActionBtn
        onClickF={sendWebpage}
        Itext="Send"
        color="bg-action"
        hover="bg-actionHover"
        extraCSS="flex-1 ml-2"
      />
    </div>
  );
}
