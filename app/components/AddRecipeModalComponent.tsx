import React, { useEffect, useRef, useState } from "react";
import { meatCategories } from "../constant/recipeCategories";
import { Ingredient } from "../model/Ingredient";
import SearchBar from "./SearchBarComponent";
import { Recipe } from "../model/Recipe";
import { AddIngredientComponent } from "./AddIngredientComponent";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { recipeSchema } from "../utils/validationSchema";

// API client function
async function searchItem(searchTerm: string): Promise<string[]> {
  try {
    const response = await fetch(`/api/ingredient?term=${encodeURIComponent(searchTerm)}`);
    if (!response.ok) throw new Error('Failed to fetch ingredients');
    return response.json();
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return [];
  }
}

async function createItem(item: string): Promise<string> {
  try {
    const response = await fetch('/api/ingredient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to create ingredient');
    return response.json();
  } catch (error) {
    console.error('Error creating ingredient:', error);
    throw error;
  }
}

interface Props {
  handleClose: () => void;
}

export const AddRecipeModalComponent: React.FC<Props> = ({ handleClose }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  

  // Available recipe categories
  const [categories] = useState(meatCategories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [items, setItems] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([])

  // Validation setup
  const {
    register,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    handleSubmit,
  } = useForm<Recipe>({
    resolver: yupResolver(recipeSchema),
    mode: "onChange",
  });

  useEffect(() => {
    setValue(
      "ingredients",
      ingredients.map((ingredient) => ({
        name: ingredient.name,
        weight: ingredient.weight,
        unit: ingredient.unit
      }))
    );

    if (errors.ingredients) {
      trigger("ingredients");
    }

    console.log("Updated recipeIngredients:", getValues("ingredients"));
  }, [ingredients]);

  const clearState = (setState: React.Dispatch<React.SetStateAction<any>>, initialState: any) => {
    setState(initialState);
  };

  const onSubmit = async (data: Recipe) => {
    const updatedFormData = {
      recipeId: null,
      recipeName: data.recipeName,
      description: data.description,
      image: data.image,
      ingredients: data.ingredients,
      time: data.time,
      categories: selectedCategories,
      recommendedPersonAmount: data.recommendedPersonAmount,
    };

    try {
      console.log("Recipe sent:", updatedFormData);
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      });

      if (res.ok) {
        clearState(setIngredients, []);
        handleClose();
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  const handleChangeCategories = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedCategories((prev) =>
      checked ? [...prev, value] : prev.filter((category) => category !== value)
    );
  };

  const removeIngredient = (ingredientToRemove: Ingredient) => {
    setIngredients(ingredients.filter((ingredient) => ingredient.name !== ingredientToRemove.name));
  };

  useEffect(() => {
    const fetchIngredients = async () => {
      if (!searchTerm.trim()) {
        setIngredients([]);
        setIsDropdownOpen(false);
        return;
      }

      try {
        const data = await searchItem(searchTerm);
        setItems(data);
        setIsDropdownOpen(true);
      } catch (error) {
        console.error("Failed to fetch ingredients");
        setIsDropdownOpen(false);
      }
    };

    const debounceTimeout = setTimeout(fetchIngredients, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-darkText bg-opacity-50">
      <div className="flex flex-col w-11/12 h-[90vh] max-w-7xl bg-cyan-200 rounded-lg p-5">
        <div className="flex justify-between items-start py-2">
          <h2 className="text-lg font-bold text-darkText mb-4">Tilføj en opskrift</h2>
          <button onClick={handleClose} className="rounded-full font-bold">
            <img src="/icon/remove_button.png" alt="remove_ingrediens" className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-row">
            <div className="flex flex-col w-1/2 px-1 space-y-2">
              <label className="font-bold">Opskrifts Navn</label>
              <input
                type="text"
                className="w-full min-w-36 max-w-80 rounded-lg p-1"
                {...register("recipeName")}
                onKeyUp={() => trigger("recipeName")}
              />
              {errors.recipeName && <p className="text-red-500 text-xs">{errors.recipeName.message}</p>}

              <label className="font-bold">Billede</label>
              <input
                type="url"
                className="w-full min-w-36 max-w-80 rounded-lg p-1"
                {...register("image")}
                onKeyUp={() => trigger("image")}
              />
              {errors.image && <p className="text-red-500 text-xs">{errors.image.message}</p>}
              {getValues("image") && <img src={getValues("image")} alt="Preview" className="size-28 rounded" />}

              <label className="font-bold">Antaget tid (min.)</label>
              <input type="number" className="rounded-lg p-1" {...register("time")} onKeyUp={() => trigger("time")} />
              {errors.time && <p className="text-red-500 text-xs">{errors.time.message}</p>}

              <label className="font-bold">Kategorier</label>
              <div className="flex flex-wrap space-x-4">
                {categories.map((category) => (
                  <label key={category}>
                    <input
                      type="checkbox"
                      value={category}
                      checked={selectedCategories.includes(category)}
                      onChange={handleChangeCategories}
                    />
                    {category}
                  </label>
                ))}
              </div>
              <div>
              <label className="font-bold">Ingredienser</label>
              <div ref={searchBarRef} className="relative">
                <SearchBar
                  onChange={setSearchTerm}
                  placeholder="Søg efter ingredienser..."
                />
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                    {searchTerm.trim() && !items.some(item => item.toLowerCase() === searchTerm.toLowerCase()) && (
                      <div
                        className="p-2 hover:bg-gray-100 cursor-pointer bg-gray-50"
                        onClick={async () => {
                          try {
                            const newItem = searchTerm.trim();
                            const createdItem = await createItem(newItem);
                            setItems(prev => [...prev, createdItem]);
                            setSearchTerm("");
                            setIsDropdownOpen(false);
                          } catch (error) {
                            console.error('Failed to create ingredient:', error);
                          }
                        }}
                      >
                        <AddIngredientComponent
                          onAdd={async (newIngredient) => {
                            setIngredients(prev => [...prev, newIngredient]);
                          }}
                          item={searchTerm}
                        />
                      </div>
                    )}
                    {ingredients.map((ingredient) => (
                      <div
                        key={ingredient.name}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setIngredients(prev => [...prev, ingredient]);
                          setSearchTerm("");
                          setIsDropdownOpen(false);
                        }}
                      >
                        {ingredient.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {ingredients.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-bold mb-2">Valgte ingredienser:</h3>
                  <div className="space-y-2">
                    {ingredients.map((ingredient) => (
                      <div key={ingredient.name} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                        <span>{ingredient.name}</span>
                        <button
                          type="button"
                          onClick={() => removeIngredient(ingredient)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <img src="/icon/remove_button.png" alt="remove_ingredient" className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>

              <button className="bg-action hover:bg-actionHover text-darkText rounded-full px-3 py-2 font-bold" type="submit">
                Tilføj opskrift
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
