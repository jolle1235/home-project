"use client";
import { Recipe } from "../../model/Recipe";
import { useRecipeContext } from "../../context/RecipeContext";
import ActionBtn from "../smallComponent/actionBtn";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { CalendarPlus, Eye } from "lucide-react";
import { IconButton } from "../IconButton";

export function RecipeCardComponent({ recipes }: { recipes: Recipe[] }) {
  const { addRecipeToTempWeekPlan } = useRecipeContext();
  const router = useRouter();
  const [loadingRecipeId, setLoadingRecipeId] = useState<string | null>(null);

  if (!recipes || recipes.length === 0) {
    return (
      <p className="text-center py-4 text-gray-500">
        Der er i øjeblikket ingen opskrifter
      </p>
    );
  }

  async function handleRouter(id?: string) {
    if (id) {
      setLoadingRecipeId(id);
      try {
        router.push(`/recipes/${id}`);
      } catch (error) {
        console.error("Navigation error:", error);
      } finally {
        // Reset loading state after a short delay to show the loader
        setTimeout(() => setLoadingRecipeId(null), 500);
      }
    }
  }

  return (
    <div
      id="recipes"
      className="grid grid-cols-1 sm:grid-cols-2 lg:flex flex-wrap lg:justify-center gap-4"
    >
      {recipes.map((recipe) => {
        return (
          <div key={recipe._id} className="w-full lg:max-w-sm">
            <div
              id="recipe_card"
              className="flex flex-col cursor-pointer w-full h-fit shadow-even shadow-darkBackground rounded-lg mt-3 sm:mt-5 bg-neutral-100"
            >
              <div className="relative w-full h-48 sm:h-52 lg:h-56">
                <Image
                  src={
                    recipe.image && recipe.image.trim() !== ""
                      ? recipe.image
                      : "/icon/swiftcart_logo.png"
                  }
                  alt={recipe.recipeName || "Opskrift"}
                  fill
                  className="object-cover rounded-t-lg"
                  priority
                />
              </div>

              <div className="flex flex-row flex-wrap">
                {recipe.categories.map((category) => (
                  <span
                    key={category}
                    id="recipe_categories"
                    className="bg-darkgreyBackground font-bold p-1 sm:p-1.5 m-1 rounded-full text-xs"
                  >
                    {category}
                  </span>
                ))}
              </div>

              <div id="titel_and_price" className="flex flex-row">
                <p className="truncate w-full text-darkText text-lg sm:text-xl pl-2 font-bold">
                  {recipe.recipeName}
                </p>
              </div>
              <div
                id="recipe_description"
                className="flex flex-row justify-between p-1 mx-2"
              >
                <div id="time" className="flex flex-row items-center">
                  <img
                    src="./icon/recipes_page/time.png"
                    alt="time"
                    className="flex size-4 sm:size-5 mx-1"
                  ></img>
                  <p className="flex text-darkgreyText text-sm sm:text-base">
                    {recipe.time}
                  </p>
                </div>
                <div
                  id="people"
                  className="flex flex-row space-x-1 sm:space-x-2 text-darkgreyText text-sm sm:text-base"
                >
                  <p>{recipe.recommendedPersonAmount}</p>
                  <p>personer</p>
                </div>
              </div>
              <div className="flex flex-row justify-center items-center p-1 sm:p-2 gap-3">
                <div className="flex items-center gap-1 group">
                  <IconButton
                    icon={CalendarPlus}
                    variant="primary"
                    ariaLabel="Tilføj til madplan"
                    onClick={() => addRecipeToTempWeekPlan(recipe)}
                  />
                  <span className="hidden md:inline-flex text-xs text-darkText opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                    Tilføj til madplan
                  </span>
                </div>
                <div className="flex items-center gap-1 group">
                  <IconButton
                    icon={Eye}
                    variant="secondary"
                    ariaLabel={
                      loadingRecipeId === recipe._id
                        ? "Indlæser opskrift"
                        : "Se opskrift"
                    }
                    onClick={() => handleRouter(recipe._id)}
                    disabled={loadingRecipeId === recipe._id}
                  />
                  <span className="hidden md:inline-flex text-xs text-darkText opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                    {loadingRecipeId === recipe._id
                      ? "Indlæser..."
                      : "Se opskrift"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
