"use client";
import { useState } from "react";
import { Plus, Trash2, ArrowUpDown } from "lucide-react";
import { useShoppingListContext } from "../context/ShoppinglistContext";
import { ShoppingListItemComponent } from "../components/ShoppingListItemComponent";
import { AddIngredientModal } from "../components/AddIngredientModal";
import { IconButton } from "../components/IconButton";

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
      <h1 className="text-2xl sm:text-3xl font-bold text-muted-foreground mb-4">
        Indkøbsliste
      </h1>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex items-center gap-1 group">
          <IconButton
            icon={Plus}
            variant="primary"
            ariaLabel="Tilføj ingrediens"
            onClick={() => setAddModalOpen(true)}
          />
          <span className="hidden sm:inline-flex text-sm text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
            Tilføj ingrediens
          </span>
        </div>
        {isSomethingMarked() && (
          <div className="flex items-center gap-1 group">
            <IconButton
              icon={Trash2}
              variant="secondary"
              ariaLabel="Fjern markerede"
              onClick={clearMarked}
            />
            <span className="hidden sm:inline-flex text-sm text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
              Fjern markerede
            </span>
          </div>
        )}
        {shoppingList.length > 0 && (
          <div className="flex ml-auto flex-row gap-3">
            <div className="flex items-center gap-1 group">
              <IconButton
                icon={ArrowUpDown}
                variant="secondary"
                ariaLabel="Sortér efter butik"
                onClick={sortByCenter}
              />
              <span className="hidden sm:inline-flex text-sm text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                Sortér efter butik
              </span>
            </div>
            <div className="flex items-center gap-1 group">
              <IconButton
                icon={Trash2}
                variant="danger"
                ariaLabel="Tøm listen"
                onClick={clearList}
              />
              <span className="hidden sm:inline-flex text-sm text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                Tøm listen
              </span>
            </div>
          </div>
        )}
      </div>
      {shoppingList.length === 0 ? (
        <p className="text-lightgreytxt text-lg py-8">
          Ingen varer på listen endnu. Tilføj ingredienser via knappen ovenfor
          eller fra en opskrift.
        </p>
      ) : (
        <div className=" rounded-lg overflow-hidden">
          {shoppingList.map((ingredient) => (
            <div className="mb-1">
              <ShoppingListItemComponent
                key={ingredient._id}
                ingredient={ingredient}
              />
            </div>
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
