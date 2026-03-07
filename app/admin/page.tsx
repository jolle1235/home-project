"use client";
import { useState } from "react";
import { useConstants } from "../context/ConstantsContext";
import Button from "../components/smallComponent/Button";
import { Trash2 } from "lucide-react";

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

      {/* Opskriftskategorier */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold">Opskriftskategorier</h2>
        <div className="flex mt-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border rounded p-2 mr-2"
            placeholder="Tilføj ny kategori"
          />
          <Button
            onClick={() => {
              addCategory(newCategory);
              setNewCategory("");
            }}
            variant="primary"
            size="lg"
            fullWidth
          >
            Tilføj
          </Button>
        </div>
        <div className="w-1/2 my-2 p-1 bg-lightgreyBackground rounded-lg">
          {categories.map((c) => (
            <div
              key={c._id}
              className="ml-2 w-full flex justify-between items-center"
            >
              <label>{c.name}</label>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Fjern kategori: ${c.name}`}
                onClick={() => removeCategory(c.name)}
                className="min-h-[44px] min-w-[44px] px-3 text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Enhedstyper */}
      <div>
        <h2 className="text-xl font-semibold">Enhedstyper</h2>
        <div className="flex mt-2">
          <input
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            className="border rounded p-2 mr-2"
            placeholder="Tilføj ny enhed"
          />
          <Button
            onClick={() => {
              addUnit(newUnit);
              setNewUnit("");
            }}
            variant="primary"
            size="lg"
            fullWidth
          >
            Tilføj
          </Button>
        </div>
        <ul className="w-1/2 my-2 py-1 px-2 bg-lightgreyBackground rounded-lg">
          {units.map((u) => (
            <li
              key={u._id}
              className="ml-2 w-full flex justify-between items-center"
            >
              <label>{u.name}</label>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Fjern enhed: ${u.name}`}
                onClick={() => removeUnit(u.name)}
                className="min-h-[44px] min-w-[44px] px-3 text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
