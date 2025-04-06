"use client"
import React, { useEffect, useRef, useState } from "react";
import { meatCategories } from "../constant/recipeCategories";
import { Item } from "../model/Item";
import { Ingredient } from "../model/Ingredient";
import SearchBar from "./SearchBarComponent";
import { Recipe } from "../model/Recipe";
import { AddIngredientComponent } from "./AddIngredientComponent";
import VisibilityToggle from "./smallComponent/VisibilityToggleComponent";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { recipeSchema } from "../utils/validationSchema";
import ImageUploader from "./ImageUploader";
import { createItem } from "../utils/apiHelperFunctions";
import { searchItem } from "../utils/apiHelperFunctions";
import { useSession } from "next-auth/react";


export function AddRecipeModalComponent(handleClose: () => void) {
  const { data: session } = useSession();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // States for recipe fields
  const [categories] = useState(meatCategories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [isPublic, setIsPublic] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>('');
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
    mode: "onChange",
  });

  useEffect(() => {
    setValue(
      "ingredients",
      ingredients.map((ingredient: Ingredient) => ({
      _id: 0,
        item: ingredient.item,
        unit: ingredient.unit,
        marked: ingredient.marked,
        quantity: ingredient.quantity, 
      }))
    );
    if (errors.ingredients) {
      trigger("ingredients");
    }
  }, [items, setValue, trigger, errors.ingredients]);
  

  const clearState = (setState: React.Dispatch<React.SetStateAction<any>>, initialState: any) => {
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
      recipeId: null,
      recipeName: data.recipeName,
      description: data.description,
      image: uploadedImageUrl,
      ingredients: data.ingredients,
      time: data.time,
      categories: selectedCategories,
      recommendedPersonAmount: data.recommendedPersonAmount,
      isPublic: isPublic,
      author: session?.user.name,
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
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed overflow-y-auto inset-0 flex items-center justify-center bg-darkText bg-opacity-50">
      <div className="flex flex-col w-full max-w-4xl bg-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-start py-2">
          <h2 className="text-lg font-bold text-darkText mb-4">Tilføj en opskrift</h2>
          <button onClick={handleClose} className="rounded-full font-bold">
            <img src="/icon/remove_button.png" alt="remove_ingresdiens" className="w-6 h-6" />
      </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit, (errors) => console.log("Validation errors:", errors))}>
          {/* Container for two columns, responsive with flexbox */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Right Column: Most fields and Item search */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div>
                <label className="font-bold">Opskrifts Navn</label>
                <input
                  type="text"
                  className="w-full rounded-lg p-1"
                  {...register("recipeName")}
                  onKeyUp={() => trigger("recipeName")}
                />
                {errors.recipeName && <p className="text-red-500 text-xs">{errors.recipeName.message}</p>}
              </div>

              <div>
                <label className="font-bold">Billede</label>
                <ImageUploader onFileSelected={setImageFile} />
      </div>

              <div className="flex flex-row space-x-2">
                <div>
                  <label className="font-bold">Tid (min.)</label>
        <input
          type="number"
                    className="w-full rounded-lg p-1"
                    {...register("time")}
                    onKeyUp={() => trigger("time")}
                    />
                  {errors.time && <p className="text-red-500 text-xs">{errors.time.message}</p>}
                </div>
                <div>
                  <label className="font-bold">Antal personer:</label>
                  <input
                    type="number"
                    className="w-full rounded-lg p-1"
                    {...register("recommendedPersonAmount")}
                    onKeyUp={() => trigger("recommendedPersonAmount")}
        />
                  {errors.recommendedPersonAmount && <p className="text-red-500 text-xs">{errors.recommendedPersonAmount.message}</p>}
                </div>
      </div>

              <div>
                <label className="font-bold">Kategorier</label>
                <div className="flex flex-wrap gap-2">
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
              </div>
              <VisibilityToggle booleanValue={isPublic} setBooleanValue={setIsPublic} />
      </div>

            
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="beskrivelse">
                Beskrivelse
              </label>
              <textarea
                id="beskrivelse"
                placeholder="Skriv en beskrivelse..."
                {...register("description")}
                onKeyUp={() => trigger("description")}
                className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              ></textarea>
                {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
          </div>

              <div ref={searchBarRef} className="relative">
                <label className="font-bold">Ingredienser</label>
                <SearchBar onChange={setSearchTerm} placeholder="Søg efter ingredienser..." />
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                    {searchTerm.trim() && (
                      <div className="hover:bg-gray-100 cursor-pointer bg-gray-50 p-2">
                        <AddIngredientComponent
                          onAdd={async (returnItem) => {
                            const newItem: Ingredient = returnItem
                            await createItem(newItem);
                            setIngredients((prev) => [...prev, returnItem]);
                            setSearchTerm("");
                          }}
                          itemName={searchTerm}
                        />
                      </div>
                    )}
                    {items.map((item) => (
                      <div key={item.name} className="p-2 hover:bg-gray-100 cursor-pointer">
                        <AddIngredientComponent
                          onAdd={async (newItem) => {
                            setIngredients((prev) => [...prev, newItem]);
                            setSearchTerm("");
                          }}
                          itemName={item.name}
                          InputCategory={`${item.category}`}
                        />
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
                      <div key={ingredient.item.name} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                        <p className="w-1/2">{ingredient.item.name}</p>
                        <p>
                          {ingredient.quantity} {ingredient.unit}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem({_id: ingredient.item._id, name: ingredient.item.name, category: ingredient.item.category })}
                          className="text-red-500 hover:text-red-700"
                        >
                          <img src="/icon/remove_button.png" alt="remove_Item" className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
        </div>
      )}
            </div>
          </div>

          <button
            type="submit"
            className="bg-action hover:bg-actionHover text-darkText w-full rounded-lg p-2 mt-4"
          >
            Tilføj opskrift
          </button>
    </form>
      </div>
    </div>
  );
};
