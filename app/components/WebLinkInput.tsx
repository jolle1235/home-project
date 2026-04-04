"use client";

import { useRef } from "react";
import { Recipe } from "../model/Recipe";
import { mapSchemaRecipeToRecipe } from "../utils/mummumRecipeConvertion";
import Button from "./smallComponent/Button";
import { toast } from "react-toastify";

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
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Kunne ikke hente opskrift");
        return;
      }

      const recipe: Recipe = mapSchemaRecipeToRecipe(data);

      if (onScraped) {
        onScraped(recipe);
      }
    } catch (err) {
      console.error("Scraping failed:", err);
      toast.error("Noget gik galt ved scraping");
    }
  }

  return (
    <div className="w-full flex flex-row gap-2">
      <input
        ref={inputRef}
        className="w-10/12"
        id="web_scraper"
        type="text"
        placeholder="Indsæt Link"
      />
      <Button onClick={sendWebpage} variant="primary" size="md">
        Send
      </Button>
    </div>
  );
}
