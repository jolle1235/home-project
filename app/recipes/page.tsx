"use client";
import { useEffect, useState, useMemo } from "react";
import { Filter, Plus, Trash2 } from "lucide-react";
import { AddRecipeModalComponent } from "../components/recipeComponent/AddRecipeModalComponent";
import { RecipeCardComponent } from "../components/recipeComponent/RecipeCardComponent";
import { CategoryWheelComponent } from "../components/CategoryWheelComponent";
import { TimeRangeSelectorComponent } from "../components/TimeRangeSelectorComponent";
import { Recipe } from "../model/Recipe";
import { useConstants } from "../context/ConstantsContext";
import { IconButton } from "../components/IconButton";
import Button from "../components/smallComponent/Button";

export default function RecipePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterSettingsOpen, setIsFilterSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number[]>([0, 60]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { categories } = useConstants();

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  const handleRecipeSaved = async () => {
    // Refresh recipes after saving
    setIsLoading(true);
    try {
      const response = await fetch("/api/recipe");
      if (!response.ok) throw new Error("Failed to fetch recipes");
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/recipe");
        if (!response.ok) throw new Error("Failed to fetch recipes");
        const data = await response.json();
        setRecipes(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const filteredRecipes = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return recipes.filter((recipe) => {
      if (!recipe?.recipeName || !recipe.time) return false;

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((category) =>
          recipe.categories?.includes(category)
        );

      const matchesTime =
        recipe.time >= timeRange[0] &&
        (timeRange[1] === 60 || recipe.time <= timeRange[1]);

      const matchesSearch = recipe.recipeName
        .toLowerCase()
        .includes(lowerCaseSearchTerm);

      return matchesCategory && matchesTime && matchesSearch;
    });
  }, [recipes, selectedCategories, timeRange, searchTerm]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const resultsCount = filteredRecipes.length;

  return (
    <div className="w-full bg-background overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-3">
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
                  Opskrifter
                </h1>
                {!isLoading && !error && (
                  <span className="text-sm text-muted-foreground">
                    {resultsCount} resultat
                    {resultsCount === 1 ? "" : "er"}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground max-w-xl">
                Find, filtrer og tilføj opskrifter til din madplan.
              </p>
            </div>
          </div>

          <div className="w-full sm:max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="search"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Søg efter opskrifter..."
                className="w-full rounded-xl border border-gray-300 bg-background p-2 text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-hover"
                aria-label="Søg efter opskrifter"
              />
            </div>
            <div className="flex items-center gap-1 group">
              <IconButton
                icon={Filter}
                variant="secondary"
                size="md"
                ariaLabel={isFilterSettingsOpen ? "Skjul filtre" : "Vis filtre"}
                onClick={() => setIsFilterSettingsOpen(!isFilterSettingsOpen)}
              />
              <span className="hidden sm:inline-flex text-sm text-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                {isFilterSettingsOpen ? "Skjul filtre" : "Vis filtre"}
              </span>
              <div className="flex justify-center items-center">
                <IconButton
                  icon={Plus}
                  variant="primary"
                  size="md"
                  aria-label="Tilføj opskrift"
                  onClick={() => handleOpen()}
                ></IconButton>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {isFilterSettingsOpen && (
          <section
            aria-label="Filtre"
            className="mt-4 rounded-2xl bg-surface p-4 sm:p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-6">
              <div className="flex-1">
                <h2 className="text-sm font-medium text-foreground mb-2">
                  Kategorier
                </h2>
                <CategoryWheelComponent
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onCategoryToggle={handleCategoryToggle}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-medium text-foreground mb-2">
                  Tid (minutter)
                </h2>
                <TimeRangeSelectorComponent
                  timeRange={timeRange}
                  setTimeRange={setTimeRange}
                />
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        <div className="mt-5">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Indlæser opskrifter...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-600">
              Der opstod en fejl ved indlæsning af opskrifter: {error}
            </div>
          ) : resultsCount === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-foreground font-medium">
                Ingen opskrifter matcher dine filtre.
              </p>
              <p className="text-sm text-muted-foreground">
                Prøv at justere søgning eller filtre for at se flere resultater.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategories([]);
                  setTimeRange([0, 60]);
                }}
              >
                Nulstil filtre
              </Button>
            </div>
          ) : (
            <RecipeCardComponent recipes={filteredRecipes} />
          )}
        </div>
      </div>

      {isModalOpen && (
        <AddRecipeModalComponent
          handleClose={handleClose}
          onRecipeSaved={handleRecipeSaved}
        />
      )}
    </div>
  );
}
