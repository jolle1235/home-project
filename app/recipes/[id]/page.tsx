"use client"
import { useEffect, useState } from "react";
import { Recipe } from "../../model/Recipe";
import { maxRecipePersons } from "../../utils/validationVariables";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";

export function RecipeDetailsPage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>([]);
  const [recommendedPersonAmount, setRecommendedPersonAmount] = useState(0);
  const { id } = useParams(); 
  const router = useRouter();


  // Fetch recipes
  useEffect(() => {
    const fetchRecipe = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/recipe/${id}`);
        if (!response.ok) throw new Error("Failed to fetch recipes");
        const data = await response.json();
        setRecipe(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipe();
  }, []);



  const handleCheckboxChange = (index: number) => {
    setCheckedIngredients((prev) => {
      const newChecked = [...prev];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
  };



  


  return (
    <div className="w-full h-full flex flex-row overflow-x-hidden">
      <div className="flex flex-col w-1/3 h-full p-3 justify-center items-center">
        <div className="flex flex-col w-full justify-start items-start">
          <button
            className="relative top-0 left-0 size-14"
            onClick={() => router.back}
          >
            <img src="/icon/back_arrow.png" alt="" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-1/2 p-2">
          <img
            className="w-full m-2 max-h-60"
            src={recipe?.image}
            alt={recipe?.recipeName}
          />
          <div className="flex flex-col items-center bg-lightgreyBackground rounded-full p-2 mb-5 w-full">
            <h2 className="text-2xl font-bold text-center">
              {recipe?.recipeName}
            </h2>
            <div className="flex flex-row space-x-10">
              <div className="flex items-center mt-1">
                <img
                  src="/icon/recipes_page/time.png"
                  alt="Time"
                  className="h-6 mr-1"
                />
                <span className="text-lg">{recipe?.time} min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-3/12 h-full p-3 justify-start items-center">
        <div className="flex w-full h-full rounded-lg p-5 bg-lightgreyBackground">
          <div>
            <h2 className="font-bold mb-2">Beskrivelse</h2>
            <p>{recipe?.description}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-5/12 h-full p-3 justify-between items-start pr-10">
        <div
          id="recipe_ingredients"
          className="flex flex-col w-full h-full justify-between border-t border-darkgreyBackground"
        >
          <div className="flex flex-col w-full h-fit justify-start items-start">
            {recipe?.ingredients.map((ingredient, index) => {
              // Calculate adjusted weight
              const scalingFactor =
                recommendedPersonAmount / recipe.recommendedPersonAmount;
              const adjustedWeight = ingredient.weight * scalingFactor;

              return (
                <div
                  key={index}
                  className="flex flex-row w-full h-fit justify-between items-center p-2 border-b border-darkgreyBackground"
                >
                  <div className="flex justify-start basis-1/4 flex-grow">
                    <p className="text-lg font-bold">{ingredient.name}</p>
                  </div>
                  <p className="flex justify-center items-center h-fit w-3/12 text-lg py-2 px-3 mx-2 bg-lightgreyBackground rounded-full">
                    {adjustedWeight.toFixed(1)} {ingredient.unit}
                  </p>
                  <input
                    className="size-7"
                    type="checkbox"
                    checked={checkedIngredients[index]} // Controlled checkbox state
                    onChange={() => handleCheckboxChange(index)} // Handle checkbox change
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center border-t border-darkgreyBackground">
            <div className="flex items-center">
              <div
                id="portion_div"
                className="flex flex-row w-fit h-fit justify-center items-center py-1 px-6 m-2 bg-lightgreyBackground space-x-2 rounded-full"
              >
                <img
                  src="/icon/recipes_page/person.png"
                  className="flex justify-center items-center h-8"
                  alt=""
                />
                <button
                  onClick={() =>
                    setRecommendedPersonAmount((prev) => Math.max(prev - 1, 1))
                  }
                  className="flex justify-center items-center p-1 w-6 bg-cancel rounded-lg"
                >
                  <img
                    className="flex justify-center items-center w-full"
                    src="/icon/substract_sign.png"
                    alt="subtract"
                  />
                </button>
                <input
                  className="w-10 h-full rounded-lg text-center m-0"
                  type="number"
                  value={recommendedPersonAmount}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setRecommendedPersonAmount(
                      value > maxRecipePersons
                        ? maxRecipePersons
                        : value > 0
                        ? value
                        : 1
                    );
                  }}
                />
                <button
                  onClick={() =>
                    setRecommendedPersonAmount((prev) =>
                      prev < maxRecipePersons ? prev + 1 : prev
                    )
                  }
                  className="flex justify-center items-center w-6 p-1 text-lg bg-action rounded-lg"
                >
                  <img
                    className="flex justify-center items-center w-full"
                    src="/icon/add_sign.png"
                    alt="add"
                  />
                </button>
              </div>
            </div>
            <button
              className="flex h-10 p-2 justify-center items-center bg-action hover:bg-actionHover text-darkText font-bold rounded-lg"
            >
              Tilføj til din indkøbsliste
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
