"use client"
import { useEffect, useState } from "react";
import { Recipe } from "../../model/Recipe";
import { maxRecipePersons } from "../../utils/validationVariables";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function RecipeDetailsPage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedPersonAmount, setRecommendedPersonAmount] = useState(1);
  const params = useParams();
  const router = useRouter();

  // Fetch recipes
  useEffect(() => {
    const fetchRecipe = async () => {
      // Ensure we have a valid ID
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      console.log(id)
      
      if (!id) {
        setError("No recipe ID provided");
        console.log("ERROR fetch recipe id")
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log(`Fetching recipe with ID: ${id}`);
        const response = await fetch(`/api/recipe/${id}`); // Note: changed to plural
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch recipe: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Fetched recipe data:', data);
        setRecipe(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [params.id]);


  useEffect(() => {
    if (recipe?.recommendedPersonAmount) {
      setRecommendedPersonAmount(recipe.recommendedPersonAmount);
    }
  }, [recipe]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-x-hidden">
      {/* Left column (Recipe details) */}
      <div className="flex flex-col md:w-1/2 w-full h-auto md:h-full p-3 justify-center items-center">
        {/* Image & Title */}
        <div className="flex flex-col items-center justify-center md:h-1/2  w-full m-2">
          <img
            className="w-full max-h-60 object-cover rounded-lg"
            src={recipe?.image}
            alt={recipe?.recipeName}
          />
          <div className="flex flex-col items-center bg-lightgreyBackground rounded-lg p-2 mb-1 w-full">
            <h2 className="text-2xl font-bold text-center">
              {recipe?.recipeName}
            </h2>
          </div>
          <div className="flex flex-row w-full justify-around">
            <div className="flex flex-row w-fit justify-center items-center py-1 px-4 m-2 bg-lightgreyBackground h-12 rounded-full">
              <img
                src="/icon/recipes_page/time.png"
                alt="Time"
                className="h-6 mr-1"
              />
              <span className="text-lg">{recipe?.time} min</span>
            </div>
            <div
              id="portion_div"
              className="flex flex-row w-fit h-12 justify-center items-center py-1 px-4 m-2 bg-lightgreyBackground space-x-2 rounded-full"
            >
              <img
                src="/icon/recipes_page/person.png"
                className="h-8"
                alt="Person icon"
              />
              <button
                onClick={() =>
                  setRecommendedPersonAmount((prev) => Math.max(prev - 1, 1))
                }
                className="flex justify-center items-center p-1 w-7 bg-cancel rounded-lg"
              >
                <img
                  className="w-full"
                  src="/icon/substract_sign.png"
                  alt="subtract"
                />
              </button>
              <p className="flex w-8 h-8 rounded-lg items-center justify-center m-0 bg-white">
                  {recommendedPersonAmount}
              </p>
              <button
                onClick={() =>
                  setRecommendedPersonAmount((prev) =>
                    prev < maxRecipePersons ? prev + 1 : prev
                  )
                }
                className="flex justify-center items-center w-7 p-1 text-lg bg-action rounded-lg"
              >
                <img
                  className="w-full"
                  src="/icon/add_sign.png"
                  alt="add"
                />
              </button>
            </div>
          </div>
        </div>
        {/* Items */}
        <div
          id="recipe_Items"
          className="flex flex-col w-full h-auto md:h-full justify-between border-t border-darkgreyBackground"
        >
          <div className="flex flex-col w-full h-fit justify-start items-start">
            {recipe?.ingredients.map((ingredient, index) => {
              // Calculate adjusted weight
              const scalingFactor =
                recommendedPersonAmount / recipe.recommendedPersonAmount;
              const adjustedWeight = ingredient.quantity * scalingFactor;

              console.log("scalingFactor", scalingFactor)
              console.log("adjustedWeight", adjustedWeight)

              return (
                <div
                  key={index}
                  className="flex flex-row w-full h-fit justify-between items-center p-2 border-b border-darkgreyBackground"
                >
                  <input
                    className="w-6 h-6 mr-4"
                    type="checkbox"
                  />
                  <div className="flex justify-start basis-1/4 flex-grow">
                    <p className="text-lg font-bold">{ingredient.item.name}</p>
                  </div>
                  <p className="flex justify-center items-center h-fit w-fit text-lg py-2 px-3 mx-2 bg-lightgreyBackground rounded-full">
                    {adjustedWeight.toFixed(1)} {ingredient.unit}
                  </p>
                  
                </div>
              );
            })}
          </div>
          {/* Portion and Action Buttons */}
          {/* <div className="flex flex-col md:flex-row justify-between items-center border-darkgreyBackground mt-3">
            <div className="flex items-center mb-3 md:mb-0">
              
            </div>
            <button
              className="flex h-10 p-2 justify-center items-center bg-action hover:bg-actionHover text-darkText font-bold rounded-lg w-full md:w-auto"
            >
              Tilføj til din indkøbsliste
            </button>
          </div> */}
        </div>
      </div>
      {/* Right column (Description) */}
      <div className="flex flex-col md:w-1/2 w-full h-fit min-h-80 p-3">
        {/* <h2 className="font-bold text-center mb-3">Beskrivelse</h2> */}
        <div className="flex-1 rounded-lg p-5 bg-lightgreyBackground overflow-y-auto">
          <p className="whitespace-pre-line">{recipe?.description}</p>
        </div>
      </div>

    </div>
  );
}
