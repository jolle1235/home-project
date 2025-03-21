"use client"
import Slider from "@mui/material/Slider";
import { useEffect, useState } from "react";
import { AddRecipeButtonComponent } from "../components/AddRecipeButtonComponent";
import { RecipeCardComponent } from "../components/RecipeCardComponent";
import { RecipeCategoryButtonComponent } from "../components/RecipeCategoryButtonComponent";
import { Recipe } from "../model/Recipe";
import { meatCategories } from "../constant/recipeCategories";

export default function RecipePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number[]>([0, 60]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories] = useState(meatCategories);

  // Fetch recipes
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

  // Filter recipes
  useEffect(() => {
    const updateFilteredRecipes = () => {
      const filtered = recipes.filter((recipe) => {
        if (!recipe) return false;

        const matchesCategories =
          selectedCategories.length === 0 ||
          selectedCategories.some((category) =>
            recipe.categories?.includes(category)
          );

        let matchesTimeRange = recipe.time
          ? recipe.time >= timeRange[0]
          : false;

        if (timeRange[1] === 60) {
          matchesTimeRange =
            matchesTimeRange || (recipe.time ? recipe.time > 60 : false);
        } else {
          matchesTimeRange =
            matchesTimeRange &&
            (recipe.time ? recipe.time <= timeRange[1] : false);
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const matchesName = recipe.recipeName
          ? recipe.recipeName.toLowerCase().includes(lowerCaseSearchTerm)
          : false;

        return matchesCategories && matchesTimeRange && matchesName;
      });
      setFilteredRecipes(filtered);
    };
    updateFilteredRecipes();
  }, [recipes, selectedCategories, timeRange, searchTerm]);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setTimeRange(newValue as number[]);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(category)
        ? prevSelected.filter((c) => c !== category)
        : [...prevSelected, category]
    );
  };

  const TimeValueFormat = (value: number) => {
    return value >= 60 ? "60+" : value;
  };

  return (
    <div id="recipe_page" className="flex flex-col p-10 w-full">
      <div id="recipe_top" className="flex flex-row w-full">
        <div id="recipe_searchfield" className="flex">
          <input
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Søg efter opskrifter..."
            className="border border-gray-300 p-2 rounded-md"
          />
        </div>
      </div>

      <div id="recipe_filter_categories" className="flex pt-5 pb-5 space-x-3">
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
      <div className="">
        <div className="ms-2 flex flex-row space-x-3 justify-center items-center w-96 px-2">
          <Slider
            getAriaLabel={() => "time"}
            value={timeRange}
            onChange={handleSliderChange}
            valueLabelDisplay="off"
            valueLabelFormat={TimeValueFormat}
            min={0}
            max={120}
            step={15}
            />
          <img
            src="./icon/recipes_page/time.png"
            alt="time_filter"
            className="size-6"
            />
        </div>

        <div className="flex justify-between w-96">
          <span> 0:00 |</span>
          <span> 0:15 |</span>
          <span> 0:30 |</span>
          <span> 0:45 |</span>
          <span> 1:00 |</span>
          <span> 1:15 |</span>
          <span> 1:30 |</span>
          <span> 1:45 |</span>
          <span> 2:00+ |</span>
        </div>
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
