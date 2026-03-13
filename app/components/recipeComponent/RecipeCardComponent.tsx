"use client";
import { Recipe } from "../../model/Recipe";
import { useRecipeContext } from "../../context/RecipeContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import Button from "../smallComponent/Button";
import { ArrowRight, Clock, Plus, Users } from "lucide-react";
import CalendarDialog from "../../components/CalenderDialog";

export function RecipeCardComponent({ recipes }: { recipes: Recipe[] }) {
  const router = useRouter();

  const { addRecipesToWeekPlan, getDatesForNext4Weeks } = useRecipeContext();

  const [loadingRecipeId, setLoadingRecipeId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const availableDates = getDatesForNext4Weeks();

  if (!recipes || recipes.length === 0) {
    return (
      <p className="text-center py-4 text-muted-foreground">
        Der er i øjeblikket ingen opskrifter
      </p>
    );
  }

  async function handleRouter(id?: string) {
    if (!id) return;

    setLoadingRecipeId(id);
    try {
      router.push(`/recipes/${id}`);
    } catch (error) {
      console.error("Navigation error:", error);
      setLoadingRecipeId(null);
    }
  }

  const handleDialogDone = (selectedDates: string[]) => {
    if (!selectedRecipe) return;

    addRecipesToWeekPlan(selectedDates, selectedRecipe);

    setDialogOpen(false);
    setSelectedRecipe(null);
  };

  return (
    <>
      <div
        id="recipes"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-0"
      >
        {recipes.map((recipe) => {
          const isLoading = loadingRecipeId === recipe._id;

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
                shadow-sm
                ring-1 ring-black/5
                hover:shadow-md
                transition-all duration-200
              "
              >
                {/* Image */}
                <div className="relative w-full h-48 sm:h-52">
                  <Image
                    src={
                      recipe.image && recipe.image.trim() !== ""
                        ? recipe.image
                        : "/icon/swiftcart_logo.png"
                    }
                    alt={recipe.recipeName || "Opskrift"}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    priority
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0" />
                </div>

                {/* Content */}
                <div className="flex flex-col p-2 gap-3">
                  {Array.isArray(recipe.categories) &&
                    recipe.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {recipe.categories.slice(0, 4).map((category) => (
                          <span
                            key={category}
                            className="bg-secondary text-muted-foreground text-xs px-3 py-1 rounded-full font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}

                  <h2 className="text-lg sm:text-xl font-semibold text-foreground line-clamp-2">
                    {recipe.recipeName}
                  </h2>

                  {recipe.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {recipe.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
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
                    className="min-h-[44px]"
                  >
                    <Plus className="h-4 w-4" />
                    Tilføj til madplan
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    isLoading={isLoading}
                    loadingText="Indlæser..."
                    onClick={() => {
                      handleRouter(recipe._id);
                    }}
                    className="min-h-[44px]"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      Se opskrift
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </div>

                {isLoading && (
                  <div className="absolute inset-0 pointer-events-none bg-black/5" />
                )}
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
        availableDates={availableDates}
      />
    </>
  );
}
