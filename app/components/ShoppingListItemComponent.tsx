"use client";
import { useRef, useEffect } from "react";
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
    updateIngredientNotes,
    removeIngredient,
    saveList,
    shoppingList,
  } = useShoppingListContext();

  const quantityValue =
    ingredient.quantity === undefined ||
    ingredient.quantity === null ||
    ingredient.quantity === 0
      ? ""
      : ingredient.quantity;
  const unit = ingredient.unit || "stk";

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shoppingListRef = useRef(shoppingList);

  useEffect(() => {
    shoppingListRef.current = shoppingList;
  }, [shoppingList]);

  const debouncedSave = () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveList(shoppingListRef.current);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  return (
    <div
      id="shopping_list_item"
      className="flex flex-row flex-wrap w-full h-fit items-center gap-2 p-1.5 bg-soft rounded-lg"
    >
      <input
        type="checkbox"
        checked={ingredient.marked}
        className="w-5 h-5 sm:w-7 sm:h-7 shrink-0 m-0"
        onChange={() => {
          toggleMarkedIngredient(ingredient._id);
          debouncedSave();
        }}
      />
      <div className="flex flex-grow flex-col min-w-0 flex-1">
        <p className="font-bold text-base sm:text-lg md:text-lg truncate">
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
                debouncedSave();
                return;
              }
              const val = parseFloat(str);
              if (!Number.isNaN(val)) {
                updateIngredientQuantity(ingredient._id, val);
                debouncedSave();
              }
            }}
          />
          {!(ingredient.quantity === 1 && unit === "stk") && (
            <p className="text-muted-foreground text-sm sm:text-base">{unit}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-6 w-6/12">
        {/* Store */}
        <select
          className="text-sm sm:text-base col-span-4 p-1 rounded-lg bg-background mr-1"
          value={ingredient.center ?? ""}
          onChange={(e) => {
            updateIngredientCenter(ingredient._id, e.target.value);
            debouncedSave();
          }}
        >
          <option value="">Vælg butik</option>
          {shoppingStores.map((store) => (
            <option key={store} value={store}>
              {store}
            </option>
          ))}
        </select>

        {/* Price */}
        <div className="flex flex-row items-center gap-1 min-w-0 col-span-2">
          <input
            type="number"
            min={0}
            step={1}
            placeholder="Pris"
            className="w-full min-w-0 text-muted-foreground p-0.5 rounded-lg text-sm sm:text-base"
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
                debouncedSave();
                return;
              }
              const val = parseFloat(str);
              if (!Number.isNaN(val)) {
                updateIngredientPrice(ingredient._id, val);
                debouncedSave();
              }
            }}
          />
          <p>kr</p>
        </div>
        {/* Notes (full width row) */}
        <input
          className="col-span-6 text-muted-foreground p-1 rounded-lg text-sm sm:text-base bg-background mt-1"
          placeholder="Noter..."
          value={ingredient.notes ?? ""}
          onChange={(e) => {
            updateIngredientNotes(ingredient._id, e.target.value);
            debouncedSave();
          }}
        />
      </div>
    </div>
  );
}
