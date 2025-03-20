"use client"
import React, { useState } from "react";
import { Ingredient } from "../model/Ingredient";
import { unitTypes } from "../constant/unitTypes";
import { Item } from "../model/item";

interface Props {
  onAdd: (ingredient: Ingredient) => void;
  itemName: string;
}
export function AddIngredientComponent({ onAdd, itemName }: Props) {
  const [name, setName] = useState(itemName);

  const [weight, setWeight] = useState<number>(0);
  const [unit, setUnit] = useState(unitTypes[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newIngredient: Ingredient = {
      name,
      weight,
      unit
    };
    
    onAdd(newIngredient)

    // Reset form
    setName("");
    setWeight(0);
    setUnit(unitTypes[0]);
  };

  return (
    <div  className="flex justify-center items-center flex-row p-1">
      <div className="w-5/12">
        <label className="block text-lg font-medium">
          {itemName}
        </label>
      </div>

      <div className="w-3/12">
        <input
          type="number"
          value={weight}
          placeholder="Mængde"
          onChange={(e) => setWeight(Number(e.target.value))}
          className="mt-1 w-full rounded-md border border-gray-300 p-1"
          required
          min="0"
        />
      </div>

      <div className="w-1/6 min-w-fit">
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 py-1"
        >
          {unitTypes.map((unitType) => (
            <option key={unitType} value={unitType}>{unitType}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSubmit}
        className="bg-transparent m-1 text-darkText rounded-full font-bold"
      >
        <img
          className="size-7 bg-action hover:bg-actionHover rounded-full p-1"
          src="/icon/add_sign.png"
          alt="add_recipe"
        />
      </button>
    </div>
  );
};
