"use client";
import React, { useState } from "react";
import { Item } from "../model/Item";
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

export function AddIngredientComponent({ onAdd, itemName, InputCategory=undefined }: Props) {
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState(unitTypes[0]);
  const [category, setCategory] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: Ingredient = {
      _id: 0,
      item: {_id: 0, name: itemName, category: InputCategory || "unknown"},
      quantity,
      unit,
      marked: false,
    };

    onAdd(newItem);
    setQuantity(0);
    setUnit(unitTypes[0]);
    setCategory("");
  };

  async function handleRemoveItem(itemName: string){
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
    <div className="flex justify-center items-center flex-row p-1 space-x-2">
      <button
        onClick={handleSubmit}
        className="bg-transparent text-darkText rounded-full font-bold"
      >
        <img
          className="size-7 bg-action hover:bg-actionHover rounded-full p-1"
          src="/icon/add_sign.png"
          alt="add_recipe"
        />
      </button>

      <div className="w-5/12">
        <label className="block text-lg font-medium">{itemName}</label>
      </div>

      <div className="w-2/12">
        <input
          type="number"
          value={quantity}
          placeholder="Mængde"
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="mt-1 w-full rounded-md border border-gray-300 p-1"
        />
      </div>

      <div className="w-1/12 min-w-fit">
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 py-1"
        >
          {unitTypes.map((unitType) => (
            <option key={unitType} value={unitType}>
              {unitType}
            </option>
          ))}
        </select>
      </div>

      {/* Category selection or display */}
      <div className="w-1/4">
        {InputCategory ? (
          <div className="text-lg font-medium">
            {shoppinglistCategories[InputCategory as keyof typeof shoppinglistCategories]}
          </div>
        ) : (
          <div className="mt-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 py-1"
            >
              <option value="">Category</option>
              {Object.entries(shoppinglistCategories).map(([categoryName, emoji]) => (
                <option key={categoryName} value={categoryName}>
                  {categoryName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {InputCategory && (
        <div>
          <RemoveButton
            onRemove={async () => handleRemoveItem(itemName)}
          />
        </div>
      )}
    </div>
  );
}
