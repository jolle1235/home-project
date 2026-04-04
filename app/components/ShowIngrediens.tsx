import { Ingredient } from "../model/Ingredient";
import Button from "./smallComponent/Button";
import { Trash2 } from "lucide-react";

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
    {} as Record<string, Array<{ ingredient: Ingredient; index: number }>>,
  );

  // Get sections in order: first unsectioned (none), then sections
  const sections = [
    ...(groupedIngredients["none"] ? ["none"] : []),
    ...Object.keys(groupedIngredients).filter((s) => s !== "none"),
  ];

  return (
    <div className="h-full">
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
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">
                          {ingredient.item.name}
                        </span>
                        <span className="text-gray-500">
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Fjern ingrediens: ${ingredient.item.name}`}
                        onClick={() => onRemove(index)}
                        className="min-h-[44px] min-w-[44px] px-3 text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
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
