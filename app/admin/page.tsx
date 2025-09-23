"use client";
import { useState } from "react";
import { useConstants } from "../context/ConstantsContext";

export default function AdminPage() {
  const {
    categories,
    units,
    addCategory,
    removeCategory,
    addUnit,
    removeUnit,
  } = useConstants();

  const [newCategory, setNewCategory] = useState("");
  const [newUnit, setNewUnit] = useState("");

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      {/* Recipe Categories */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold">Recipe Categories</h2>
        <div className="flex mt-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border rounded p-2 mr-2"
            placeholder="Add new category"
          />
          <button
            onClick={() => {
              addCategory(newCategory);
              setNewCategory("");
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
        <div className="m-2 p-2 bg-lightgreyBackground rounded-lg">
          {categories.map((c) => (
            <div key={c} className="w-1/3 flex justify-between">
              <label>{c}</label>
              <button
                onClick={() => removeCategory(c)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Unit Types */}
      <div>
        <h2 className="text-xl font-semibold">Unit Types</h2>
        <div className="flex mt-2">
          <input
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            className="border rounded p-2 mr-2"
            placeholder="Add new unit"
          />
          <button
            onClick={() => {
              addUnit(newUnit);
              setNewUnit("");
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {units.map((u) => (
            <li key={u} className="flex justify-between">
              {u}
              <button onClick={() => removeUnit(u)} className="text-red-500">
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
