"use client";
import React, { useEffect, useRef, useState } from "react";
import { Item } from "../../model/Item";
import { Ingredient } from "../../model/Ingredient";
import { Recipe } from "../../model/Recipe";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { recipeSchema } from "../../utils/validationSchema";
import ImageUploader from "../ImageUploader";
import { searchItem } from "../../utils/apiHelperFunctions";
import { AddIngredientModal } from "../AddIngredientModal";
import { IngredientsList } from "../ShowIngrediens";
import ActionBtn from "../smallComponent/actionBtn";
import { WebLinkInput } from "../WebLinkInput";
import { useConstants } from "@/app/context/ConstantsContext";
import { toast } from "react-toastify";

interface Props {
  handleClose: () => void;
}

export function AddRecipeModalComponent({ handleClose }: Props) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manuelSetup, setManuelSetup] = useState(false);

  // States for recipe fields
  const { categories, checkAndAddUnitType } = useConstants();
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

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return null; // no file selected → just skip

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Image upload failed.");

      const uploadData = await response.json();
      if (uploadData) {
        const uploadedImageUrl = uploadData.imageUrl;
        setImageUrl(uploadedImageUrl);
        return uploadedImageUrl; // ✅ success
      } else {
        toast.error("Kunne ikke uploade billede");
        console.error("uploadData is null");
        return null;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return null; // ✅ signal failure
    }
  }

  const onSubmit = async (data: Recipe) => {
    try {
      // Step 1: Sync unit types
      await checkAndAddUnitType(ingredients);

      // Step 2: Determine final image
      let finalImage = imageUrl; // default to current preview/scraped image
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          toast.error("Billedet kunne ikke uploades.");
          return; // stop submission
        }
        finalImage = uploadedUrl;
        setValue("image", finalImage);
      }

      // Step 3: Prepare final payload
      const updatedFormData = {
        ...data,
        image: finalImage,
        categories: selectedCategories,
        author: "",
      };

      // Step 4: Submit recipe
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      });

      if (!res.ok) throw new Error("Opskriften kunne ikke gemmes.");

      toast.success("Opskriften blev gemt 🎉");
      clearState(setItems, []);
      handleClose();
    } catch (error) {
      console.error("Fejl i form submission:", error);
      toast.error("Noget gik galt. Opskriften blev ikke gemt.");
    }
  };

  const handleChangeCategories = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    trigger("categories");
    setSelectedCategories((prev) =>
      checked ? [...prev, value] : prev.filter((category) => category !== value)
    );
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

  async function setRecipeData(data: Recipe) {
    // Basic fields
    setValue("recipeName", data.recipeName || "");
    setValue("description", data.description || "");
    setValue("time", data.time || 0);
    setValue("recommendedPersonAmount", data.recommendedPersonAmount || 0);

    // Image
    if (data.image) {
      setImageUrl(data.image); // preview
      setValue("image", data.image); // form value
    }

    // Categories
    if (data.categories) {
      setSelectedCategories(data.categories);
      setValue("categories", data.categories);
    }

    // Ingredients
    if (data.ingredients) {
      setIngredients(data.ingredients);
      setValue("ingredients", data.ingredients);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg">
        <div className="flex justify-between items-center px-6 py-2 bg-lightgreyBackground rounded-t-lg">
          <h2 className="text-2xl font-bold">Tilføj ny opskrift</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-all duration-150 cursor-pointer transform hover:scale-110 active:scale-95 active:opacity-80 p-1 rounded"
          >
            ✕
          </button>
        </div>
        {!manuelSetup && (
          <div>
            <div className="flex flex-col items-center">
              <label className="block text-gray-700 font-bold my-1 text-2xl">
                Automatisk
              </label>
              <WebLinkInput
                onScraped={(data) => {
                  setRecipeData(data);
                  setManuelSetup(true);
                }}
              ></WebLinkInput>
            </div>

            <div className="w-full flex justify-center items-center">
              <ActionBtn
                onClickF={() => setManuelSetup(true)}
                Itext="Opret Manuelt"
                extraCSS="w-full"
              />
            </div>
          </div>
        )}
        {manuelSetup && (
          <div className="flex flex-col items-center p-3 w-full max-w-4xl max-h-[75vh] overflow-y-auto">
            <label className="block text-gray-700 font-bold mb-2 m-1 text-2xl">
              Manuel
            </label>
            <form onSubmit={handleSubmit(onSubmit)} className="">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    className="w-full"
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
                    className="w-full"
                    placeholder="Indtast tid..."
                  />
                  {errors.time && (
                    <p className="text-red-500 text-xs">
                      {errors.time.message}
                    </p>
                  )}
                </div>

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
                    className="w-full"
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
                  <ImageUploader
                    onFileSelected={setImageFile}
                    initialPreview={imageUrl}
                  />
                </div>
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
                    className="w-full h-32"
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
                        key={category._id}
                        className="flex items-center space-x-2 p-2 border rounded"
                      >
                        <input
                          type="checkbox"
                          value={category.name}
                          onChange={handleChangeCategories}
                          checked={selectedCategories.includes(category.name)}
                          className="form-checkbox h-5 w-5"
                        />
                        <span>{category.name}</span>
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
                <ActionBtn
                  onClickF={handleClose}
                  Itext="Anuller"
                  color="bg-cancel"
                  hover="bg-cancelHover"
                />
                <ActionBtn
                  type="submit"
                  Itext="Gem opskrift"
                  color="bg-action"
                  hover="bg-actionHover"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
