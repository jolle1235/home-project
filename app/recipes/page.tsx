"use client";
import { useEffect, useState, useMemo } from "react";
import { AddRecipeButtonComponent } from "../components/AddRecipeButtonComponent";
import { RecipeCardComponent } from "../components/RecipeCardComponent";
import { CategoryWheelComponent } from "../components/CategoryWheelComponent";
import { TimeRangeSelectorComponent } from "../components/TimeRangeSelectorComponent";
import VisibilityToggle from "../components/smallComponent/VisibilityToggleComponent";
import { Recipe } from "../model/Recipe";
import { meatCategories } from "../constant/recipeCategories";

export default function RecipePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterSettingsOpen, setIsFilterSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number[]>([0, 60]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showMyRecipes, setShowMyRecipes] = useState<boolean>(true);

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
    <div className="flex flex-col w-full bg-lightBackground">
      <div className="flex flex-row w-full mb-4">
        <input
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Søg efter opskrifter..."
          className="border border-gray-300 p-2 rounded-md w-full"
        />
        <button
          onClick={() => setIsFilterSettingsOpen(!isFilterSettingsOpen)}
          className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-md transition-colors hover:bg-gray-400"
        >
          {isFilterSettingsOpen ? "Skjul Filter" : "Vis Filter"}
        </button>
      </div>

      {isFilterSettingsOpen && (
        <div className="flex md:flex-row flex-col h-fit p-2 rounded-lg bg-gray-200 w-fit items-center md:divide-x md:divide-gray-400">
          <div className="flex-1 items-center p-1">
            <CategoryWheelComponent
              categories={meatCategories}
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

      <div className="mt-4">
        {isLoading ? (
          <div>Loading recipes...</div>
        ) : error ? (
          <div className="text-red-500">Error loading recipes: {error}</div>
        ) : (
          <RecipeCardComponent recipes={filteredRecipes} />
        )}
      </div>

      <AddRecipeButtonComponent />
    </div>
  );
}
