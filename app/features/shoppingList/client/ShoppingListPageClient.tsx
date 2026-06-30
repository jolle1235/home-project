"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Plus, Trash2 } from "lucide-react";

import { AddIngredientModal } from "../../recipes/components/AddIngredientModal";
import { IconButton } from "../../../components/IconButton";
import { PullToRefreshIndicator } from "../../../components/PullToRefreshIndicator";
import { useScrollRefresh } from "../../../hooks/useScrollRefresh";
import { Ingredient } from "../../../model/Ingredient";

import { ShoppingListItemComponent } from "../components/ShoppingListItemComponent";
import { useShoppingList } from "../hooks/useShoppinglist";

type Props = {
  initialShoppingList: Ingredient[];
};

export default function ShoppingListPageClient({
  initialShoppingList,
}: Props) {
  const [addModalOpen, setAddModalOpen] = useState(false);

  const {
    shoppingList,
    isLoading,
    isError,
    refresh,
    sortByStore,
    clearMarked,
    clearList,
  } = useShoppingList({ initialData: initialShoppingList });

  const { isRefreshing } = useScrollRefresh(refresh);

  const isSomethingMarked = useMemo(
    () => shoppingList.some((item) => item.marked),
    [shoppingList],
  );

  const markedCount = useMemo(
    () => shoppingList.filter((item) => item.marked).length,
    [shoppingList],
  );

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Indlæser indkøbsliste...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-red-600">
        Der opstod en fejl ved indlæsning af indkøbslisten.
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-1">
      <PullToRefreshIndicator isRefreshing={isRefreshing} />

      <div className="flex flex-row text-base">
        <h1 className="text-2xl sm:text-3xl font-bold text-muted-foreground mb-4">
          Indkøbsliste
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-1 items-center">
        <div className="flex items-center gap-1 group">
          <IconButton
            icon={Plus}
            variant="primary"
            ariaLabel="Tilføj ingrediens"
            onClick={() => setAddModalOpen(true)}
          />
        </div>

        {isSomethingMarked && (
          <div className="flex items-center gap-1 group">
            <IconButton
              icon={Trash2}
              variant="secondary"
              ariaLabel="Fjern markerede"
              onClick={clearMarked}
            />
          </div>
        )}

        {shoppingList.length > 0 && (
          <div className="flex ml-auto flex-row gap-3">
            <div className="flex items-center gap-1 group">
              <IconButton
                icon={ArrowUpDown}
                variant="secondary"
                ariaLabel="Sortér efter butik"
                onClick={sortByStore}
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

      <p className="text-muted-foreground w-fit">
        {markedCount} / {shoppingList.length}
      </p>

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
