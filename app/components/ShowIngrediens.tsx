import { Ingredient } from "../model/Ingredient";

interface IngredientsListProps {
  ingredients: Ingredient[];
  onRemove: (index: number) => void; // optional -> only shows delete if provided
}

export function IngredientsList({
  ingredients,
  onRemove,
}: IngredientsListProps) {
  return (
    <div>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Ingredienser
      </label>
      <div className="mb-4">
        {ingredients.length > 0 ? (
          <div className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{ingredient.item.name}</span>
                  <span className="text-gray-500">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onRemove(index);
                  }}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            Ingen ingredienser tilføjet endnu
          </p>
        )}
      </div>
    </div>
  );
}
