"use client";

import { useState, useEffect, useRef } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { drinkSchema } from "../utils/validationSchema";
import { Drink } from "../model/Drink";
import { createItem, searchItem } from "../utils/apiHelperFunctions";
import { Ingredient } from "../model/Ingredient";
import { SearchBarComponent } from "./SearchBarComponent";
import { AddIngredientComponent } from "./AddIngredientComponent";
import { Item } from "../model/Item";
import { IngredientsList } from "./ShowIngrediens";
import { useShoppingList } from "../hooks/useShoppinglist";
import Button from "./smallComponent/Button";
import { normalizeIngredient } from "../utils/shoppinglistHelper";

interface AddIngredientModalProps {
  onClose: () => void;
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  onRefreshItems?: () => void;
  mode?: "recipe" | "shoppingList";
  description?: string;
}

export function AddIngredientModal({
  onClose,
  ingredients,
  setIngredients,
  onRefreshItems,
  mode = "recipe",
  description,
}: AddIngredientModalProps) {
  const { addIngredients, isSaving } = useShoppingList(); // ✅ ONLY THIS

  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const isShoppingListMode = mode === "shoppingList";

  const [stagedIngredients, setStagedIngredients] = useState<Ingredient[]>(
    isShoppingListMode ? [] : ingredients,
  );

  const { setValue } = useForm<Drink>({
    resolver: yupResolver(drinkSchema),
  });

  // ---------------- UI LOGIC ---------------- //

  function handleAddIngredientLocal(ingredient: Ingredient) {
    setStagedIngredients((prev) => [...prev, ingredient]);
  }

  function handleOnIngredientRemove(index: number) {
    setStagedIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  const handleIngredientAddedFromPicker = (ingredient: Ingredient) => {
    handleAddIngredientLocal(ingredient);
    setSearchTerm("");
    setIsDropdownOpen(false);
    searchInputRef.current?.focus();
  };

  const handleQuickAdd = () => {
    const name = searchTerm.trim();
    if (!name) return;

    const newIngredient = normalizeIngredient({
      itemName: searchTerm,
    });

    handleAddIngredientLocal(newIngredient);

    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  // ---------------- FETCH SEARCH ---------------- //

  useEffect(() => {
    const fetchItems = async () => {
      if (!searchTerm) return setIsDropdownOpen(false);

      try {
        const data = await searchItem(searchTerm);
        setItems(data);
        setIsDropdownOpen(true);
      } catch {
        setIsDropdownOpen(false);
      }
    };

    const t = setTimeout(fetchItems, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ---------------- FORM SYNC ---------------- //

  useEffect(() => {
    setValue("ingredients", stagedIngredients);
  }, [stagedIngredients, setValue]);

  // ---------------- MODAL ---------------- //

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setTimeout(() => setIsMounted(true), 10);

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  // ---------------- SUBMIT ---------------- //

  const handleSubmitIngredients = () => {
    if (isShoppingListMode) {
      addIngredients(stagedIngredients);
    } else {
      setIngredients(stagedIngredients);
    }

    handleClose();
  };

  // ---------------- UI ---------------- //

  return (
    <div
      className={`fixed inset-0 bg-background bg-opacity-50 flex items-end md:items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`flex flex-col bg-background rounded-t-lg md:rounded-lg w-full md:w-2/3 transform transition-all duration-300 ${
          isClosing
            ? "translate-y-full md:scale-95 opacity-0"
            : isMounted
              ? "translate-y-0 md:scale-100 opacity-100"
              : "translate-y-full md:scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-2">
          <h2 className="text-2xl font-bold">Tilføj ingredienser</h2>
          {isShoppingListMode && description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>

        {/* SEARCH */}
        <div className="p-2 space-y-2">
          <div ref={searchBarRef}>
            <SearchBarComponent
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search ingredient..."
              inputRef={searchInputRef}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleQuickAdd();
                }
              }}
            />

            {isDropdownOpen && (
              <div className="mt-2 space-y-2">
                {searchTerm.trim() && (
                  <AddIngredientComponent
                    onAdd={async (item) => {
                      await createItem(item);
                      handleIngredientAddedFromPicker(item);
                    }}
                    itemName={searchTerm}
                  />
                )}

                {items.map((item) => (
                  <AddIngredientComponent
                    key={item.name}
                    onAdd={handleIngredientAddedFromPicker}
                    itemName={item.name}
                    InputCategory={item.category}
                    defaultUnit={item.defaultUnit}
                  />
                ))}
              </div>
            )}
          </div>

          <IngredientsList
            ingredients={stagedIngredients}
            onRemove={handleOnIngredientRemove}
          />
        </div>

        {/* ACTION */}
        <div className="p-2">
          <Button
            onClick={handleSubmitIngredients}
            disabled={isSaving}
            fullWidth
          >
            Tilføj til liste
          </Button>
        </div>
      </div>
    </div>
  );
}
