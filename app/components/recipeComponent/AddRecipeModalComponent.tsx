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
import { AddIngredientModal } from "../AddIngredientModal";
import { IngredientsList } from "../ShowIngrediens";
import ActionBtn from "../smallComponent/actionBtn";

interface Props {
  handleClose: () => void;
}

export function AddRecipeModalComponent({ handleClose }: Props) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  function handleOnIngredientRemove(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

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
            <ActionBtn
              onClickF={() => setIsModalOpen(true)}
              Itext="Tilføj ingredienser"
              color="bg-action"
              hover="bg-actionHover"
              extraCSS="w-full"
            />

            {isModalOpen && (
              <AddIngredientModal
                onClose={() => setIsModalOpen(false)}
                ingredients={ingredients}
                setIngredients={setIngredients}
              />
            )}
          </div>
          <div>
            <IngredientsList
              ingredients={ingredients}
              onRemove={(index: number) => handleOnIngredientRemove(index)}
            />
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
