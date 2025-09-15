"use client";

import { useEffect, useState } from "react";
import { AddButtonComponent } from "../components/AddButtonComponent";
import { AddDrinkModalComponent } from "../components/drinkComponents/AddDrinkModalComponent";
import { Drink } from "../model/Drink";
import { DrinkCardComponent } from "../components/drinkComponents/DrinkCardComponent";

export default function DrinkPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  async function loadDrinks() {
    try {
      setIsLoading(true);
      setError("");
      const res = await fetch("/api/drink");
      if (!res.ok) throw new Error("Failed to fetch drinks");
      const data: Drink[] = await res.json();
      setDrinks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDrinks();
  }, []);

  return (
    <main className="bg-lightBackground w-full text-darkText">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Drinks</h1>
          <AddButtonComponent onClick={handleOpen} />
        </div>

        {isLoading && (
          <p className="text-center py-8 text-gray-500">Indlæser drinks...</p>
        )}
        {error && <p className="text-center py-8 text-red-500">{error}</p>}

        {!isLoading && !error && <DrinkCardComponent drinks={drinks} />}
      </div>

      {isModalOpen && (
        <AddDrinkModalComponent
          handleClose={() => {
            handleClose();
            // Refresh list after closing modal (new drink may have been added)
            loadDrinks();
          }}
        />
      )}
    </main>
  );
}
