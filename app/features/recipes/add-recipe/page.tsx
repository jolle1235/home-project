"use client";
import React, { ClipboardEvent, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Control,
  useForm,
  UseFormRegister,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Recipe } from "../types/Recipe";
import { ScrapedRecipe } from "../types/ScrapedRecipe";
import { recipeSchema } from "../../../utils/validationSchema";
import { copyImageFromUrl, uploadImageFile } from "../../../utils/apiHelperFunctions";
import { Ingredient } from "../../../model/Ingredient";
import ImageUploader from "../../../components/ImageUploader";
import Button from "../../../components/Button";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import { useConstants } from "@/app/context/ConstantsContext";
import { IngredientEditor } from "../components/IngredientEditor";
import { RecipeImportBar } from "../components/RecipeImportBar";
import { useRecipeDraft } from "../hooks/useRecipeDraft";
import { EditorRow, rowsToIngredients } from "../utils/ingredientRows";
import {
  RecipeDraft,
  draftHasContent,
  emptyDraft,
  recipeToDraft,
  scrapedToDraft,
} from "../utils/recipeDraft";
import { tidyRecipeText } from "../utils/tidyRecipeText";

type RecipeFormType = Yup.InferType<typeof recipeSchema>;

const labelClass = "block text-gray-700 text-sm font-bold mb-2";

// Number inputs hold "" when empty; the schema turns "" into "missing".
function numberField(value: number): number {
  return value || ("" as unknown as number);
}

async function fetchRecipe(id: string): Promise<Recipe> {
  const response = await fetch(`/api/recipe/${id}`);
  if (!response.ok) throw new Error("Failed to fetch recipe");
  return response.json();
}

async function readError(res: Response, fallback: string): Promise<string> {
  const text = await res.text();
  try {
    return JSON.parse(text).error || fallback;
  } catch {
    return text || fallback;
  }
}

// Own component so typing in the description only re-renders this field,
// not the whole form and ingredient list.
function DescriptionField({
  control,
  register,
  setValue,
  error,
}: {
  control: Control<RecipeFormType>;
  register: UseFormRegister<RecipeFormType>;
  setValue: UseFormSetValue<RecipeFormType>;
  error?: string;
}) {
  const description = useWatch({ control, name: "description" }) ?? "";
  const rows = Math.min(30, Math.max(8, description.split("\n").length + 1));

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = e.clipboardData.getData("text");
    const tidy = tidyRecipeText(pasted);
    if (!pasted || tidy === pasted) return; // native paste already keeps line breaks
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart, selectionEnd, value } = el;
    const next = value.slice(0, selectionStart) + tidy + value.slice(selectionEnd);
    setValue("description", next, { shouldValidate: true });
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = selectionStart + tidy.length;
    });
  }

  return (
    <div>
      <label className={labelClass} htmlFor="beskrivelse">
        Beskrivelse
      </label>
      <textarea
        id="beskrivelse"
        placeholder={
          "Skriv fremgangsmåden – gerne ét trin pr. afsnit.\n\n1. Forvarm ovnen til 200 grader.\n\n2. …"
        }
        {...register("description")}
        onPaste={handlePaste}
        rows={rows}
        className="w-full p-3 border rounded-lg leading-relaxed [field-sizing:content] min-h-48 max-h-[70vh]"
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

interface RecipeFormProps {
  recipeId: string | null;
  recipe: Recipe | undefined;
}

function RecipeForm({ recipeId, recipe }: RecipeFormProps) {
  const [initialDraft] = useState(() =>
    recipe ? recipeToDraft(recipe) : emptyDraft(),
  );
  const router = useRouter();
  const queryClient = useQueryClient();
  const { categories, units, checkAndAddUnitType } = useConstants();
  const unitNames = useMemo(() => units.map((u) => u.name), [units]);

  const [rows, setRows] = useState<EditorRow[]>(initialDraft.rows);
  const rowsRef = useRef(initialDraft.rows);
  const authorRef = useRef(initialDraft.author);
  const [imageFile, setImageFile] = useState<File | null>(null);
  // Bumped to remount the image picker when the image is replaced.
  const [imageKey, setImageKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [pendingImport, setPendingImport] = useState<ScrapedRecipe | null>(null);

  const { savedDraft, dismissSavedDraft, scheduleSave, clearDraft, isDirty } =
    useRecipeDraft(recipeId);

  const {
    register,
    control,
    formState: { errors },
    getValues,
    setValue,
    handleSubmit,
    subscribe,
    clearErrors,
  } = useForm<RecipeFormType>({
    resolver: yupResolver(recipeSchema),
    mode: "onBlur",
    defaultValues: {
      recipeName: initialDraft.recipeName,
      description: initialDraft.description,
      time: numberField(initialDraft.time),
      recommendedPersonAmount: numberField(initialDraft.recommendedPersonAmount),
      image: initialDraft.image,
      sourceUrl: initialDraft.sourceUrl,
      categories: initialDraft.categories,
      ingredients: [],
      author: initialDraft.author,
    },
  });

  const selectedCategories = useWatch({ control, name: "categories" }) ?? [];
  const image = useWatch({ control, name: "image" }) ?? "";

  const buildDraft = useCallback((): RecipeDraft => {
    const values = getValues();
    return {
      recipeName: values.recipeName ?? "",
      description: values.description ?? "",
      time: Number(values.time) || 0,
      recommendedPersonAmount: Number(values.recommendedPersonAmount) || 0,
      image: values.image ?? "",
      sourceUrl: values.sourceUrl ?? "",
      categories: values.categories ?? [],
      rows: rowsRef.current,
      author: authorRef.current,
    };
  }, [getValues]);

  // Autosave to localStorage whenever a form field changes.
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: () => scheduleSave(buildDraft),
      }),
    [subscribe, scheduleSave, buildDraft],
  );

  // The only writer of rows: keeps the ref (read by the debounced draft
  // save) in step with state.
  const updateRows = (next: EditorRow[]) => {
    rowsRef.current = next;
    setRows(next);
    scheduleSave(buildDraft);
  };

  function fillForm(draft: RecipeDraft) {
    setValue("recipeName", draft.recipeName);
    setValue("description", draft.description);
    setValue("time", numberField(draft.time));
    setValue("recommendedPersonAmount", numberField(draft.recommendedPersonAmount));
    setValue("image", draft.image);
    setValue("sourceUrl", draft.sourceUrl);
    setValue("categories", draft.categories);
    authorRef.current = draft.author;
    updateRows(draft.rows);
    setImageFile(null);
    setImageKey((key) => key + 1);
    clearErrors();
  }

  function applyImport(scraped: ScrapedRecipe) {
    const draft = scrapedToDraft(scraped, {
      units: unitNames,
      categories: categories.map((c) => c.name),
    });
    fillForm(draft);
  }

  function handleImported(scraped: ScrapedRecipe) {
    if (draftHasContent(buildDraft())) setPendingImport(scraped);
    else applyImport(scraped);
  }

  function handleImportFailed(url: string) {
    if (!getValues("sourceUrl")) {
      setValue("sourceUrl", url, { shouldValidate: true });
    }
  }

  function restoreDraft() {
    if (!savedDraft) return;
    fillForm(savedDraft);
    dismissSavedDraft();
  }

  function discardDraft() {
    // If the user already typed, storage holds the new work; keep it.
    if (isDirty()) dismissSavedDraft();
    else clearDraft();
  }

  function handleImageSelected(file: File | null) {
    setImageFile(file);
    if (!file) setValue("image", "");
    scheduleSave(buildDraft);
  }

  const handleChangeCategories = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const current = getValues("categories") ?? [];
    setValue(
      "categories",
      checked ? [...current, value] : current.filter((c) => c !== value),
      { shouldValidate: true },
    );
  };

  // Uploads a picked file, or copies a remote (imported) image into our
  // own image store so it doesn't depend on the source site. The result is
  // kept in the form, so a retry after a failed save doesn't upload again.
  async function resolveImage(current: string): Promise<string | null> {
    if (imageFile) {
      try {
        const url = await uploadImageFile(imageFile);
        setValue("image", url);
        setImageFile(null);
        return url;
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Billedet kunne ikke uploades.");
        return null;
      }
    }
    if (/^https?:\/\//i.test(current)) {
      try {
        const url = await copyImageFromUrl(current);
        setValue("image", url);
        return url;
      } catch (error) {
        console.error("Error copying image:", error);
        toast.warning("Billedet kunne ikke hentes – opskriften gemmes uden billede.");
        return "";
      }
    }
    return current;
  }

  const onSubmit = async (data: RecipeFormType, ingredients: Ingredient[]) => {
    setIsSaving(true);
    try {
      const [, finalImage] = await Promise.all([
        ingredients.length > 0 &&
          checkAndAddUnitType(ingredients).catch((unitError) =>
            console.warn(
              "Unit type sync failed, continuing with recipe submission:",
              unitError,
            ),
          ),
        resolveImage(data.image || ""),
      ]);
      if (finalImage === null) {
        setIsSaving(false);
        return;
      }

      const payload = {
        ...data,
        ingredients,
        image: finalImage,
        sourceUrl: (data.sourceUrl || "").trim(),
        categories: data.categories ?? [],
        author: authorRef.current,
        ...(recipeId ? { _id: recipeId } : {}),
      };

      const res = await fetch("/api/recipe", {
        method: recipeId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(
          await readError(
            res,
            recipeId
              ? "Opskriften kunne ikke opdateres."
              : "Opskriften kunne ikke gemmes.",
          ),
        );
      }

      clearDraft();
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
      if (recipeId) {
        queryClient.removeQueries({ queryKey: ["recipe", recipeId] });
      }
      toast.success(
        recipeId ? "Opskriften blev opdateret 🎉" : "Opskriften blev gemt 🎉",
      );
      router.push("/recipes");
    } catch (error) {
      console.error("Fejl i form submission:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Noget gik galt. Opskriften blev ikke gemt.",
      );
      setIsSaving(false);
    }
  };

  const onError = (formErrors: typeof errors) => {
    console.error("Form validation errors:", formErrors);
    if (formErrors.ingredients) {
      toast.error(
        formErrors.ingredients.message
          ? `Ingredienser: ${formErrors.ingredients.message}`
          : "Tjek ingredienserne – en af dem er ugyldig.",
      );
      return;
    }
    const messages = Object.values(formErrors)
      .map((error) => (error as { message?: string })?.message)
      .filter(Boolean)
      .join(", ");
    toast.error(
      messages
        ? `Valideringsfejl: ${messages}`
        : "Venligst udfyld alle påkrævede felter korrekt.",
    );
  };

  const submit = (e: React.BaseSyntheticEvent) => {
    // Ingredients live in the editor; hand them to the form for validation.
    const ingredients = rowsToIngredients(rowsRef.current);
    setValue("ingredients", ingredients as RecipeFormType["ingredients"]);
    return handleSubmit((data) => onSubmit(data, ingredients), onError)(e);
  };

  const handleDeleteRecipe = async () => {
    if (!recipeId) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/recipe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: recipeId }),
      });

      if (!res.ok) {
        throw new Error(await readError(res, "Opskriften kunne ikke slettes."));
      }

      clearDraft();
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Opskriften blev slettet");
      router.push("/recipes");
    } catch (error) {
      console.error("Fejl ved sletning af opskrift:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Noget gik galt. Opskriften blev ikke slettet.",
      );
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty()) setShowCancelDialog(true);
    else router.back();
  };

  const ingredientError = errors.ingredients?.message;

  return (
    <div className="w-full min-h-screen bg-background px-4 pt-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {recipeId ? "Rediger opskrift" : "Tilføj ny opskrift"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={handleCancel}
            aria-label="Luk"
            className="w-10 h-10 p-0"
          >
            ✕
          </Button>
        </div>

        {savedDraft && (
          <div
            role="status"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-soft p-3"
          >
            <p className="text-sm text-foreground">
              Du har en ikke-gemt kladde
              {savedDraft.recipeName ? ` af "${savedDraft.recipeName}"` : ""}.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={discardDraft}>
                Kassér
              </Button>
              <Button size="sm" onClick={restoreDraft}>
                Gendan kladde
              </Button>
            </div>
          </div>
        )}

        <RecipeImportBar
          collapsed={Boolean(recipeId)}
          onImported={handleImported}
          onFailed={handleImportFailed}
        />

        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="w-full md:col-span-2">
              <label className={labelClass} htmlFor="navn">
                Navn
              </label>
              <input
                id="navn"
                type="text"
                {...register("recipeName")}
                className="w-full p-3 border rounded-lg"
                placeholder="Indtast navn..."
              />
              {errors.recipeName && (
                <p className="text-red-500 text-xs">{errors.recipeName.message}</p>
              )}
            </div>

            <div className="w-full">
              <label className={labelClass} htmlFor="tid">
                Tid (minutter)
              </label>
              <input
                id="tid"
                type="number"
                inputMode="numeric"
                {...register("time")}
                className="w-full p-3 border rounded-lg"
                placeholder="Indtast tid..."
              />
              {errors.time && (
                <p className="text-red-500 text-xs">{errors.time.message}</p>
              )}
            </div>

            <div className="w-full">
              <label className={labelClass} htmlFor="personer">
                Antal personer
              </label>
              <input
                id="personer"
                type="number"
                inputMode="numeric"
                {...register("recommendedPersonAmount")}
                className="w-full p-3 border rounded-lg"
                placeholder="Indtast antal personer..."
              />
              {errors.recommendedPersonAmount && (
                <p className="text-red-500 text-xs">
                  {errors.recommendedPersonAmount.message}
                </p>
              )}
            </div>

            <div className="w-full md:col-span-2">
              <label className={labelClass} htmlFor="kilde-link">
                Kilde-link
              </label>
              <input
                id="kilde-link"
                type="url"
                inputMode="url"
                {...register("sourceUrl")}
                className="w-full p-3 border rounded-lg"
                placeholder="https://..."
              />
              {errors.sourceUrl && (
                <p className="text-red-500 text-xs">{errors.sourceUrl.message}</p>
              )}
            </div>

            <div className="w-full">
              <label className={labelClass} htmlFor="billede">
                Billede
              </label>
              <ImageUploader
                key={imageKey}
                onFileSelected={handleImageSelected}
                initialPreview={image}
              />
              {errors.image && (
                <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>
              )}
            </div>

            <div>
              <span className={labelClass}>Kategorier</span>
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

          <IngredientEditor
            rows={rows}
            onChange={updateRows}
            units={unitNames}
            error={ingredientError}
          />

          <DescriptionField
            control={control}
            register={register}
            setValue={setValue}
            error={errors.description?.message}
          />

          <div className="sticky bottom-0 z-10 -mx-4 flex items-center gap-2 border-t border-secondary/30 bg-background/95 px-4 py-3 backdrop-blur">
            {recipeId && (
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="secondary"
                size="lg"
                disabled={isSaving}
              >
                Slet
              </Button>
            )}
            <div className="flex flex-1 justify-end gap-2">
              <Button
                onClick={handleCancel}
                variant="secondary"
                size="lg"
                disabled={isSaving}
              >
                Annuller
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSaving}
                loadingText="Gemmer…"
              >
                {recipeId ? "Opdater opskrift" : "Gem opskrift"}
              </Button>
            </div>
          </div>
        </form>

        <ConfirmationDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteRecipe}
          title="Slet opskrift"
          message="Er du sikker på, at du vil slette denne opskrift? Denne handling kan ikke fortrydes."
        />
        <ConfirmationDialog
          open={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={() => {
            clearDraft();
            router.back();
          }}
          title="Kassér ændringer?"
          message="Du har ændringer der ikke er gemt. Vil du kassere dem?"
        />
        <ConfirmationDialog
          open={pendingImport !== null}
          onClose={() => setPendingImport(null)}
          onConfirm={() => {
            if (pendingImport) applyImport(pendingImport);
          }}
          title="Erstat indhold?"
          message="Importen erstatter det, du allerede har skrevet i formularen."
        />
      </div>
    </div>
  );
}

function Spinner({ text }: { text: string }) {
  return (
    <div className="w-full min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action mx-auto"></div>
        <p className="mt-4 text-gray-600">{text}</p>
      </div>
    </div>
  );
}

function AddRecipePageContent() {
  const router = useRouter();
  const recipeId = useSearchParams().get("id");

  const { data: recipe, isError, isFetchedAfterMount } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => fetchRecipe(recipeId!),
    enabled: Boolean(recipeId),
    staleTime: 0,
  });

  // The form reads the recipe only when it mounts, so wait for fresh data
  // rather than showing a cached copy that is then refetched.
  if (recipeId && !isFetchedAfterMount) {
    return <Spinner text="Indlæser opskrift..." />;
  }

  if (recipeId && (isError || !recipe)) {
    return (
      <div className="w-full min-h-screen bg-background p-4 flex flex-col items-center justify-center gap-4">
        <p className="text-foreground">Kunne ikke indlæse opskriften til redigering.</p>
        <Button variant="secondary" onClick={() => router.back()}>
          Tilbage
        </Button>
      </div>
    );
  }

  return (
    <RecipeForm
      // Remount (and re-initialise) when switching between recipes.
      key={recipeId ?? "new"}
      recipeId={recipeId}
      recipe={recipe}
    />
  );
}

export default function AddRecipePage() {
  return (
    <Suspense fallback={<Spinner text="Indlæser..." />}>
      <AddRecipePageContent />
    </Suspense>
  );
}
