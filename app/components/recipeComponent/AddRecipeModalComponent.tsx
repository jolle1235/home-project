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
  onRecipeSaved?: () => void;
}

export function AddRecipeModalComponent({ handleClose, onRecipeSaved }: Props) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manuelSetup, setManuelSetup] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    // Map ingredients and ensure all required fields are present
    const mappedIngredients = ingredients.map((ingredient: Ingredient) => {
      // Ensure all required fields are present and valid
      return {
        _id: ingredient._id || "unknown",
        item: {
          _id: ingredient.item._id || "unknown",
          name: ingredient.item.name || "",
          category: ingredient.item.category || "unknown",
          defaultUnit: ingredient.item.defaultUnit || ingredient.unit || "",
        },
        unit: ingredient.unit || "",
        marked: ingredient.marked || false,
        quantity: ingredient.quantity || 0,
        section: ingredient.section,
      };
    });

    console.log("Setting ingredients in form:", {
      ingredientsCount: ingredients.length,
      mappedIngredientsCount: mappedIngredients.length,
      mappedIngredients: mappedIngredients,
    });

    setValue("ingredients", mappedIngredients, { shouldValidate: true });
  }, [ingredients, setValue]);

  // Sync imageUrl with form state
  useEffect(() => {
    setValue("image", imageUrl || "");
  }, [imageUrl, setValue]);

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
    setIsSaving(true);
    try {
      // Get current form values to ensure we have the latest data
      const currentFormData = getValues();
      console.log("Starting recipe submission...", { 
        formData: data, 
        currentFormData,
        ingredientsState: ingredients, 
        imageUrl, 
        imageFile: !!imageFile 
      });
      
      // Ensure we have ingredients - use state if form data doesn't have them
      let finalIngredients = data.ingredients || currentFormData.ingredients || ingredients;
      
      // If ingredients are empty or invalid, check the state
      if (!finalIngredients || finalIngredients.length === 0) {
        console.warn("No ingredients in form data, using ingredients state");
        finalIngredients = ingredients;
      }

      // Validate ingredients exist
      if (!finalIngredients || finalIngredients.length === 0) {
        toast.error("Du skal tilføje mindst én ingrediens før opskriften kan gemmes.");
        setIsSaving(false);
        return;
      }

      // Ensure all ingredients have required fields
      const validIngredients = finalIngredients.map((ing: any) => ({
        _id: ing._id || "unknown",
        item: {
          _id: ing.item?._id || "unknown",
          name: ing.item?.name || "",
          category: ing.item?.category || "unknown",
          defaultUnit: ing.item?.defaultUnit || ing.unit || "",
        },
        unit: ing.unit || "",
        marked: ing.marked || false,
        quantity: ing.quantity || 0,
        section: ing.section,
      }));

      console.log("Validated ingredients:", validIngredients);
      
      // Step 1: Sync unit types
      try {
        await checkAndAddUnitType(validIngredients as Ingredient[]);
      } catch (unitError) {
        console.warn("Unit type sync failed, continuing with recipe submission:", unitError);
        // Continue with submission even if unit sync fails
      }

      // Step 2: Determine final image
      let finalImage = imageUrl || ""; // default to current preview/scraped image or empty string
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          toast.error("Billedet kunne ikke uploades.");
          setIsSaving(false);
          return; // stop submission
        }
        finalImage = uploadedUrl;
        setValue("image", finalImage);
      }

      // Step 3: Prepare final payload
      const updatedFormData = {
        ...data,
        ingredients: validIngredients,
        image: finalImage || "", // Ensure image is always a string
        categories: selectedCategories,
        author: "",
      };

      console.log("Submitting recipe data:", updatedFormData);

      // Step 4: Submit recipe
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Opskriften kunne ikke gemmes.";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        console.error("Recipe submission failed:", res.status, res.statusText, errorMessage);
        throw new Error(errorMessage);
      }

      const result = await res.json();
      console.log("Recipe saved successfully:", result);

      toast.success("Opskriften blev gemt 🎉");
      clearState(setItems, []);

      // Trigger refresh callback if provided
      if (onRecipeSaved) {
        onRecipeSaved();
      }

      handleClose();
    } catch (error) {
      console.error("Fejl i form submission:", error);
      const errorMessage = error instanceof Error ? error.message : "Noget gik galt. Opskriften blev ikke gemt.";
      toast.error(errorMessage);
      // Don't close modal on error - let user see the error and try again
      setIsSaving(false);
    }
  };

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
    console.log("Current form values:", getValues());
    console.log("Current ingredients state:", ingredients);
    
    // Trigger validation for all fields to show errors
    trigger();
    
    // Check specifically for ingredients error
    if (errors.ingredients) {
      const ingredientsError = errors.ingredients;
      if (ingredientsError.message) {
        toast.error(`Ingredienser: ${ingredientsError.message}`);
      } else if (Array.isArray(ingredientsError) && ingredientsError.length > 0) {
        const firstError = ingredientsError[0];
        toast.error(`Ingrediens fejl: ${firstError.message || "Ingredienser er ugyldige"}`);
      } else {
        toast.error("Der skal være mindst én ingrediens i opskriften.");
      }
      return;
    }
    
    // Show toast with validation errors
    const errorMessages = Object.values(errors)
      .map((error: any) => error?.message)
      .filter(Boolean)
      .join(", ");
    if (errorMessages) {
      toast.error(`Valideringsfejl: ${errorMessages}`);
    } else {
      toast.error("Venligst udfyld alle påkrævede felter korrekt.");
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
    } else {
      setImageUrl("");
      setValue("image", "");
    }

    // Categories
    if (data.categories) {
      setSelectedCategories(data.categories);
      setValue("categories", data.categories);
    } else {
      setSelectedCategories([]);
      setValue("categories", []);
    }

    // Ingredients - ensure they're properly formatted
    if (data.ingredients && data.ingredients.length > 0) {
      // Format ingredients to ensure all required fields are present
      const formattedIngredients = data.ingredients.map((ing: Ingredient) => ({
        _id: ing._id || "unknown",
        item: {
          _id: ing.item?._id || "unknown",
          name: ing.item?.name || "",
          category: ing.item?.category || "unknown",
          defaultUnit: ing.item?.defaultUnit || ing.unit || "",
        },
        unit: ing.unit || "",
        marked: ing.marked || false,
        quantity: ing.quantity || 0,
        section: ing.section,
      }));
      
      console.log("Setting recipe data - formatted ingredients:", formattedIngredients);
      setIngredients(formattedIngredients as Ingredient[]);
      // The useEffect will sync these to the form, but we can also set them directly
      setValue("ingredients", formattedIngredients, { shouldValidate: true });
    } else {
      setIngredients([]);
      setValue("ingredients", [], { shouldValidate: true });
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
            <form onSubmit={handleSubmit(onSubmit, onError)} className="">
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
                  {errors.image && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.image.message}
                    </p>
                  )}
                  <input
                    type="hidden"
                    {...register("image")}
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
                {errors.ingredients && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(
                      (errors as any).ingredients?.message ||
                        "Der mangler ingredienser"
                    )}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <ActionBtn
                  onClickF={handleClose}
                  Itext="Anuller"
                  color="bg-cancel"
                  hover="bg-cancelHover"
                  extraCSS={isSaving ? "opacity-50 cursor-not-allowed" : ""}
                />
                <ActionBtn
                  type="submit"
                  Itext="Gem opskrift"
                  color="bg-action"
                  hover="bg-actionHover"
                  isLoading={isSaving}
                  loadingText="Gemmer..."
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
