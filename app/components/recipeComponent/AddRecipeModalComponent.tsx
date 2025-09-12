"use client";
import React, { useEffect, useRef, useState } from "react";
import { meatCategories } from "../../constant/recipeCategories";
import { Item } from "../../model/Item";
import { Ingredient } from "../../model/Ingredient";
import SearchBar from "../SearchBarComponent";
import { Recipe } from "../../model/Recipe";
import { AddIngredientComponent } from "../AddIngredientComponent";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { recipeSchema } from "../../utils/validationSchema";
import ImageUploader from "../ImageUploader";
import { createItem } from "../../utils/apiHelperFunctions";
import { searchItem } from "../../utils/apiHelperFunctions";

interface Props {
  handleClose: () => void;
}

export function AddRecipeModalComponent({ handleClose }: Props) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // States for recipe fields
  const [categories] = useState(meatCategories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    handleSubmit,
  } = useForm<Recipe>({
    resolver: yupResolver(recipeSchema),
    mode: "onBlur",
  });

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

  const clearState = (
    setState: React.Dispatch<React.SetStateAction<any>>,
    initialState: any
  ) => {
    setState(initialState);
  };

  const onSubmit = async (data: Recipe) => {
    let uploadedImageUrl = "";

    // Upload image if file selected
    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Image upload failed.");
        const uploadData = await response.json();
        uploadedImageUrl = uploadData.imageUrl;
        setImageUrl(uploadedImageUrl);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload image.");
        return;
      }
    }

    const updatedFormData = {
      recipeName: data.recipeName,
      description: data.description,
      image: uploadedImageUrl,
      ingredients: data.ingredients,
      time: data.time,
      categories: selectedCategories,
      recommendedPersonAmount: data.recommendedPersonAmount,
      author: "",
    };

    try {
      console.log("Recipe sent:", updatedFormData);
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      });
      if (res.ok) {
        clearState(setItems, []);
        handleClose();
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  const handleChangeCategories = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    trigger("categories");
    setSelectedCategories((prev) =>
      checked ? [...prev, value] : prev.filter((category) => category !== value)
    );
  };

  const removeItem = (ItemToRemove: Item) => {
    setItems(items.filter((Item) => Item.name !== ItemToRemove.name));
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg">
        <div className="flex justify-between items-center px-6 py-2 bg-lightgreyBackground rounded-t-lg">
          <h2 className="text-2xl font-bold">Tilføj ny opskrift</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="navn"
              >
                Navn
              </label>
              <input
                id="navn"
                type="text"
                {...register("recipeName")}
                onKeyUp={() => trigger("recipeName")}
                className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Indtast navn..."
              />
              {errors.recipeName && (
                <p className="text-red-500 text-xs">
                  {errors.recipeName.message}
                </p>
              )}
            </div>

            <div className="w-full">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="tid"
              >
                Tid (minutter)
              </label>
              <input
                id="tid"
                type="number"
                {...register("time")}
                onKeyUp={() => trigger("time")}
                className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Indtast tid..."
              />
              {errors.time && (
                <p className="text-red-500 text-xs">{errors.time.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="personer"
              >
                Antal personer
              </label>
              <input
                id="personer"
                type="number"
                {...register("recommendedPersonAmount")}
                onKeyUp={() => trigger("recommendedPersonAmount")}
                className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Indtast antal personer..."
              />
              {errors.recommendedPersonAmount && (
                <p className="text-red-500 text-xs">
                  {errors.recommendedPersonAmount.message}
                </p>
              )}
            </div>

            <div className="w-full">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="billede"
              >
                Billede
              </label>
              <ImageUploader onFileSelected={setImageFile} />
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="beskrivelse"
              >
                Beskrivelse
              </label>
              <textarea
                id="beskrivelse"
                placeholder="Skriv en beskrivelse..."
                {...register("description")}
                onKeyUp={() => trigger("description")}
                className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              ></textarea>
              {errors.description && (
                <p className="text-red-500 text-xs">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Kategorier
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center space-x-2 p-2 border rounded"
                  >
                    <input
                      type="checkbox"
                      value={category}
                      onChange={handleChangeCategories}
                      checked={selectedCategories.includes(category)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full">
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
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Gem opskrift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
