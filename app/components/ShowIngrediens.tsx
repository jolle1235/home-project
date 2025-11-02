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
  // Group ingredients by section
  const groupedIngredients = ingredients.reduce(
    (acc, ingredient, index) => {
      const section = ingredient.section || "none";
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push({ ingredient, index });
      return acc;
    },
    {} as Record<string, Array<{ ingredient: Ingredient; index: number }>>
  );

  // Get sections in order: first unsectioned (none), then sections
  const sections = [
    ...(groupedIngredients["none"] ? ["none"] : []),
    ...Object.keys(groupedIngredients).filter((s) => s !== "none"),
  ];

  return (
    <div>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Ingredienser
      </label>
      <div className="mb-4">
        {ingredients.length > 0 ? (
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section} className="space-y-2">
                {section !== "none" && (
                  <h3 className="text-lg font-bold text-gray-800 mb-2 pt-2 border-t border-gray-300 first:border-t-0 first:pt-0">
                    {section}
                  </h3>
                )}
                <div className="space-y-2">
                  {groupedIngredients[section].map(({ ingredient, index }) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">
                          {ingredient.item.name}
                        </span>
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
