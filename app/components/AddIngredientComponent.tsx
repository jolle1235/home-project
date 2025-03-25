"use client"
import React, { useState } from "react";
import { Item } from "../model/Item";
import { unitTypes } from "../constant/unitTypes";
import { RemoveButton } from "./smallComponent/removeBtn";
import { removeItem } from "../utils/apiHelperFunctions";

interface Props {
  onAdd: (Item: Item) => void;
  itemName: string;
}
export function AddIngredientComponent({ onAdd, itemName }: Props) {
  const [name, setName] = useState(itemName);

  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState(unitTypes[0]);
  const [category, setCategory] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: Item = {
      _id: 0,
      name,
      quantity,
      unit,
      marked: false,
      category,

    };
    
    onAdd(newItem)

    setName("");
    setQuantity(0);
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
          value={quantity}
          placeholder="Mængde"
          onChange={(e) => setQuantity(Number(e.target.value))}
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
      <div>
      <RemoveButton
        itemName={itemName} // Pass name instead of ID
        onRemove={async () => removeItem(itemName)}
      />

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
