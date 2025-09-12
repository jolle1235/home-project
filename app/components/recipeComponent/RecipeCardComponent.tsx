"use client";
import { Recipe } from "../../model/Recipe";
import { useRecipeContext } from "../../context/RecipeContext";
import ActionBtn from "../smallComponent/actionBtn";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function RecipeCardComponent({ recipes }: { recipes: Recipe[] }) {
  const { addRecipeToTempWeekPlan } = useRecipeContext();
  const router = useRouter();

  if (!recipes || recipes.length === 0) {
    return (
      <p className="text-center py-4 text-gray-500">
        Der er i øjeblikket ingen opskrifter
      </p>
    );
  }

  function handleRouter(id?: string) {
    if (id) {
      router.push(`/recipes/${id}`);
    }
  }

  return (
    <div
      id="recipes"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
    >
      {recipes.map((recipe) => {
        return (
          <div key={recipe._id} className="w-full">
            <div
              id="recipe_card"
              className="flex flex-col cursor-pointer w-full h-fit shadow-even shadow-darkBackground rounded-lg mt-3 sm:mt-5 bg-neutral-100"
            >
              <div className="relative w-full h-48 sm:h-64">
                <Image
                  src={recipe.image}
                  alt={recipe.recipeName}
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
                <ActionBtn
                  onClickF={() => handleRouter(recipe._id)}
                  Itext="Se opskrift"
                ></ActionBtn>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
