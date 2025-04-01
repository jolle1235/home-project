"use client"
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
    if (status !== "loading" && !session) {
      router.push("/signin");
    }
  }, [status, session, router]);
  //----------------------------------//

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number[]>([0, 60]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories] = useState(meatCategories);
  const [showMyRecipes, setShowMyRecipes] = useState<boolean>(true)

  if (status === "loading") {
    return <p>Loading...</p>; // Keeps the hook order intact
  }

  if (!session) {
    return null; // Component will still render hooks
  }

  const currentUser = session.user.name;


  // Fetch recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const userName = session?.user?.name; // Adjust this based on how you store the user data
        const url = userName ? `/api/recipe?userName=${encodeURIComponent(userName)}` : "/api/recipe";
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch recipes");
        const data = await response.json();
        setRecipes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();    
  }, [session?.user?.name]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
    return recipes.filter((recipe) => {
      if (!recipe || !recipe.recipeName || !recipe.time) return false;
      
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((category) => recipe.categories?.includes(category));
  
      const matchesTime =
        recipe.time >= timeRange[0] &&
        (timeRange[1] === 60 ? true : recipe.time <= timeRange[1]);
  
      const matchesSearch = recipe.recipeName.toLowerCase().includes(lowerCaseSearchTerm);
      const matchesUser = showMyRecipes || recipe.author === currentUser;
  
      return matchesCategory && matchesTime && matchesSearch && matchesUser;
    });
  }, [recipes, selectedCategories, timeRange, searchTerm, showMyRecipes, currentUser]);
  
  
  

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
    return value >= 120 ? "120+" : value;
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
      <div className="p-2">
  <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 w-full px-2">
    <Slider
      getAriaLabel={() => "time"}
      value={timeRange}
      onChange={handleSliderChange}
      valueLabelDisplay="off"
      valueLabelFormat={TimeValueFormat}
      min={0}
      max={120}
      step={15}
      className="w-full"
    />
    {/* <Image
      src="/icon/recipes_page/time.png"
      alt="time_filter"
      width={24}
      height={24}
      className="flex-shrink-0"
    /> */}
  </div>

  <div className="flex flex-wrap justify-between w-full text-xs sm:text-sm">
    <span>00</span>
    <span>15</span>
    <span>30</span>
    <span>45</span>
    <span>60</span>
    <span>75</span>
    <span>90</span>
    <span>105</span>
    <span>120+</span>
  </div>
</div>

      <div>

      </div>
        <VisibilityToggle
          booleanValue={showMyRecipes}
          setBooleanValue={setShowMyRecipes}
        ></VisibilityToggle>
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
