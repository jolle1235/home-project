"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, ArrowUpDown } from "lucide-react";
import { useShoppingList } from "../hooks/useShoppinglist";
import { ShoppingListItemComponent } from "../components/ShoppingListItemComponent";
import { AddIngredientModal } from "../components/AddIngredientModal";
import { IconButton } from "../components/IconButton";
import { sortByCenter } from "../utils/shoppinglistHelper";
import { useScrollRefresh } from "../hooks/useScrollRefresh";
import { PullToRefreshIndicator } from "../components/PullToRefreshIndicator";

export default function ShoppingListPage() {
  const { shoppingList, refresh, isSaving, setList } = useShoppingList();

  const { isRefreshing } = useScrollRefresh(refresh);

  const [addModalOpen, setAddModalOpen] = useState(false);

  // ✅ Derived state
  const isSomethingMarked = useMemo(
    () => shoppingList.some((i) => i.marked),
    [shoppingList],
  );

  // 🔥 SORT HANDLER (one-time action)
  const handleSort = () => {
    const sorted = sortByCenter(shoppingList);
    setList(sorted);
  };

  // 🔥 CLEAR MARKED (still TODO optimized)
  const clearMarked = () => {
    const filtered = shoppingList.filter((i) => !i.marked);
    setList(filtered);
  };

  // 🔥 CLEAR ALL
  const clearList = () => {
    setList([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-1">
      <PullToRefreshIndicator isRefreshing={isRefreshing} />

      <div className="flex flex-row text-base">
        <h1 className="text-2xl sm:text-3xl font-bold text-muted-foreground mb-4">
          Indkøbsliste
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-1 items-center">
        {/* ADD */}
        <div className="flex items-center gap-1 group">
          <IconButton
            icon={Plus}
            variant="primary"
            ariaLabel="Tilføj ingrediens"
            onClick={() => setAddModalOpen(true)}
          />
        </div>

        {/* CLEAR MARKED */}
        {isSomethingMarked && (
          <div className="flex items-center gap-1 group">
            <IconButton
              icon={Trash2}
              variant="secondary"
              ariaLabel="Fjern markerede"
              onClick={clearMarked}
              disabled={isSaving}
            />
          </div>
        )}

        {/* RIGHT SIDE */}
        {shoppingList.length > 0 && (
          <div className="flex ml-auto flex-row gap-3">
            {/* SORT */}
            <div className="flex items-center gap-1 group">
              <IconButton
                icon={ArrowUpDown}
                variant="secondary"
                ariaLabel="Sortér efter butik"
                onClick={handleSort}
              />
              <span className="hidden sm:inline-flex text-sm text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                Sortér efter butik
              </span>
            </div>

            {/* CLEAR ALL */}
            <div className="flex items-center gap-1 group">
              <IconButton
                icon={Trash2}
                variant="danger"
                ariaLabel="Tøm listen"
                onClick={clearList}
                disabled={isSaving}
              />
              <span className="hidden sm:inline-flex text-sm text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                Tøm listen
              </span>
            </div>
          </div>
        )}
      </div>

      {/* COUNT */}
      <p className="text-muted-foreground w-fit">
        {shoppingList.filter((item) => item.marked).length} /{" "}
        {shoppingList.length}
      </p>

      {/* LIST */}
      {shoppingList.length === 0 ? (
        <p className="text-muted-foreground text-lg py-8">
          Ingen varer på listen endnu. Tilføj ingredienser via knappen ovenfor
          eller fra en opskrift.
        </p>
      ) : (
        <div className="rounded-lg overflow-hidden">
          {shoppingList.map((ingredient) => (
            <div key={ingredient._id} className="mb-1">
              <ShoppingListItemComponent ingredient={ingredient} />
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
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
