"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ingredient } from "../model/Ingredient";

export function useShoppingList() {
  const queryClient = useQueryClient();

  // 🔹 FETCH
  const { data: shoppingList = [], isLoading } = useQuery({
    queryKey: ["shoppingList"],
    queryFn: async (): Promise<Ingredient[]> => {
      const res = await fetch("/api/shopping-list");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // 🔹 MUTATION (🔥 OPTIMISTIC)
  const mutation = useMutation({
    mutationFn: async (updatedList: Ingredient[]) => {
      const res = await fetch("/api/shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList),
      });

      if (!res.ok) throw new Error("Failed to save");
    },

    // ✅ Optimistic update
    onMutate: async (updatedList) => {
      await queryClient.cancelQueries({ queryKey: ["shoppingList"] });

      const previous = queryClient.getQueryData<Ingredient[]>(["shoppingList"]);

      queryClient.setQueryData(["shoppingList"], updatedList);

      return { previous };
    },

    // ❌ Rollback on error
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["shoppingList"], context.previous);
      }
    },

    // 🔄 Ensure sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["shoppingList"] });
    },
  });

  // ---------------- CORE UPDATE ---------------- //

  const updateList = (updater: (list: Ingredient[]) => Ingredient[]) => {
    const updated = updater(shoppingList);
    mutation.mutate(updated);
  };

  // ---------------- ACTIONS ---------------- //

  const addIngredient = (ingredient: Ingredient) => {
    updateList((list) => [...list, ingredient]);
  };

  const addIngredients = (ingredients: Ingredient[]) => {
    updateList((list) => [
      ...list,
      ...ingredients.map((i) => ({
        ...i,
        _id: crypto.randomUUID(),
        marked: false,
      })),
    ]);
  };

  const removeIngredient = (id: string) => {
    updateList((list) => list.filter((i) => i._id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    updateList((list) =>
      list.map((i) => (i._id === id ? { ...i, quantity } : i)),
    );
  };

  const toggleMarked = (id: string) => {
    updateList((list) =>
      list.map((i) => (i._id === id ? { ...i, marked: !i.marked } : i)),
    );
  };

  const updateCenter = (id: string, center: string) => {
    updateList((list) =>
      list.map((i) => (i._id === id ? { ...i, center } : i)),
    );
  };

  const updatePrice = (id: string, price: number) => {
    updateList((list) => list.map((i) => (i._id === id ? { ...i, price } : i)));
  };

  const updateNotes = (id: string, notes: string) => {
    updateList((list) => list.map((i) => (i._id === id ? { ...i, notes } : i)));
  };

  // ---------------- RETURN ---------------- //

  return {
    shoppingList,
    isLoading,
    isSaving: mutation.isPending,

    addIngredient,
    addIngredients,
    removeIngredient,

    updateQuantity,
    toggleMarked,
    updateCenter,
    updatePrice,
    updateNotes,
  };
}
