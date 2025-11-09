"use client";
import { Recipe } from "../../model/Recipe";
import { useRecipeContext } from "../../context/RecipeContext";
import ActionBtn from "../smallComponent/actionBtn";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

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
              <div className="flex flex-row justify-center items-center p-1 sm:p-2 gap-1 sm:gap-2">
                <ActionBtn
                  onClickF={() => addRecipeToTempWeekPlan(recipe)}
                  Itext="Tilføj til madplan"
                />
                <button
                  onClick={() => handleRouter(recipe._id)}
                  disabled={loadingRecipeId === recipe._id}
                  className={`flex justify-center items-center text-base sm:text-lg bg-action hover:bg-secondaryHover active:scale-95 active:opacity-80 transition-all duration-150 cursor-pointer transform hover:scale-105 py-1 px-2 m-1 rounded-lg min-h-[36px] sm:min-h-[40px] disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {loadingRecipeId === recipe._id ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-darkText"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Indlæser...</span>
                    </div>
                  ) : (
                    "Se opskrift"
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
