"use client";
import Slider from "@mui/material/Slider";
import { useEffect, useState, useMemo } from "react";
import { AddRecipeButtonComponent } from "../components/AddRecipeButtonComponent";
import { RecipeCardComponent } from "../components/RecipeCardComponent";
import { RecipeCategoryButtonComponent } from "../components/RecipeCategoryButtonComponent";
import { Recipe } from "../model/Recipe";
import { meatCategories } from "../constant/recipeCategories";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import VisibilityToggle from "../components/smallComponent/VisibilityToggleComponent";

export default function RecipePage() {
  // Authentication
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status]);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number[]>([0, 60]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showMyRecipes, setShowMyRecipes] = useState<boolean>(true);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  const currentUser = session.user?.name || "";

  // Fetch recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const url = currentUser
          ? `/api/recipe?userName=${encodeURIComponent(currentUser)}`
          : "/api/recipe";
        const response = await fetch(url);
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
    if (currentUser) fetchRecipes();
  }, [currentUser]);

  // Memoized categories
  const categories = useMemo(() => meatCategories, []);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return recipes.filter((recipe) => {
      if (!recipe || !recipe.recipeName || !recipe.time) return false;

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
      const matchesUser = showMyRecipes || recipe.author === currentUser;

      return matchesCategory && matchesTime && matchesSearch && matchesUser;
    });
  }, [
    recipes,
    selectedCategories,
    timeRange,
    searchTerm,
    showMyRecipes,
    currentUser,
  ]);

  const timeOptions = [0, 10, 20, 30, 45, 60, 75, 90, 105, 120];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div id="recipe_page" className="flex flex-col p-1 w-full">
      <div id="recipe_top" className="flex flex-row w-full">
        <input
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Søg efter opskrifter..."
          className="border border-gray-300 p-2 rounded-md w-full"
        />
      </div>
      <div className="flex md:flex-row flex-col justify-around divide-x divide-gray-100">
        <div id="recipe_filter_categories" className="flex py-5 space-x-3 m-2">
          {categories.map((category) => (
            <RecipeCategoryButtonComponent
              key={category}
              category={category}
              onClick={handleCategoryToggle}
              isSelected={selectedCategories.includes(category)}
            >
              {category}
            </RecipeCategoryButtonComponent>
          ))}
        </div>

        <div className="flex flex-row items-center justify-around m-2">
          <label className="flex flex-col text-sm m-1">
            Min Time
            <select
              value={timeRange[0]}
              onChange={(e) => {
                const newMin = parseInt(e.target.value);
                setTimeRange([newMin, Math.max(newMin, timeRange[1])]);
              }}
              className="border border-gray-300 p-2 rounded-md"
            >
              {timeOptions.map((val) => (
                <option key={val} value={val}>
                  {val} min
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm m-1">
            Max Time
            <select
              value={timeRange[1]}
              onChange={(e) => {
                const newMax = parseInt(e.target.value);
                setTimeRange([Math.min(newMax, timeRange[0]), newMax]);
              }}
              className="border border-gray-300 p-2 rounded-md"
            >
              {timeOptions.map((val) => (
                <option key={val} value={val}>
                  {val === 120 ? "120+ min" : `${val} min`}
                </option>
              ))}
            </select>
          </label>
        </div>

        <VisibilityToggle
          booleanValue={showMyRecipes}
          setBooleanValue={setShowMyRecipes}
        />
      </div>

      <div>
        {isLoading ? (
          <div className="mt-4">Loading recipes...</div>
        ) : error ? (
          <div className="mt-4 text-red-500">
            Error loading recipes: {error}
          </div>
        ) : (
          <RecipeCardComponent recipes={filteredRecipes} />
        )}
      </div>

      <AddRecipeButtonComponent />
    </div>
  );
}
