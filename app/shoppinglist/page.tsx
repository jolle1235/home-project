"use client";
import { useState } from "react";
import { useShoppingListContext } from "../context/ShoppinglistContext";
import { ShoppingListItemComponent } from "../components/ShoppingListItemComponent";
import { AddIngredientModal } from "../components/AddIngredientModal";

export default function ShoppingListPage() {
  const {
    shoppingList,
    clearList,
    clearMarked,
    isSomethingMarked,
    sortByCenter,
  } = useShoppingListContext();
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-darkText mb-4">
        Indkøbsliste
      </h1>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="px-3 py-2 bg-action hover:bg-actionHover text-darkText font-semibold rounded-lg transition-colors"
        >
          Tilføj ingrediens
        </button>
        {isSomethingMarked() && (
          <button
            type="button"
            onClick={clearMarked}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-darkText font-medium rounded-lg transition-colors"
          >
            Fjern markerede
          </button>
        )}
        {shoppingList.length > 0 && (
          <div className="flex ml-auto flex-row gap-2">
            <button
              type="button"
              onClick={sortByCenter}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-darkText font-medium rounded-lg transition-colors"
            >
              Sortér efter butik
            </button>
            <button
              type="button"
              onClick={clearList}
              className="px-3 py-2 bg-cancel hover:opacity-90 text-darkText font-medium rounded-lg transition-colors"
            >
              Tøm listen
            </button>
          </div>
        )}
      </div>
      {shoppingList.length === 0 ? (
        <p className="text-lightgreytxt text-lg py-8">
          Ingen varer på listen endnu. Tilføj ingredienser via knappen ovenfor
          eller fra en opskrift.
        </p>
      ) : (
        <div className="bg-white rounded-lg border border-lightgreyBackground overflow-hidden">
          {shoppingList.map((ingredient) => (
            <ShoppingListItemComponent
              key={ingredient._id}
              ingredient={ingredient}
            />
          ))}
        </div>
      )}
      {addModalOpen && (
        <AddIngredientModal
          onClose={() => setAddModalOpen(false)}
          ingredients={[]}
          setIngredients={() => {}}
          mode="shoppingList"
          description="Tilføjede varer kommer på indkøbslisten."
        />
      )}
    </div>
  );
}
