"use client";
import { useEffect, useState, useMemo } from "react";
import { AddRecipeButtonComponent } from "../components/AddRecipeButtonComponent";
import { RecipeCardComponent } from "../components/RecipeCardComponent";
import { CategoryWheelComponent } from "../components/CategoryWheelComponent";
import { TimeRangeSelectorComponent } from "../components/TimeRangeSelectorComponent";
import VisibilityToggle from "../components/smallComponent/VisibilityToggleComponent";
import { Recipe } from "../model/Recipe";
import { meatCategories } from "../constant/recipeCategories";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RecipePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterSettingsOpen, setIsFilterSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number[]>([0, 60]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showMyRecipes, setShowMyRecipes] = useState<boolean>(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!session?.user?.name) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/recipe?userName=${encodeURIComponent(session.user.name)}`
        );
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
  }, [session?.user?.name]);

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
      const matchesUser =
        showMyRecipes || recipe.author === session?.user?.name;

      return matchesCategory && matchesTime && matchesSearch && matchesUser;
    });
  }, [
    recipes,
    selectedCategories,
    timeRange,
    searchTerm,
    showMyRecipes,
    session?.user?.name,
  ]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col p-1 w-full">
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
          <div className="flex-1 flex justify-center p-1 h-full">
            <VisibilityToggle
              booleanValue={showMyRecipes}
              setBooleanValue={setShowMyRecipes}
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
