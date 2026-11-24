"use client";
import { Recipe } from "../types/Recipe";
import { useWeekPlan } from "../../weekplanner/hooks/useWeekPlan";
import Image from "next/image";
import { useState } from "react";
import Button from "../../../components/Button";
import { ArrowRight, Clock, Plus, Users } from "lucide-react";
import CalendarDialog from "../../../components/CalenderDialog";

export function RecipeCardComponent({ recipes }: { recipes: Recipe[] }) {
  const { addRecipe } = useWeekPlan();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  if (!recipes || recipes.length === 0) {
    return (
      <p className="text-center py-4 text-muted-foreground">
        Der er i øjeblikket ingen opskrifter
      </p>
    );
  }

  const handleDialogDone = (selectedDates: string[]) => {
    if (!selectedRecipe) return;

    addRecipe(selectedDates, selectedRecipe);

    setDialogOpen(false);
    setSelectedRecipe(null);
  };

  return (
    <>
      <div
        id="recipes"
        className="grid grid-cols-1 md:grid-cols-2 gap-section px-0"
      >
        {recipes.map((recipe) => {
          return (
            <article key={recipe._id} className="w-full">
              <div
                className="
                group
                relative
                flex flex-col
                bg-surface
                rounded-2xl
                overflow-hidden
                shadow-raised
                ring-1 ring-edge
                hover:shadow-floating
                transition-all duration-200
              "
              >
                {/* Image */}
                <div className="relative w-full h-44 md:h-48">
                  <Image
                    src={
                      recipe.image && recipe.image.trim() !== ""
                        ? recipe.image
                        : "/icon/swiftcart_logo.png"
                    }
                    alt={recipe.recipeName || "Opskrift"}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                    priority
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-shade via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="flex flex-col p-2 gap-3">
                  {Array.isArray(recipe.categories) &&
                    recipe.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {recipe.categories.slice(0, 4).map((category) => (
                          <span
                            key={category}
                            className="bg-secondary text-muted-foreground text-label px-3 py-0.5 rounded-full font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}

                  <h2 className="text-card-title text-foreground line-clamp-2">
                    {recipe.recipeName}
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-body-sm text-muted-foreground">
                    <div className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{recipe.time} min</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>{recipe.recommendedPersonAmount} personer</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-2 pb-2 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      setDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Tilføj til madplan
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    href={`/recipes/${recipe._id}`}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      Se opskrift
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* SINGLE dialog for all cards */}
      <CalendarDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onDone={handleDialogDone}
      />
    </>
  );
}
