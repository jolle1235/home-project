"use client";
import React, { useState } from "react";
import { Ingredient } from "../model/Ingredient";
import { unitTypes } from "../constant/unitTypes";
import { RemoveButton } from "./smallComponent/removeBtn";
import { removeItem } from "../utils/apiHelperFunctions";
import { shoppinglistCategories } from "../constant/shoppinglistCategories";

interface Props {
  onAdd: (Ingredient: Ingredient) => void;
  itemName: string;
  InputCategory?: string;
}

export function AddIngredientComponent({
  onAdd,
  itemName,
  InputCategory = undefined,
}: Props) {
  const [quantity, setQuantity] = useState<number | "">("");
  const [unit, setUnit] = useState(unitTypes[0]);
  const [category, setCategory] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: Ingredient = {
      _id: "unknown",
      item: {
        _id: "unknown",
        name: itemName,
        category: InputCategory || "unknown",
      },
      quantity: quantity === "" ? 0 : quantity,
      unit,
      marked: false,
    };

    onAdd(newItem);
    setQuantity("");
    setUnit(unitTypes[0]);
    setCategory("");
  };

  async function handleRemoveItem(itemName: string) {
    if (!window.confirm("Are you sure you want to remove this item?")) return;

    setLoading(true);
    setError(null);

    try {
      await removeItem(itemName);
    } catch (err) {
      setError("Failed to remove item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap sm:flex-nowrap justify-start sm:justify-center items-center flex-row p-1 space-x-1 sm:space-x-2">
      <button
        onClick={handleSubmit}
        className="bg-transparent text-darkText rounded-full font-bold"
      >
        <img
          className="size-6 sm:size-7 bg-action hover:bg-actionHover rounded-full p-1"
          src="/icon/add_sign.png"
          alt="add_recipe"
        />
      </button>

      <div className="w-5/12 sm:w-5/12">
        <label className="block text-base sm:text-lg font-medium truncate">
          {itemName}
        </label>
      </div>

      <div className="w-3/12 sm:w-3/12">
        <input
          type="number"
          value={quantity}
          placeholder="Mængde"
          onChange={(e) =>
            setQuantity(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="mt-1 w-full rounded-md border border-gray-300 p-1 text-sm sm:text-base"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(e);
            }
          }}
        />
      </div>

      <div className="w-1/12 sm:w-1/12 min-w-fit">
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 py-1 text-sm sm:text-base"
        >
          {unitTypes.map((unitType) => (
            <option key={unitType} value={unitType}>
              {unitType}
            </option>
          ))}
        </select>
      </div>

      {/* Category selection or display */}
      <div className="w-1/4 sm:w-1/4">
        {InputCategory ? (
          <div className="text-base sm:text-lg font-medium truncate">
            {
              shoppinglistCategories[
                InputCategory as keyof typeof shoppinglistCategories
              ]
            }
          </div>
        ) : (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 py-1 text-sm sm:text-base"
          >
            <option value="">Vælg kategori</option>
            {Object.entries(shoppinglistCategories).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        )}
      </div>

      {InputCategory && (
        <div>
          <RemoveButton onRemove={async () => handleRemoveItem(itemName)} />
        </div>
      )}
    </div>
  );
}
