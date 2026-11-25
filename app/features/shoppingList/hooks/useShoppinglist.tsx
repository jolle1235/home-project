"use client";

import { Ingredient } from "../../../model/Ingredient";
import { useServerList } from "../../../hooks/useServerList";

import {
  fetchShoppingList,
  saveShoppingList,
} from "../api/shoppingList.client";
import { SHOPPING_LIST_QUERY_KEY } from "../constants";
import { sortByCenter } from "../utils/shoppinglistHelper";

type UseShoppingListOptions = {
  initialData?: Ingredient[];
};

// Changes go through useServerList (see there).
export function useShoppingList(options: UseShoppingListOptions = {}) {
  const {
    data: shoppingList,
    isLoading,
    isError,
    update,
    refresh,
  } = useServerList<Ingredient>({
    queryKey: SHOPPING_LIST_QUERY_KEY,
    queryFn: fetchShoppingList,
    save: saveShoppingList,
    errorMessage: "Kunne ikke gemme indkøbslisten – prøv igen",
    initialData: options.initialData,
  });

  const addIngredient = (ingredient: Ingredient) => {
    update((list) => [...list, ingredient]);
  };

  // `success` is the toast shown once the rows are saved.
  const addIngredients = (ingredients: Ingredient[], success?: string) => {
    update(
      (list) => [
        ...list,
        ...ingredients.map((ingredient) => ({
          ...ingredient,
          _id: crypto.randomUUID(),
          marked: false,
        })),
      ],
      success,
    );
  };

  const removeIngredient = (id: string) => {
    update((list) => list.filter((item) => item._id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    update((list) =>
      list.map((item) => (item._id === id ? { ...item, quantity } : item)),
    );
  };

  const toggleMarked = (id: string) => {
    update((list) =>
      list.map((item) =>
        item._id === id ? { ...item, marked: !item.marked } : item,
      ),
    );
  };

  const updateCenter = (id: string, center: string) => {
    update((list) =>
      list.map((item) => (item._id === id ? { ...item, center } : item)),
    );
  };

  const updatePrice = (id: string, price: number) => {
    update((list) =>
      list.map((item) => (item._id === id ? { ...item, price } : item)),
    );
  };

  const updateNotes = (id: string, notes: string) => {
    update((list) =>
      list.map((item) => (item._id === id ? { ...item, notes } : item)),
    );
  };

  const updateCategory = (id: string, category: string) => {
    update((list) =>
      list.map((item) =>
        item._id === id
          ? {
              ...item,
              item: {
                ...item.item,
                category,
              },
            }
          : item,
      ),
    );
  };

  const sortByStore = () => update(sortByCenter);

  const clearMarked = () =>
    update((list) => list.filter((item) => !item.marked));

  const clearList = () => update(() => []);

  return {
    shoppingList,
    isLoading,
    isError,
    refresh,

    addIngredient,
    addIngredients,
    removeIngredient,

    updateQuantity,
    toggleMarked,
    updateCenter,
    updateCategory,
    updatePrice,
    updateNotes,

    sortByStore,
    clearMarked,
    clearList,
  };
}
