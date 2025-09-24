import { Ingredient } from "../model/Ingredient";
import { RemoveButton } from "./smallComponent/removeBtn";

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
                <RemoveButton
                  onClickF={() => {
                    onRemove(index);
                  }}
                />
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
