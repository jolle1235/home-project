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
import { Item } from "../model/Item";
import ActionBtn from "./smallComponent/actionBtn";
import { IngredientsList } from "./ShowIngrediens";

interface AddIngredientModalProps {
  onClose: () => void;
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
}

export function AddIngredientModal({
  onClose,
  ingredients,
  setIngredients,
}: AddIngredientModalProps) {
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

  function handleOnIngredientRemove(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

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
      <div className="flex justify-between flex-col bg-lightBackground rounded-lg w-2/3 h-full ">
        <div>
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
                          defaultUnit={item.defaultUnit}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <IngredientsList
              ingredients={ingredients}
              onRemove={(index) => handleOnIngredientRemove(index)}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <ActionBtn
            onClickF={onClose}
            Itext="Done"
            color="bg-action"
            extraCSS="w-full"
          />
        </div>
      </div>
    </div>
  );
}
