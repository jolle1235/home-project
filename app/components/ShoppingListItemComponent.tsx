"use client"
import { useShoppingListContext } from "../context/ShoppinglistContext";
import { Ingredient } from "../model/Ingredient";

export function ShoppingListItemComponent({ ingredient }: { ingredient: Ingredient }) {
  const {updateIngredientQuantity, toggleMarkedIngredient } = useShoppingListContext();

  return (
    <div
      id="shopping_list_item"
      className="flex flex-row w-full h-fit items-center px-2 sm:px-3 py-2 border-b border-lightgreyBackground"
    >
      <input
        type="checkbox"
        checked={ingredient.marked}
        className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-5"
        onChange={() => toggleMarkedIngredient(ingredient._id)}
      />
      <div className="flex flex-grow flex-col min-w-0">
        <p className="font-bold text-base sm:text-lg md:text-xl truncate">
          {ingredient.item.name || "Unnamed Item"}
        </p>
        <div className="flex flex-row items-center">
          <input
            className="text-lightgreytxt p-1 mx-1 sm:mx-2 rounded-lg w-10 sm:w-14 h-fit border border-lightgreyBackground text-sm sm:text-base"
            value={ingredient.quantity}
            onChange={(e) => {
              updateIngredientQuantity(ingredient._id ,Number(e.target.value));
            }}
          />
          <p className="text-lightgreytxt text-sm sm:text-base">
            {ingredient.unit}
          </p>
        </div>
      </div>
      <p className="pr-2 sm:pr-5 text-sm sm:text-base md:text-xl">Butik</p> 
    </div>
  );
}
