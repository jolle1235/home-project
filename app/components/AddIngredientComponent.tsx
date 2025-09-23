"use client";
import React, { useState } from "react";
import { Ingredient } from "../model/Ingredient";
import { RemoveButton } from "./smallComponent/removeBtn";
import { removeItem } from "../utils/apiHelperFunctions";
import { shoppinglistCategories } from "../constant/shoppinglistCategories";
import { useConstants } from "../context/ConstantsContext";

interface Props {
  onAdd: (Ingredient: Ingredient) => void;
  itemName: string;
  InputCategory?: string;
  defaultUnit?: string;
}

export function AddIngredientComponent({
  onAdd,
  itemName,
  InputCategory,
  defaultUnit,
}: Props) {
  const { units } = useConstants(); // 👈 get unit types from context

  const [quantity, setQuantity] = useState<number | "">("");
  const [unit, setUnit] = useState<string>(defaultUnit ?? (units[0] || ""));
  const [category, setCategory] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit) return; // guard against empty unit list

    const newIngredient: Ingredient = {
      _id: "unknown",
      item: {
        _id: "unknown",
        name: itemName,
        category: category || "unknown",
        defaultUnit: defaultUnit || "",
      },
      quantity: quantity === "" ? 0 : quantity,
      unit,
      marked: false,
    };

    onAdd(newIngredient);
    setQuantity("");
    setUnit(units[0] || "");
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
    <div className="flex flex-nowrap justify-start items-center flex-row p-1 space-x-1">
      <button
        onClick={handleSubmit}
        className="size-1/12 min-w-8 bg-transparent text-darkText rounded-full font-bold"
      >
        <img
          className="size-7 bg-action hover:bg-actionHover rounded-full p-1"
          src="/icon/add_sign.png"
          alt="add_recipe"
        />
      </button>

      <div className="min-w-20 flex-1">
        <label className="block text-base sm:text-lg font-medium truncate">
          {itemName}
        </label>
      </div>

      <div className="w-2/12">
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
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      {/* Category selection or display */}
      <div className="w-1/6 flex items-center justify-center">
        {InputCategory ? (
          <div
            className="text-base sm:text-lg font-medium truncate"
            title={InputCategory}
          >
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
            className="mt-1 w-full rounded-md border border-gray-300 py-1 text-sm"
          >
            <option value="">Kategori</option>
            {Object.entries(shoppinglistCategories).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="w-1/12 max-w-12 min-w-8">
        {InputCategory && (
          <div>
            <RemoveButton onRemove={async () => handleRemoveItem(itemName)} />
          </div>
        )}
      </div>
    </div>
  );
}
