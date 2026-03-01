"use client";
import { useEffect, useState, useMemo } from "react";
import { Filter } from "lucide-react";
import { AddButtonComponent } from "../components/AddButtonComponent";
import { AddRecipeModalComponent } from "../components/recipeComponent/AddRecipeModalComponent";
import { RecipeCardComponent } from "../components/recipeComponent/RecipeCardComponent";
import { CategoryWheelComponent } from "../components/CategoryWheelComponent";
import { TimeRangeSelectorComponent } from "../components/TimeRangeSelectorComponent";
import { Recipe } from "../model/Recipe";
import { useConstants } from "../context/ConstantsContext";
import { IconButton } from "../components/IconButton";

export default function RecipePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterSettingsOpen, setIsFilterSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number[]>([0, 60]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showMyRecipes, setShowMyRecipes] = useState<boolean>(true);
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

  return (
    <div className="flex flex-col w-full bg-lightBackground overflow-hidden">
      <div className="flex flex-row w-full mb-4 items-center">
        <input
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Søg efter opskrifter..."
          className="border border-gray-300 p-2 rounded-md w-full"
        />
        <div className="ml-2 flex items-center gap-1 group">
          <IconButton
            icon={Filter}
            variant="secondary"
            ariaLabel={isFilterSettingsOpen ? "Skjul filter" : "Vis filter"}
            onClick={() => setIsFilterSettingsOpen(!isFilterSettingsOpen)}
          />
          <span className="hidden sm:inline-flex text-sm text-darkText opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
            {isFilterSettingsOpen ? "Skjul filter" : "Vis filter"}
          </span>
        </div>
      </div>

      {isFilterSettingsOpen && (
        <div className="flex w-full md:flex-row flex-col h-fit p-2 rounded-lg bg-gray-200 items-center md:divide-x md:divide-gray-400">
          <div className="flex-1 items-center p-1">
            <CategoryWheelComponent
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
            />
          </div>
          <div className="flex-1 p-1 h-full flex justify-center">
            <TimeRangeSelectorComponent
              timeRange={timeRange}
              setTimeRange={setTimeRange}
            />
          </div>
        </div>
      )}

      <div className="mt-2">
        {isLoading ? (
          <div>Loading recipes...</div>
        ) : error ? (
          <div className="text-red-500">Error loading recipes: {error}</div>
        ) : (
          <RecipeCardComponent recipes={filteredRecipes} />
        )}
      </div>

      <AddButtonComponent
        onClick={handleOpen}
        label="Add Recipe"
        ariaLabel="add_recipe"
      />

      {isModalOpen && (
        <AddRecipeModalComponent
          handleClose={handleClose}
          onRecipeSaved={handleRecipeSaved}
        />
      )}
    </div>
  );
}
