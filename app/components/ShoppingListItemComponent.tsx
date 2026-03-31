"use client";

import { useRef } from "react";
import { useShoppingList } from "../hooks/useShoppinglist"; // ✅ FIXED IMPORT
import { Ingredient } from "../model/Ingredient";
import { shoppingStores } from "../constant/shoppingStores";

// ✅ simple debounce helper
function debounce(fn: (...args: any[]) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function ShoppingListItemComponent({
  ingredient,
}: {
  ingredient: Ingredient;
}) {
  const {
    updateQuantity,
    toggleMarked,
    updateCenter,
    updatePrice,
    updateNotes,
  } = useShoppingList();

  const quantityValue =
    !ingredient.quantity || ingredient.quantity === 0
      ? ""
      : ingredient.quantity;

  const unit = ingredient.unit || "stk";

  // ✅ Persist debounced function
  const debouncedUpdateNotes = useRef(
    debounce((id: string, value: string) => {
      updateNotes(id, value);
    }, 300),
  ).current;

  const debouncedUpdatePrice = useRef(
    debounce((id: string, value: number) => {
      updatePrice(id, value);
    }, 300),
  ).current;

  const debouncedUpdateQuantity = useRef(
    debounce((id: string, value: number) => {
      updateQuantity(id, value);
    }, 300),
  ).current;

  return (
    <div className="flex flex-row flex-wrap w-full items-center gap-2 p-1.5 bg-soft rounded-lg">
      {/* MARK */}
      <input
        type="checkbox"
        checked={ingredient.marked}
        className="w-5 h-5 sm:w-7 sm:h-7"
        onChange={() => toggleMarked(ingredient._id)}
      />

      {/* NAME + QUANTITY */}
      <div className="flex flex-grow flex-col min-w-0 flex-1">
        <p className="font-bold text-base sm:text-lg truncate">
          {ingredient.item.name || "Unnamed Item"}
        </p>

        <div className="flex items-center gap-1 mt-1">
          <input
            type="number"
            min={0}
            step={0.1}
            className="p-0.5 rounded-lg w-10 sm:w-14 border text-sm"
            value={quantityValue}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              debouncedUpdateQuantity(
                ingredient._id,
                Number.isNaN(val) ? 0 : val,
              );
            }}
          />

          {!(ingredient.quantity === 1 && unit === "stk") && (
            <p className="text-muted-foreground text-sm">{unit}</p>
          )}
        </div>
      </div>

      {/* STORE + PRICE + NOTES */}
      <div className="grid grid-cols-6 w-6/12">
        {/* STORE (no debounce needed) */}
        <select
          className="col-span-4 p-1 rounded-lg bg-background"
          value={ingredient.center ?? ""}
          onChange={(e) => updateCenter(ingredient._id, e.target.value)}
        >
          <option value="">Vælg butik</option>
          {shoppingStores.map((store) => (
            <option key={store} value={store}>
              {store}
            </option>
          ))}
        </select>

        {/* PRICE */}
        <div className="flex items-center gap-1 col-span-2">
          <input
            type="number"
            min={0}
            step={1}
            placeholder="Pris"
            className="w-full p-0.5 rounded-lg text-sm"
            value={
              !ingredient.price || ingredient.price === 0
                ? ""
                : ingredient.price
            }
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              debouncedUpdatePrice(ingredient._id, Number.isNaN(val) ? 0 : val);
            }}
          />
          <p>kr</p>
        </div>

        {/* NOTES */}
        <input
          className="col-span-6 p-1 rounded-lg text-sm bg-background mt-1"
          placeholder="Noter..."
          value={ingredient.notes ?? ""}
          onChange={(e) => debouncedUpdateNotes(ingredient._id, e.target.value)}
        />
      </div>
    </div>
  );
}
