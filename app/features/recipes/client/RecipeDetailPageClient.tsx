"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Recipe } from "../types/Recipe";
import { Ingredient } from "../../../model/Ingredient";
import { maxRecipePersons } from "../../../utils/validationVariables";
import Image from "next/image";
import Link from "next/link";
import { useShoppingList } from "../../shoppingList/hooks/useShoppinglist";
import { toast } from "react-toastify";
import { fetchRecipe } from "../api/recipe.client";
import Button from "../../../components/Button";
import {
  ArrowLeft,
  Clock,
  Edit2,
  ExternalLink,
  Minus,
  Plus,
  Users,
} from "lucide-react";
import { IconButton } from "@/app/components/IconButton";
import PageContainer from "@/app/components/PageContainer";

// The server page passes the recipe in; the query keeps it in the TanStack cache, where the
// editor writes a saved recipe, so a 30 s-old server payload never hides your own edit.
export default function RecipeDetailPageClient({
  initialRecipe,
}: {
  initialRecipe: Recipe;
}) {
  const { data: recipe } = useQuery({
    queryKey: ["recipe", initialRecipe._id],
    queryFn: () => fetchRecipe(initialRecipe._id),
    initialData: initialRecipe,
  });

  // Keyed so the person count and checked ingredients reset per recipe.
  return <RecipeDetails key={recipe._id} recipe={recipe} />;
}

// A ticked ingredient scaled to the chosen persons; without an amount it becomes
// 1 stk. (null/undefined > 0 is false.) addIngredients gives it its id and marked.
function toShoppingRow(ing: Ingredient, scalingFactor: number): Ingredient {
  const hasAmount = ing.quantity > 0;
  return {
    ...ing,
    quantity: hasAmount ? parseFloat((ing.quantity * scalingFactor).toFixed(1)) : 1,
    unit: (hasAmount && ing.unit) || "stk",
  };
}

const addedMessage = (count: number) =>
  `${count} ingrediens${count === 1 ? "" : "er"} tilføjet til indkøbslisten`;

function RecipeDetails({ recipe }: { recipe: Recipe }) {
  const [recommendedPersonAmount, setRecommendedPersonAmount] = useState(
    recipe.recommendedPersonAmount || 1,
  );
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    () => new Set((recipe.ingredients ?? []).map((_, index) => String(index))),
  );
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

  const scalingFactor =
    recommendedPersonAmount / (recipe.recommendedPersonAmount || 1);

  const handleAddCheckedToShoppingList = () => {
    if (!recipe.ingredients?.length) return;
    const toAdd = recipe.ingredients
      .filter((_, i) => checkedIngredients.has(String(i)))
      .map((ing) => toShoppingRow(ing, scalingFactor));
    if (toAdd.length === 0) {
      toast.info("Vælg mindst én ingrediens.");
      return;
    }
    addIngredients(toAdd, addedMessage(toAdd.length));
  };

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row gap-section">
        {/* Left column: image, title, meta, ingredients */}
        <div className="flex flex-col md:w-1/2 w-full gap-4">
          {/* Hero card */}
          <section className="bg-surface rounded-2xl shadow-raised overflow-hidden">
            <RecipeHero recipe={recipe} />
            <div className="p-card flex flex-col gap-stack">
              <h1 className="text-page-title text-foreground">
                {recipe.recipeName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-body-sm text-muted-foreground">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span>{recipe.time} min</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  <span>{recommendedPersonAmount} personer</span>
                </div>
              </div>
              {recipe.sourceUrl && (
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hit-area inline-flex w-fit items-center gap-2 rounded-lg border border-secondary px-3 py-2 text-body-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Gå til kilde
                </a>
              )}
              <div className="flex items-center gap-3 mt-1 -">
                <span className="text-body-sm text-muted-foreground">
                  Justér antal personer:
                </span>
                <div className="inline-flex items-center rounded-xl bg-secondary p-1  gap-1.5">
                  <IconButton
                    icon={Minus}
                    ariaLabel="Færre personer"
                    variant="primary"
                    size="xs"
                    onClick={() =>
                      setRecommendedPersonAmount((prev) =>
                        Math.max(prev - 1, 1),
                      )
                    }
                  ></IconButton>
                  <span className="w-fit px-2 text-center text-body-sm font-semibold text-foreground">
                    {recommendedPersonAmount}
                  </span>
                  <IconButton
                    icon={Plus}
                    ariaLabel="Flere personer"
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
            className="flex flex-col w-full rounded-2xl bg-surface p-card shadow-raised"
          >
            <h3 className="text-card-title text-foreground mb-3">
              Ingredienser
            </h3>
            <div className="flex flex-col w-full h-fit justify-start items-start gap-1">
              <IngredientList
                ingredients={recipe.ingredients}
                scalingFactor={scalingFactor}
                checkedIngredients={checkedIngredients}
                onToggle={toggleCheckedIngredient}
              />
            </div>
            <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-3">
              <Button
                type="button"
                variant="primary"
                size="md"
                fullWidth
                onClick={handleAddCheckedToShoppingList}
              >
                Tilføj valgte til indkøbslisten
              </Button>
            </div>
          </section>
        </div>

        {/* Right column (Description) */}
        <section className="flex flex-col md:w-1/2 w-full min-h-80">
          <div className="flex-1 rounded-2xl p-5 bg-surface shadow-raised">
            <h3 className="text-card-title text-foreground mb-3">
              Beskrivelse
            </h3>
            <p className="whitespace-pre-wrap break-words text-body-sm-loose md:text-body-loose text-foreground">
              {recipe.description}
            </p>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

function IngredientList({
  ingredients,
  scalingFactor,
  checkedIngredients,
  onToggle,
}: {
  ingredients: Ingredient[] | undefined;
  scalingFactor: number;
  checkedIngredients: Set<string>;
  onToggle: (index: number) => void;
}) {
  // Group ingredients by section
  const groupedIngredients = (ingredients ?? []).reduce(
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
        ingredient: Ingredient;
        index: number;
      }>
    >,
  );

  // Get sections in order: first unsectioned (none), then sections
  const sections = [
    ...(groupedIngredients["none"] ? ["none"] : []),
    ...Object.keys(groupedIngredients).filter((s) => s !== "none"),
  ];

  return (
    <>
      {sections.map((section) => (
        <div key={section} className="w-full">
          {section !== "none" && (
            <h4 className="text-body font-semibold text-foreground mb-2 mt-4 first:mt-0">
              {section}
            </h4>
          )}
          <div className="space-y-2">
            {groupedIngredients[section].map(({ ingredient, index }) => {
              const adjustedWeight = ingredient.quantity * scalingFactor;

              return (
                <div
                  key={index}
                  className="flex w-full items-center justify-between gap-3 rounded-xl bg-neutral-faint px-3 py-2 border border-line"
                >
                  <label className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={checkedIngredients.has(String(index))}
                      onChange={() => onToggle(index)}
                    />
                    <span className="text-body-sm md:text-body font-medium text-foreground">
                      {ingredient.item.name}
                      {ingredient.notes && (
                        <span className="ml-1 font-normal text-muted-foreground">
                          ({ingredient.notes})
                        </span>
                      )}
                    </span>
                  </label>
                  <span className="inline-flex items-center justify-center rounded-full bg-soft px-3 py-0.5 md:py-1 text-control font-medium text-foreground whitespace-nowrap">
                    {adjustedWeight.toFixed(1)} {ingredient.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

function RecipeHero({ recipe }: { recipe: Recipe }) {
  return (
    <div className="relative w-full h-56 md:h-64">
      <Image
        className="object-cover"
        src={recipe.image || "/fallback.jpg"}
        alt={recipe.recipeName || "Opskriftsbillede"}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
      />

      {/* Overlay buttons */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
        <Link
          href="/recipes"
          className="flex flex-row justify-center items-center gap-2 hit-area bg-scrim backdrop-blur-sm text-scrim-foreground rounded-lg p-2 text-body-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Tilbage</span>
        </Link>

        <Button
          href={`/add-recipe?id=${recipe._id}`}
          variant="secondary"
          size="sm"
        >
          <Edit2 className="h-4 w-4" aria-hidden="true" />
          Rediger
        </Button>
      </div>
    </div>
  );
}
