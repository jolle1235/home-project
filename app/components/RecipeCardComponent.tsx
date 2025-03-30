
"use client"
import { Recipe } from "../model/Recipe";
import { useRecipeContext } from "../context/RecipeContext";
import ActionBtn from "./smallComponent/actionBtn"
import { useRouter } from "next/navigation";
import Image from "next/image";

export function RecipeCardComponent({ recipes }: { recipes: Recipe[] }) {
  const { addRecipeToTempWeekPlan } = useRecipeContext();
  const router = useRouter();

  if (!recipes || recipes.length === 0) {
    return <p>Der er i øjeblikket ingen opskrifter</p>;
  }

  function handleRouter(id?: number) {
    if (id) {
      router.push(`/recipes/${id}`);
    }
  }

  return (
    <div id="recipes" className="flex flex-row flex-wrap space-x-4">
      {recipes.map((recipe) => {
        return (
          <div key={recipe._id}>
            <div
              id="recipe_card"
              className="flex flex-col cursor-pointer max-w-md h-fit shadow-even shadow-darkBackground rounded-lg mt-5 bg-neutral-100"
            >
              <Image
                src={recipe.image}
                alt={recipe.recipeName}
                width={270}
                height={270} 
                className="object-cover rounded-t-lg"
                priority 
              />

              <div className="flex flex-row">
                {recipe.categories.map((category) => (
                  <span
                    key={category}
                    id="recipe_categories"
                    className="bg-darkgreyBackground font-bold p-1.5 m-1 rounded-full text-xs"
                  >
                    {category}
                  </span>
                ))}
              </div>

              <div id="titel_and_price" className="flex flex-row">
                <p className="truncate max-w-64 text-darkText text-xl pl-2 font-bold">
                  {recipe.recipeName}
                </p>
              </div>
              <div id="recipe_description" className="flex flex-row justify-between p-1 mx-2">
                <div id="time" className="flex flex-row items-center">
                  <img
                    src="./icon/recipes_page/time.png"
                    alt="time"
                    className="flex size-5 mx-1"
                  ></img>
                  <p className="flex text-darkgreyText">{recipe.time}</p>
                </div>
                <div
                  id="people"
                  className="flex flex-row space-x-2 text-darkgreyText"
                >
                  <p>{recipe.recommendedPersonAmount}</p>
                  <p>personer</p>
                </div>
              </div>
              <div className="flex flex-row justify-center items-center p-1 ">
                <ActionBtn onClickF={() => addRecipeToTempWeekPlan(recipe)} Itext="Tilføj til madplan" />
                <ActionBtn onClickF={() => handleRouter(recipe._id)}
                        Itext="Se opskrift"
                      >
                      </ActionBtn>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
