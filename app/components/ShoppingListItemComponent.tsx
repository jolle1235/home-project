"use client"
import { useShoppingListContext } from "../context/ShoppinglistContext";
import { Ingredient } from "../model/Ingredient";

export function ShoppingListItemComponent({ ingredient }: { ingredient: Ingredient }) {
  

  const {updateIngredientQuantity, toggleMarkedIngredient } = useShoppingListContext();

  return (
    <div
      id="shopping_list_item"
      className="flex flex-row w-full h-fit items-center px-3 p-2 border-b border-lightgreyBackground"
    >
      <input
        type="checkbox"
        checked={ingredient.marked}
        className="w-8 h-8 mr-5"
        onChange={() => toggleMarkedIngredient(ingredient._id)}
      />
      <div className="flex basis-1/4 flex-grow flex-col min-w-1/6">
        <p className="font-bold text-xl">
          {ingredient.item.name || "Unnamed Item"}
        </p>
        <div className="flex flex-row w-fit">
          <input
            className="text-lightgreytxt p-1 mx-2 rounded-lg w-14 h-fit border border-lightgreyBackground"
            value={ingredient.quantity}
            onChange={(e) => {
              updateIngredientQuantity(ingredient._id ,Number(e.target.value));
            }}
          />
          <p className="text-lightgreytxt flex-grow">
            {ingredient.unit}
          </p>
        </div>
      </div>
      <p className="pr-5 w-fit text-xl">Butik</p> 

    </div>
  );
}
