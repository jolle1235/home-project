"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Button from "../smallComponent/Button";
import { WebLinkInput } from "../WebLinkInput";
import { Recipe } from "../../model/Recipe";
import { IconButton } from "../IconButton";
import { X } from "lucide-react";

interface Props {
  handleClose: () => void;
  onRecipeSaved?: () => void;
}

export function AddRecipeModalComponent({ handleClose, onRecipeSaved }: Props) {
  const router = useRouter();

  const handleScraped = (data: Recipe) => {
    // Save scraped data to sessionStorage and navigate to recipe page
    sessionStorage.setItem("addRecipe_data", JSON.stringify(data));
    router.push("/add-recipe");
    handleClose();
  };

  const handleManual = () => {
    // Navigate directly to recipe page
    router.push("/add-recipe");
    handleClose();
  };

  return (
    <div
      className="
    fixed inset-0
    bg-black/40
    backdrop-blur-sm
    flex items-end sm:items-center
    justify-center
    p-4
    z-50
  "
    >
      <div
        className="
      bg-background
      w-full
      max-w-md
      rounded-t-2xl sm:rounded-2xl
      shadow-xl
      p-6
      animate-slide-up
    "
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              Tilføj ny opskrift
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Importér automatisk eller opret manuelt
            </p>
          </div>

          <IconButton
            icon={X}
            variant="ghost"
            size="sm"
            ariaLabel="Luk"
            onClick={handleClose}
          />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6">
          {/* Automatic Option */}
          <div className="bg-surface rounded-xl p-4 flex flex-col gap-3">
            <div>
              <h3 className="font-medium text-foreground">Automatisk import</h3>
              <p className="text-sm text-muted-foreground">
                Indsæt et link, så henter vi opskriften for dig.
              </p>
            </div>

            <WebLinkInput onScraped={handleScraped} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-secondary"></div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Eller
            </span>
            <div className="flex-1 h-px bg-secondary"></div>
          </div>

          {/* Manual Option */}
          <Button onClick={handleManual} variant="primary" size="md" fullWidth>
            Opret Manuelt
          </Button>
        </div>
      </div>
    </div>
  );
}
