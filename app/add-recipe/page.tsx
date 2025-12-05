"use client";
import React, { useEffect, useRef, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Item } from "../model/Item";
import { Ingredient } from "../model/Ingredient";
import { Recipe } from "../model/Recipe";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { recipeSchema } from "../utils/validationSchema";
import ImageUploader from "../components/ImageUploader";
import { searchItem } from "../utils/apiHelperFunctions";
import { AddIngredientModal } from "../components/AddIngredientModal";
import { IngredientsList } from "../components/ShowIngrediens";
import ActionBtn from "../components/smallComponent/actionBtn";
import { useConstants } from "@/app/context/ConstantsContext";
import { toast } from "react-toastify";
import * as Yup from "yup";

function AddRecipePageContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // States for recipe fields
  const { categories, checkAndAddUnitType } = useConstants();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  type RecipeFormType = Yup.InferType<typeof recipeSchema>;

  const {
    register,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    handleSubmit,
  } = useForm<RecipeFormType>({
    resolver: yupResolver(recipeSchema),
    mode: "onBlur",
  });

  // Load recipe data from sessionStorage if coming from automatic mode
  useEffect(() => {
    const storedRecipeData = sessionStorage.getItem("addRecipe_data");
    if (storedRecipeData) {
      try {
        const data = JSON.parse(storedRecipeData);
        setRecipeData(data);
        sessionStorage.removeItem("addRecipe_data");
      } catch (e) {
        console.error("Failed to parse stored recipe data", e);
      }
    }
  }, []);

  // Load ingredients from sessionStorage when returning from add-ingredients
  useEffect(() => {
    const checkForReturnedIngredients = () => {
      const storedIngredients = sessionStorage.getItem("addIngredients_ingredients");
      if (storedIngredients) {
        try {
          const parsed = JSON.parse(storedIngredients);
          if (parsed && parsed.length > 0) {
            setIngredients(parsed);
            sessionStorage.removeItem("addIngredients_ingredients");
          }
        } catch (e) {
          console.error("Failed to parse stored ingredients", e);
        }
      }
    };
    
    checkForReturnedIngredients();
    const interval = setInterval(checkForReturnedIngredients, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Map ingredients and ensure all required fields are present
    const mappedIngredients = ingredients.map((ingredient: Ingredient) => {
      return {
        _id: ingredient._id || "unknown",
        item: {
          _id: ingredient.item._id || "unknown",
          name: ingredient.item.name || "Unknown",
          category: ingredient.item.category || "unknown",
          defaultUnit: ingredient.item.defaultUnit || ingredient.unit || "stk",
        },
        unit: ingredient.unit || "stk",
        marked: ingredient.marked || false,
        quantity: ingredient.quantity || 0,
        section: ingredient.section,
      };
    });

    setValue("ingredients", mappedIngredients, { shouldValidate: true });
  }, [ingredients, setValue]);

  // Sync imageUrl with form state
  useEffect(() => {
    setValue("image", imageUrl || "");
  }, [imageUrl, setValue]);

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return null;

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
        return uploadedImageUrl;
      } else {
        toast.error("Kunne ikke uploade billede");
        console.error("uploadData is null");
        return null;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  }

  const onSubmit = async (data: RecipeFormType) => {
    setIsSaving(true);
    try {
      const currentFormData = getValues();

      let finalIngredients =
        data.ingredients || currentFormData.ingredients || ingredients;

      if (!finalIngredients || finalIngredients.length === 0) {
        console.warn("No ingredients in form data, using ingredients state");
        finalIngredients = ingredients;
      }

      if (!finalIngredients || finalIngredients.length === 0) {
        toast.error(
          "Du skal tilføje mindst én ingrediens før opskriften kan gemmes."
        );
        setIsSaving(false);
        return;
      }

      const validIngredients = finalIngredients.map((ing: any) => ({
        _id: ing._id || "unknown",
        item: {
          _id: ing.item?._id || "unknown",
          name: ing.item?.name || "Unknown",
          category: ing.item?.category || "unknown",
          defaultUnit: ing.item?.defaultUnit || ing.unit || "stk",
        },
        unit: ing.unit || "stk",
        marked: ing.marked || false,
        quantity: ing.quantity || 0,
        section: ing.section,
      }));

      try {
        await checkAndAddUnitType(validIngredients as Ingredient[]);
      } catch (unitError) {
        console.warn(
          "Unit type sync failed, continuing with recipe submission:",
          unitError
        );
      }

      let finalImage = imageUrl || "";
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          toast.error("Billedet kunne ikke uploades.");
          setIsSaving(false);
          return;
        }
        finalImage = uploadedUrl;
        setValue("image", finalImage);
      }

      const updatedFormData = {
        ...data,
        ingredients: validIngredients,
        image: finalImage || "",
        categories: selectedCategories,
        author: "",
      };

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
        throw new Error(errorMessage);
      }

      const result = await res.json();
      toast.success("Opskriften blev gemt 🎉");
      router.push("/recipes");
    } catch (error) {
      console.error("Fejl i form submission:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Noget gik galt. Opskriften blev ikke gemt.";
      toast.error(errorMessage);
      setIsSaving(false);
    }
  };

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
    trigger();

    if (errors.ingredients) {
      const ingredientsError = errors.ingredients;
      if (ingredientsError.message) {
        toast.error(`Ingredienser: ${ingredientsError.message}`);
      } else if (
        Array.isArray(ingredientsError) &&
        ingredientsError.length > 0
      ) {
        const firstError = ingredientsError[0];
        toast.error(
          `Ingrediens fejl: ${firstError.message || "Ingredienser er ugyldige"}`
        );
      } else {
        toast.error("Der skal være mindst én ingrediens i opskriften.");
      }
      return;
    }

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
    setValue("recipeName", data.recipeName || "");
    setValue("description", data.description || "");
    setValue("time", data.time || 0);
    setValue("recommendedPersonAmount", data.recommendedPersonAmount || 0);

    if (data.image) {
      setImageUrl(data.image);
      setValue("image", data.image);
    } else {
      setImageUrl("");
      setValue("image", "");
    }

    if (data.categories) {
      setSelectedCategories(data.categories);
      setValue("categories", data.categories);
    } else {
      setSelectedCategories([]);
      setValue("categories", []);
    }

    if (data.ingredients && data.ingredients.length > 0) {
      const formattedIngredients = data.ingredients.map((ing: Ingredient) => ({
        _id: ing._id || null,
        item: {
          _id: ing.item?._id || null,
          name: ing.item?.name || "Unknown",
          category: ing.item?.category || "unknown",
          defaultUnit: ing.item?.defaultUnit || ing.unit || "stk",
        },
        unit: ing.unit || "stk",
        marked: ing.marked || false,
        quantity: ing.quantity || 0,
        section: ing.section,
      }));

      setIngredients(formattedIngredients as Ingredient[]);
      setValue("ingredients", formattedIngredients as Ingredient[], {
        shouldValidate: true,
      });
    } else {
      setIngredients([]);
      setValue("ingredients", [], { shouldValidate: true });
    }
  }

  return (
    <div className="w-full min-h-screen bg-lightBackground p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tilføj ny opskrift</h2>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 transition-all duration-150 cursor-pointer transform hover:scale-110 active:scale-95 active:opacity-80 p-1 rounded"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
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
                className="w-full p-3 border rounded-lg"
                placeholder="Indtast navn..."
              />
              {errors.recipeName && (
                <p className="text-red-500 text-xs">{errors.recipeName.message}</p>
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
                className="w-full p-3 border rounded-lg"
                placeholder="Indtast tid..."
              />
              {errors.time && (
                <p className="text-red-500 text-xs">{errors.time.message}</p>
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
                className="w-full p-3 border rounded-lg"
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
                <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>
              )}
              <input type="hidden" {...register("image")} />
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
                className="w-full p-3 border rounded-lg h-32"
              ></textarea>
              {errors.description && (
                <p className="text-red-500 text-xs">{errors.description.message}</p>
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
              onClickF={() => router.back()}
              Itext="Annuller"
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
    </div>
  );
}

export default function AddRecipePage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-lightBackground p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action mx-auto"></div>
          <p className="mt-4 text-gray-600">Indlæser...</p>
        </div>
      </div>
    }>
      <AddRecipePageContent />
    </Suspense>
  );
}

