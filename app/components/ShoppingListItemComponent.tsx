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
      className="flex flex-row flex-wrap w-full h-fit items-center gap-4 p-2 bg-soft rounded-lg"
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
        <div className="flex flex-row items-center flex-wrap gap-1 mt-1">
          <input
            type="number"
            min={0}
            step={0.1}
            className="text-muted-foreground p-0.5 rounded-lg w-10 sm:w-14 h-fit border border-lightgreyBackground text-sm sm:text-base"
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
      <div className="grid grid-cols-4 w-6/12">
        {/* Store */}
        <select
          className="text-sm sm:text-base col-span-3 p-1 rounded-lg bg-background mr-1"
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

        {/* Price */}
        <input
          type="number"
          min={0}
          step={1}
          placeholder="Pris"
          className="text-muted-foreground p-1 rounded-lg text-sm sm:text-base"
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

        {/* Notes (full width row) */}
        <input
          className="col-span-4 text-muted-foreground p-1 rounded-lg text-sm sm:text-base bg-background mt-1"
          placeholder="Noter..."
          value={ingredient.notes ?? ""}
        />
      </div>
    </div>
  );
}
