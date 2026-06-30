"use client";

import { useRef, useState } from "react";
import { Recipe } from "../types/Recipe";
import { mapSchemaRecipeToRecipe } from "../utils/mummumRecipeConvertion";
import Button from "../../../components/Button";
import { toast } from "react-toastify";

type WebLinkInputProps = {
  onScraped?: (recipe: Recipe) => void;
};

export function WebLinkInput({ onScraped }: WebLinkInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  function createEmptyRecipeFromUrl(url: string): Recipe {
    return {
      _id: "",
      recipeName: "",
      description: "",
      image: "",
      sourceUrl: url,
      ingredients: [],
      time: 0,
      categories: [],
      recommendedPersonAmount: 0,
      author: "",
    };
  }

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
        toast.info(
          "Kunne ikke hente data fra linket. Starter med tom opskrift.",
        );
        onScraped?.(createEmptyRecipeFromUrl(normalizedUrl));
        return;
      }

      const data = await res.json();

      if (!data.success) {
        toast.info(
          "Kunne ikke hente data fra linket. Starter med tom opskrift.",
        );
        onScraped?.(createEmptyRecipeFromUrl(normalizedUrl));
        return;
      }

      const recipe: Recipe = {
        ...mapSchemaRecipeToRecipe(data),
        sourceUrl: normalizedUrl,
      };

      if (onScraped) {
        onScraped(recipe);
      }
    } catch (err) {
      console.error("Scraping failed:", err);
      toast.info("Kunne ikke hente data fra linket. Starter med tom opskrift.");
      onScraped?.(createEmptyRecipeFromUrl(normalizedUrl));
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
      <Button
        onClick={sendWebpage}
        variant="primary"
        size="md"
        isLoading={isLoading}
      >
        Send
      </Button>
    </div>
  );
}
