"use client";

import { ClipboardEvent, useState } from "react";
import { Link2 } from "lucide-react";
import { toast } from "react-toastify";
import Button from "../../../components/Button";
import { withScheme } from "../../../utils/stringUtils";
import { ScrapedRecipe } from "../types/ScrapedRecipe";

interface RecipeImportBarProps {
  onImported: (recipe: ScrapedRecipe) => void;
  // Called with the link when nothing could be imported, so it can still
  // be kept as the source link.
  onFailed: (url: string) => void;
  collapsed?: boolean;
}

function looksLikeUrl(text: string): boolean {
  return /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(text.trim());
}

export function RecipeImportBar({
  onImported,
  onFailed,
  collapsed = false,
}: RecipeImportBarProps) {
  const [isOpen, setIsOpen] = useState(!collapsed);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function importFrom(rawUrl: string) {
    const link = rawUrl.trim();
    if (isLoading) return;
    if (!link) {
      toast.info("Indsæt et link først.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        toast.error(
          `${data?.error ?? "Kunne ikke hente opskriften."} Linket er gemt som kilde – udfyld resten selv.`,
        );
        onFailed(withScheme(link));
        return;
      }

      onImported(data.recipe as ScrapedRecipe);
      setUrl("");
      if (data.partial) {
        toast.info(
          "Siden havde ingen opskriftsdata, så kun navn og billede blev hentet. Tilføj resten selv.",
        );
      } else {
        toast.success("Opskriften er hentet – tjek den og gem.");
      }
    } catch (error) {
      console.error("Recipe import failed:", error);
      toast.error("Kunne ikke hente opskriften fra linket.");
    } finally {
      setIsLoading(false);
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").trim();
    if (!looksLikeUrl(text)) return;
    e.preventDefault();
    setUrl(text);
    importFrom(text);
  };

  if (!isOpen) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        <Link2 className="h-4 w-4" aria-hidden="true" />
        Hent igen fra link
      </Button>
    );
  }

  return (
    <div className="rounded-xl bg-surface p-4 space-y-2">
      <label htmlFor="recipe-import-url" className="block">
        <span className="block text-sm font-bold text-gray-700">
          Importér fra link
        </span>
        <span className="block text-sm text-muted-foreground">
          Indsæt et link til en opskrift, så udfylder vi felterne for dig.
        </span>
      </label>
      <div className="flex gap-2">
        <input
          id="recipe-import-url"
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              importFrom(url);
            }
          }}
          placeholder="https://…"
          className="min-h-[44px] flex-1 min-w-0"
          disabled={isLoading}
        />
        <Button
          onClick={() => importFrom(url)}
          isLoading={isLoading}
          loadingText="Henter…"
        >
          Hent
        </Button>
      </div>
    </div>
  );
}
