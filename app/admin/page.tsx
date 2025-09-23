"use client";
import { useEffect, useState } from "react";
import {
  addCategoryApi,
  removeCategoryApi,
  addUnitApi,
  removeUnitApi,
} from "../utils/constantsApiHelperFunctions";

export default function AdminPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newUnit, setNewUnit] = useState("");

  async function fetchData() {
    const catRes = await fetch("/api/admin/recipeCategories");
    const unitRes = await fetch("/api/admin/unitTypes");
    setCategories(await catRes.json());
    setUnits(await unitRes.json());
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function addCategory() {
    if (!newCategory) return;
    await addCategoryApi(newCategory);
    setNewCategory("");
    fetchData();
  }

  async function removeCategory(name: string) {
    await removeCategoryApi(name);
    fetchData();
  }

  async function addUnit() {
    if (!newUnit) return;
    await addUnitApi(newUnit);
    setNewUnit("");
    fetchData();
  }

  async function removeUnit(name: string) {
    await removeUnitApi(name);
    fetchData();
  }

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
            onClick={addCategory}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {categories.map((c) => (
            <li key={c._id} className="flex justify-between">
              {c.name}
              <button
                onClick={() => removeCategory(c.name)}
                className="text-red-500"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
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
            onClick={addUnit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {units.map((u) => (
            <li key={u._id} className="flex justify-between">
              {u.name}
              <button
                onClick={() => removeUnit(u.name)}
                className="text-red-500"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
