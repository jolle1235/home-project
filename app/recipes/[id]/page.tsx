"use client";
import { useEffect, useState } from "react";
import { Recipe } from "../../model/Recipe";
import { Ingredient } from "../../model/Ingredient";
import { maxRecipePersons } from "../../utils/validationVariables";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useShoppingList } from "../../hooks/useShoppinglist";
import { toast } from "react-toastify";
import Button from "../../components/smallComponent/Button";
import { ArrowLeft, Clock, Edit2, Minus, Plus, Users } from "lucide-react";
import { IconButton } from "@/app/components/IconButton";

export default function RecipeDetailsPage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoadingRecipe, setIsLoadingRecipes] = useState(true);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendedPersonAmount, setRecommendedPersonAmount] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    new Set(),
  );
  const params = useParams();
  const { addIngredients } = useShoppingList();

  const toggleCheckedIngredient = (index: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      const key = String(index);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Fetch recipes
  useEffect(() => {
    const fetchRecipe = async () => {
      // Ensure we have a valid ID
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      console.log(id);

      if (!id) {
        setError("No recipe ID provided");
        console.log("ERROR fetch recipe id");
        setIsLoadingRecipes(false);
        return;
      }

      setIsLoadingRecipes(true);
      try {
        console.log(`Fetching recipe with ID: ${id}`);
        const response = await fetch(`/api/recipe/${id}`); // Note: changed to plural

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch recipe: ${errorText}`);
        }

        const data = await response.json();
        console.log("Fetched recipe data:", data);
        setRecipe(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    fetchRecipe();
  }, [params.id]);

  useEffect(() => {
    if (recipe?.recommendedPersonAmount) {
      setRecommendedPersonAmount(recipe.recommendedPersonAmount);
    }
    if (recipe?.ingredients?.length) {
      setCheckedIngredients(
        new Set(recipe.ingredients.map((_, index) => String(index))),
      );
    }
  }, [recipe]);

  if (isLoadingRecipe)
    return (
      <div className="w-full py-12 text-center text-muted-foreground">
        Indlæser opskrift...
      </div>
    );
  if (error)
    return <div className="w-full py-12 text-center text-red-600">{error}</div>;

  const recipeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const scalingFactor = recipe
    ? recommendedPersonAmount / (recipe.recommendedPersonAmount || 1)
    : 1;

  const handleAddCheckedToShoppingList = () => {
    if (!recipe?.ingredients?.length) return;
    setIsAddingToList(true);
    const toAdd: Ingredient[] = recipe.ingredients
      .filter((_, i) => checkedIngredients.has(String(i)))
      .map((ing) => {
        const hasAmount = ing.quantity != null && ing.quantity > 0;
        const quantity = hasAmount
          ? parseFloat((ing.quantity * scalingFactor).toFixed(1))
          : 1;
        const unit = hasAmount && ing.unit ? ing.unit : "stk";
        return {
          ...ing,
          _id: crypto.randomUUID(),
          marked: false,
          quantity,
          unit,
        };
      });
    if (toAdd.length === 0) {
      toast.info("Vælg mindst én ingrediens.");
      return;
    }
    addIngredients(toAdd);
    toast.success(
      `${toAdd.length} ingrediens${toAdd.length === 1 ? "" : "er"} tilføjet til indkøbslisten`,
    );
    setIsAddingToList(false);
  };

  return (
    <div className="w-full bg-background">
      <div className="mx-auto w-full max-w-4xl p-2 sm:px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column: image, title, meta, ingredients */}
          <div className="flex flex-col md:w-1/2 w-full gap-4">
            {/* Hero card */}
            <section className="bg-surface rounded-2xl shadow-sm overflow-hidden">
              <div className="relative w-full h-56 sm:h-64">
                <Image
                  className="object-cover"
                  src={recipe?.image || "/fallback.jpg"}
                  alt={recipe?.recipeName || "Recipe image"}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />

                {/* Overlay buttons */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                  <Link
                    href="/recipes"
                    className="flex flex-row justify-center items-center gap-2 bg-black/40 backdrop-blur-sm text-white rounded-lg p-2 text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    <span>Tilbage</span>
                  </Link>

                  {recipeId && (
                    <Link href={`/add-recipe?id=${recipeId}`}>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="inline-flex items-center gap-2 text-foreground"
                      >
                        <Edit2 className="h-4 w-4" aria-hidden="true" />
                        Rediger
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <div className="p-4 sm:p-5 flex flex-col gap-3">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  {recipe?.recipeName}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    <span>{recipe?.time} min</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    <span>{recommendedPersonAmount} personer</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1 -">
                  <span className="text-sm text-muted-foreground">
                    Justér antal personer:
                  </span>
                  <div className="inline-flex items-center rounded-xl bg-secondary p-1  gap-1.5">
                    <IconButton
                      icon={Minus}
                      variant="primary"
                      size="xs"
                      onClick={() =>
                        setRecommendedPersonAmount((prev) =>
                          Math.max(prev - 1, 1),
                        )
                      }
                    ></IconButton>
                    <span className="w-fit px-2 text-center text-sm font-semibold text-foreground">
                      {recommendedPersonAmount}
                    </span>
                    <IconButton
                      icon={Plus}
                      variant="primary"
                      size="xs"
                      onClick={() =>
                        setRecommendedPersonAmount((prev) =>
                          prev < maxRecipePersons ? prev + 1 : prev,
                        )
                      }
                    ></IconButton>
                  </div>
                </div>
              </div>
            </section>

            {/* Ingredients */}
            <section
              id="recipe_Items"
              className="flex flex-col w-full rounded-2xl bg-surface p-4 sm:p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Ingredienser
              </h3>
              <div className="flex flex-col w-full h-fit justify-start items-start gap-1">
                {(() => {
                  // Group ingredients by section
                  const groupedIngredients = (recipe?.ingredients || []).reduce(
                    (acc, ingredient, index) => {
                      const section = ingredient.section || "none";
                      if (!acc[section]) {
                        acc[section] = [];
                      }
                      acc[section].push({ ingredient, index });
                      return acc;
                    },
                    {} as Record<
                      string,
                      Array<{
                        ingredient: Recipe["ingredients"][0];
                        index: number;
                      }>
                    >,
                  );

                  // Get sections in order: first unsectioned (none), then sections
                  const sections = [
                    ...(groupedIngredients["none"] ? ["none"] : []),
                    ...Object.keys(groupedIngredients).filter(
                      (s) => s !== "none",
                    ),
                  ];

                  const scalingFactor =
                    recommendedPersonAmount /
                    (recipe?.recommendedPersonAmount || 1);

                  return (
                    <>
                      {sections.map((section) => (
                        <div key={section} className="w-full">
                          {section !== "none" && (
                            <h4 className="text-base font-semibold text-foreground mb-2 mt-4 first:mt-0">
                              {section}
                            </h4>
                          )}
                          <div className="space-y-2">
                            {groupedIngredients[section].map(
                              ({ ingredient, index }) => {
                                const adjustedWeight =
                                  ingredient.quantity * scalingFactor;

                                return (
                                  <div
                                    key={index}
                                    className="flex w-full items-center justify-between gap-3 rounded-xl bg-white/70 px-3 py-2 border border-secondary/30"
                                  >
                                    <label className="flex items-center gap-3 flex-1">
                                      <input
                                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        type="checkbox"
                                        checked={checkedIngredients.has(
                                          String(index),
                                        )}
                                        onChange={() =>
                                          toggleCheckedIngredient(index)
                                        }
                                      />
                                      <span className="text-sm sm:text-base font-medium text-foreground">
                                        {ingredient.item.name}
                                      </span>
                                    </label>
                                    <span className="inline-flex items-center justify-center rounded-full bg-soft px-3 py-1 text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
                                      {adjustedWeight.toFixed(1)}{" "}
                                      {ingredient.unit}
                                    </span>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
              <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleAddCheckedToShoppingList}
                  disabled={isAddingToList}
                >
                  {isAddingToList
                    ? "Tilføjer..."
                    : "Tilføj valgte til indkøbslisten"}
                </Button>
              </div>
            </section>
          </div>

          {/* Right column (Description) */}
          <section className="flex flex-col md:w-1/2 w-full min-h-80">
            <div className="flex-1 rounded-2xl p-5 bg-surface shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Beskrivelse
              </h3>
              <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-foreground">
                {recipe?.description}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
