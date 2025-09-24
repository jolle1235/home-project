"use client";
import { useState } from "react";
import { useConstants } from "../context/ConstantsContext";
import ActionBtn from "../components/smallComponent/actionBtn";
import { RemoveButton } from "../components/smallComponent/removeBtn";

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
          <ActionBtn
            onClickF={() => {
              addCategory(newCategory);
              setNewCategory("");
            }}
            Itext="Tilføj"
          />
        </div>
        <div className="w-1/2 my-2 p-1 bg-lightgreyBackground rounded-lg">
          {categories.map((c) => (
            <div
              key={c._id}
              className="ml-2 w-full flex justify-between items-center"
            >
              <label>{c.name}</label>
              <RemoveButton onClickF={() => removeCategory(c.name)} />
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
          <ActionBtn
            onClickF={() => {
              addUnit(newUnit);
              setNewUnit("");
            }}
            Itext="Tilføj"
          />
        </div>
        <ul className="w-1/2 my-2 py-1 px-2 bg-lightgreyBackground rounded-lg">
          {units.map((u) => (
            <li
              key={u._id}
              className="ml-2 w-full flex justify-between items-center"
            >
              <label>{u.name}</label>
              <RemoveButton onClickF={() => removeUnit(u.name)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
