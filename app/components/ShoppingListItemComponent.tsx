"use client";
import { useShoppingListContext } from "../context/ShoppinglistContext";
import { Ingredient } from "../model/Ingredient";
import { shoppingStores } from "../constant/shoppingStores";

export function ShoppingListItemComponent({
  ingredient,
}: {
  ingredient: Ingredient;
}) {
  const {
    updateIngredientQuantity,
    updateIngredientCenter,
    updateIngredientPrice,
    toggleMarkedIngredient,
    removeIngredient,
  } = useShoppingListContext();

  const quantityValue =
    ingredient.quantity === undefined ||
    ingredient.quantity === null ||
    ingredient.quantity === 0
      ? ""
      : ingredient.quantity;
  const unit = ingredient.unit || "stk";

  return (
    <div
      id="shopping_list_item"
      className="flex flex-row flex-wrap w-full h-fit items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 border-b border-lightgreyBackground"
    >
      <input
        type="checkbox"
        checked={ingredient.marked}
        className="w-6 h-6 sm:w-8 sm:h-8 shrink-0"
        onChange={() => toggleMarkedIngredient(ingredient._id)}
      />
      <div className="flex flex-grow flex-col min-w-0 flex-1">
        <p className="font-bold text-base sm:text-lg md:text-xl truncate">
          {ingredient.item.name || "Unnamed Item"}
        </p>
        <div className="flex flex-row items-center flex-wrap gap-1">
          <input
            type="number"
            min={0}
            step={0.1}
            className="text-lightgreytxt p-1 rounded-lg w-10 sm:w-14 h-fit border border-lightgreyBackground text-sm sm:text-base"
            value={quantityValue}
            onChange={(e) => {
              const str = e.target.value;
              if (str === "") {
                updateIngredientQuantity(ingredient._id, 0);
                return;
              }
              const val = parseFloat(str);
              if (!Number.isNaN(val)) {
                updateIngredientQuantity(ingredient._id, val);
              }
            }}
          />
          <p className="text-lightgreytxt text-sm sm:text-base">{unit}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <select
          className="text-sm sm:text-base p-1 rounded-lg border border-lightgreyBackground bg-white min-w-[80px]"
          value={ingredient.center ?? ""}
          onChange={(e) =>
            updateIngredientCenter(ingredient._id, e.target.value)
          }
        >
          <option value="">Vælg butik</option>
          {shoppingStores.map((store) => (
            <option key={store} value={store}>
              {store}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          step={0.01}
          placeholder="Pris"
          className="text-lightgreytxt p-1 rounded-lg w-14 sm:w-16 h-fit border border-lightgreyBackground text-sm sm:text-base"
          value={
            ingredient.price === undefined ||
            ingredient.price === null ||
            ingredient.price === 0
              ? ""
              : ingredient.price
          }
          onChange={(e) => {
            const str = e.target.value;
            if (str === "") {
              updateIngredientPrice(ingredient._id, 0);
              return;
            }
            const val = parseFloat(str);
            if (!Number.isNaN(val)) {
              updateIngredientPrice(ingredient._id, val);
            }
          }}
        />
      </div>
      <button
        type="button"
        onClick={() => removeIngredient(ingredient._id)}
        className="p-1 rounded hover:bg-gray-200 transition-colors shrink-0"
        aria-label="Fjern"
      >
        <img
          src="/icon/remove_button.png"
          alt="Fjern"
          className="w-5 h-5 sm:w-6 sm:h-6"
        />
      </button>
    </div>
  );
}
