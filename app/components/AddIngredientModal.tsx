"use client";
import { useState, useEffect, useRef } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { drinkSchema } from "../utils/validationSchema";
import { Drink } from "../model/Drink";
import { createItem } from "../utils/apiHelperFunctions";
import { searchItem } from "../utils/apiHelperFunctions";
import { Ingredient } from "../model/Ingredient";
import SearchBar from "./SearchBarComponent";
import { AddIngredientComponent } from "./AddIngredientComponent";
import { meatCategories } from "../constant/recipeCategories";
import { Item } from "../model/Item";

interface AddIngredientModalProps {
  onClose: () => void;
}

export function AddIngredientModal({ onClose }: AddIngredientModalProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  const {
    register,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    handleSubmit,
  } = useForm<Drink>({
    resolver: yupResolver(drinkSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      if (!searchTerm) {
        setIsDropdownOpen(false);
        return;
      }
      try {
        const data = await searchItem(searchTerm);
        setItems(data);
        setIsDropdownOpen(true);
      } catch (error) {
        console.error("Failed to fetch Items");
        setIsDropdownOpen(false);
      }
    };
    const debounceTimeout = setTimeout(fetchItems, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const removeItem = (ItemToRemove: Item) => {
    setItems(items.filter((Item) => Item.name !== ItemToRemove.name));
  };

  useEffect(() => {
    setValue(
      "ingredients",
      ingredients.map((ingredient: Ingredient) => ({
        _id: "unknown",
        item: ingredient.item,
        unit: ingredient.unit,
        marked: ingredient.marked,
        quantity: ingredient.quantity,
      }))
    );
  }, [ingredients, setValue]);

  return (
    <div className="fixed w-full inset-0 bg-darkBackground bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-lightBackground rounded-lg w-2/3 h-full">
        <div className="flex justify-between items-center px-6 py-2 bg-lightgreyBackground rounded-t-lg">
          <h2 className="text-2xl font-bold">Tilføj ingredienser</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="w-full bg-lightBackground p-2">
          <div className="space-y-4 relative">
            <div ref={searchBarRef} className="relative">
              <SearchBar
                onChange={setSearchTerm}
                placeholder="Søg efter ingredienser..."
              />
              {isDropdownOpen && (
                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto">
                  {searchTerm.trim() && (
                    <div className="hover:bg-gray-100 cursor-pointer bg-gray-50 p-2">
                      <AddIngredientComponent
                        onAdd={async (returnItem) => {
                          const newItem: Ingredient = returnItem;
                          await createItem(newItem);
                          setIngredients((prev) => [...prev, returnItem]);
                          setSearchTerm("");
                          setIsDropdownOpen(false);
                        }}
                        itemName={searchTerm}
                      />
                    </div>
                  )}
                  {items.map((item) => (
                    <div
                      key={item.name}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <AddIngredientComponent
                        onAdd={async (newItem) => {
                          setIngredients((prev) => [...prev, newItem]);
                          setSearchTerm("");
                          setIsDropdownOpen(false);
                        }}
                        itemName={item.name}
                        InputCategory={item.category}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Ingredienser
          </label>
          <div className="mb-4">
            {ingredients.length > 0 ? (
              <div className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">
                        {ingredient.item.name}
                      </span>
                      <span className="text-gray-500">
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIngredients(
                          ingredients.filter((_, i) => i !== index)
                        );
                      }}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Ingen ingredienser tilføjet endnu
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
