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
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [recommendedPersonAmount, setRecommendedPersonAmount] = useState(1);
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
  }, [id]);

  const handleCheckboxChange = (index: number) => {
    setCheckedItems((prev) => {
      const newChecked = [...prev];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
  };

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
        <div className="flex flex-col items-center justify-center md:h-1/2  w-full">
          <img
            className="w-full m-2 max-h-60 object-cover rounded-lg"
            src={recipe?.image}
            alt={recipe?.recipeName}
          />
          <div className="flex flex-col items-center bg-lightgreyBackground rounded-lg p-2 mb-1 w-full">
            <h2 className="text-2xl font-bold text-center">
              {recipe?.recipeName}
            </h2>
          </div>
          <div className="flex flex-row w-full justify-around">
            <div className="flex items-center mt-1">
              <img
                src="/icon/recipes_page/time.png"
                alt="Time"
                className="h-6 mr-1"
              />
              <span className="text-lg">{recipe?.time} min</span>
            </div>
            <div
              id="portion_div"
              className="flex flex-row w-fit h-fit justify-center items-center py-1 px-4 m-2 bg-lightgreyBackground space-x-2 rounded-full"
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
                className="flex justify-center items-center p-1 w-6 bg-cancel rounded-lg"
              >
                <img
                  className="w-full"
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
                    value > maxRecipePersons ? maxRecipePersons : value > 0 ? value : 1
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
            {recipe?.Items.map((Item, index) => {
              // Calculate adjusted weight
              const scalingFactor =
                recommendedPersonAmount / recipe.recommendedPersonAmount;
              const adjustedWeight = Item.weight * scalingFactor;

              return (
                <div
                  key={index}
                  className="flex flex-row w-full h-fit justify-between items-center p-2 border-b border-darkgreyBackground"
                >
                  <div className="flex justify-start basis-1/4 flex-grow">
                    <p className="text-lg font-bold">{Item.name}</p>
                  </div>
                  <p className="flex justify-center items-center h-fit w-3/12 text-lg py-2 px-3 mx-2 bg-lightgreyBackground rounded-full">
                    {adjustedWeight.toFixed(1)} {Item.unit}
                  </p>
                  <input
                    className="w-6 h-6"
                    type="checkbox"
                    checked={checkedItems[index]}
                    onChange={() => handleCheckboxChange(index)}
                  />
                </div>
              );
            })}
          </div>
          {/* Portion and Action Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-center border-darkgreyBackground mt-3">
            <div className="flex items-center mb-3 md:mb-0">
              
            </div>
            <button
              className="flex h-10 p-2 justify-center items-center bg-action hover:bg-actionHover text-darkText font-bold rounded-lg w-full md:w-auto"
            >
              Tilføj til din indkøbsliste
            </button>
          </div>
        </div>
      </div>
      {/* Right column (Description) */}
      <div className="flex flex-col md:w-1/2 w-full h-fit min-h-80 m-2 p-3">
        <h2 className="font-bold text-center mb-3">Beskrivelse</h2>
        <div className="flex-1 rounded-lg p-5 bg-lightgreyBackground overflow-y-auto">
          <p>{recipe?.description}</p>
        </div>
      </div>
    </div>
  );
}
