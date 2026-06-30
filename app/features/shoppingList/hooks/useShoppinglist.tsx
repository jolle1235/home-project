"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Ingredient } from "../../../model/Ingredient";

import {
  clearShoppingListApi,
  fetchShoppingList,
  saveShoppingList,
} from "../api/shoppingList.client";
import { SHOPPING_LIST_QUERY_KEY } from "../constants";
import { sortByCenter } from "../utils/shoppinglistHelper";

type UseShoppingListOptions = {
  initialData?: Ingredient[];
};

export function useShoppingList(options: UseShoppingListOptions = {}) {
  const { initialData } = options;
  const queryClient = useQueryClient();

  const {
    data: shoppingList = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: SHOPPING_LIST_QUERY_KEY,
    queryFn: fetchShoppingList,
    initialData,
  });

  const saveMutation = useMutation({
    mutationFn: saveShoppingList,

    onMutate: async (updatedList) => {
      await queryClient.cancelQueries({ queryKey: SHOPPING_LIST_QUERY_KEY });
      const previous = queryClient.getQueryData<Ingredient[]>(
        SHOPPING_LIST_QUERY_KEY,
      );
      queryClient.setQueryData(SHOPPING_LIST_QUERY_KEY, updatedList);
      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(SHOPPING_LIST_QUERY_KEY, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_QUERY_KEY });
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearShoppingListApi,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: SHOPPING_LIST_QUERY_KEY });
      const previous = queryClient.getQueryData<Ingredient[]>(
        SHOPPING_LIST_QUERY_KEY,
      );
      queryClient.setQueryData(SHOPPING_LIST_QUERY_KEY, []);
      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(SHOPPING_LIST_QUERY_KEY, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_QUERY_KEY });
    },
  });

  const updateList = (updater: (list: Ingredient[]) => Ingredient[]) => {
    saveMutation.mutate(updater(shoppingList));
  };

  const setList = (newList: Ingredient[]) => {
    saveMutation.mutate(newList);
  };

  const addIngredient = (ingredient: Ingredient) => {
    updateList((list) => [...list, ingredient]);
  };

  const addIngredients = (ingredients: Ingredient[]) => {
    updateList((list) => [
      ...list,
      ...ingredients.map((ingredient) => ({
        ...ingredient,
        _id: crypto.randomUUID(),
        marked: false,
      })),
    ]);
  };

  const removeIngredient = (id: string) => {
    updateList((list) => list.filter((item) => item._id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    updateList((list) =>
      list.map((item) => (item._id === id ? { ...item, quantity } : item)),
    );
  };

  const toggleMarked = (id: string) => {
    updateList((list) =>
      list.map((item) =>
        item._id === id ? { ...item, marked: !item.marked } : item,
      ),
    );
  };

  const updateCenter = (id: string, center: string) => {
    updateList((list) =>
      list.map((item) => (item._id === id ? { ...item, center } : item)),
    );
  };

  const updatePrice = (id: string, price: number) => {
    updateList((list) =>
      list.map((item) => (item._id === id ? { ...item, price } : item)),
    );
  };

  const updateNotes = (id: string, notes: string) => {
    updateList((list) =>
      list.map((item) => (item._id === id ? { ...item, notes } : item)),
    );
  };

  const updateCategory = (id: string, category: string) => {
    updateList((list) =>
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

  const sortByStore = () => {
    setList(sortByCenter(shoppingList));
  };

  const clearMarked = () => {
    setList(shoppingList.filter((item) => !item.marked));
  };

  const clearList = () => {
    clearMutation.mutate();
  };

  return {
    shoppingList,
    isLoading,
    isError,
    error,
    isSaving: saveMutation.isPending || clearMutation.isPending,
    refresh: refetch,

    addIngredient,
    addIngredients,
    removeIngredient,

    updateQuantity,
    toggleMarked,
    updateCenter,
    updateCategory,
    updatePrice,
    updateNotes,

    setList,
    sortByStore,
    clearMarked,
    clearList,
  };
}
