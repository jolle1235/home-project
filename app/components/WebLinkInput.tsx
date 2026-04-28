"use client";

import { useRef, useState } from "react";
import { Recipe } from "../model/Recipe";
import { mapSchemaRecipeToRecipe } from "../utils/mummumRecipeConvertion";
import Button from "./smallComponent/Button";
import { toast } from "react-toastify";

type WebLinkInputProps = {
  onScraped?: (recipe: Recipe) => void;
};

export function WebLinkInput({ onScraped }: WebLinkInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function sendWebpage() {
    if (!inputRef.current || isLoading) return;

    const rawUrl = inputRef.current.value.trim();
    if (!rawUrl) {
      toast.info("Indsæt et link først.");
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(rawUrl)
      ? rawUrl
      : `https://${rawUrl}`;

    try {
      setIsLoading(true);
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!res.ok) {
        toast.error("Kunne ikke hente siden.");
        return;
      }

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
    } finally {
      setIsLoading(false);
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
      <Button onClick={sendWebpage} variant="primary" size="md" isLoading={isLoading}>
        Send
      </Button>
    </div>
  );
}
