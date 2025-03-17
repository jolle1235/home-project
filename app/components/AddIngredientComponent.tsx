import React, { useState } from "react";
import { Ingredient } from "../model/Ingredient";
import { unitTypes } from "../constant/unitTypes";

interface Props {
  onAdd: (ingredient: Ingredient) => void;
  item: string;
}
export function AddIngredientComponent({ onAdd, item }: Props) {
  const [name, setName] = useState("");
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
    <form onSubmit={handleSubmit} className="flex flex-row space-y-2">
      <div className="w-1/2">
        <label className="block text-sm font-medium">
          {item}
        </label>
      </div>

      <div className="w-1/4">
        <label className="block text-sm font-medium">Mængde</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="mt-1 rounded-md border border-gray-300 p-2"
          required
          min="0"
        />
      </div>

      <div className="w-1/6">
        <label className="block text-sm font-medium">Enhed</label>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="mt-1 rounded-md border border-gray-300 p-2"
        >
          {unitTypes.map((unitType) => (
            <option key={unitType} value={unitType}>{unitType}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="bg-action  hover:bg-actionHover text-darkText rounded-full px-3 py-2 font-bold"
      >
        Tilføj Ingrediens
      </button>
    </form>
  );
};
