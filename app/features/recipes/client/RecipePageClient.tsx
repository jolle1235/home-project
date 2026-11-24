"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Plus } from "lucide-react";

import { RecipeCardComponent } from "../components/RecipeCardComponent";
import { CategoryWheelComponent } from "../components/CategoryWheelComponent";
import { TimeRangeSelectorComponent } from "../components/TimeRangeSelectorComponent";

import { isDrink, Recipe, RecipeType } from "../types/Recipe";

import { useConstants } from "../../../context/ConstantsContext";

import { IconButton } from "../../../components/IconButton";
import Button from "../../../components/Button";
import { ToggleChip } from "../../../components/ToggleChip";

import { useScrollRefresh } from "../../../hooks/useScrollRefresh";
import { PullToRefreshIndicator } from "../../../components/PullToRefreshIndicator";
import PageContainer from "../../../components/PageContainer";

type Kind = RecipeType | "all";

const KIND_OPTIONS: { value: Kind; label: string }[] = [
  { value: "recipe", label: "Mad" },
  { value: "drink", label: "Drinks" },
  { value: "all", label: "Alle" },
];

type Props = {
  initialRecipes: Recipe[];
  initialKind: Kind;
};

const fetchRecipes = async (): Promise<Recipe[]> => {
  const response = await fetch("/api/recipe");

  if (!response.ok) {
    throw new Error("Opskrifterne kunne ikke hentes");
  }

  return response.json();
};

export default function RecipePageClient({ initialRecipes, initialKind }: Props) {
  const { categories } = useConstants();

  const [kind, setKind] = useState<Kind>(initialKind);

  const [isFilterSettingsOpen, setIsFilterSettingsOpen] = useState(false);

  const [timeRange, setTimeRange] = useState<number[]>([0, 60]);

  const [searchTerm, setSearchTerm] = useState<string>("");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const {
    data: recipes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["recipes"],
    queryFn: fetchRecipes,
    initialData: initialRecipes,
  });

  const { isRefreshing } = useScrollRefresh(refetch);

  const filteredRecipes = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return recipes.filter((recipe) => {
      if (!recipe?.recipeName) {
        return false;
      }

      const matchesKind =
        kind === "all" || (kind === "drink") === isDrink(recipe);

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((category) =>
          recipe.categories?.includes(category),
        );

      // Recipes without a time (common for imports) only drop out when a
      // minimum time is set.
      const time = recipe.time || 0;
      const matchesTime =
        time >= timeRange[0] && (timeRange[1] === 60 || time <= timeRange[1]);

      const matchesSearch = recipe.recipeName
        .toLowerCase()
        .includes(lowerCaseSearchTerm);

      return matchesKind && matchesCategory && matchesTime && matchesSearch;
    });
  }, [recipes, kind, selectedCategories, timeRange, searchTerm]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const resultsCount = filteredRecipes.length;

  return (
    <div className="w-full bg-background overflow-hidden">
      <PageContainer>
        <PullToRefreshIndicator isRefreshing={isRefreshing} />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-3">
                <h1 className="text-page-title text-foreground">
                  {kind === "drink" ? "Drinks" : "Opskrifter"}
                </h1>

                {!isLoading && !error && (
                  <span className="text-body-sm text-muted-foreground">
                    {resultsCount} resultat
                    {resultsCount === 1 ? "" : "er"}
                  </span>
                )}
              </div>

              <p className="text-body-sm text-muted-foreground max-w-xl">
                Find, filtrer og tilføj opskrifter til din madplan.
              </p>
            </div>
          </div>

          <div className="w-full md:max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="search"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Søg efter opskrifter..."
                className="w-full min-h-11 rounded-xl text-body-sm md:text-body shadow-raised"
                aria-label="Søg efter opskrifter"
              />
            </div>

            <div className="flex items-center gap-1 group">
              <IconButton
                icon={Filter}
                variant="secondary"
                size="md"
                ariaLabel={isFilterSettingsOpen ? "Skjul filtre" : "Vis filtre"}
                onClick={() => setIsFilterSettingsOpen(!isFilterSettingsOpen)}
              />

              <span className="hidden md:inline-flex text-body-sm text-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                {isFilterSettingsOpen ? "Skjul filtre" : "Vis filtre"}
              </span>

              <div className="flex justify-center items-center">
                <IconButton
                  icon={Plus}
                  variant="primary"
                  size="md"
                  aria-label={kind === "drink" ? "Tilføj drink" : "Tilføj opskrift"}
                  href={kind === "drink" ? "/add-recipe?type=drink" : "/add-recipe"}
                />
              </div>
            </div>
          </div>
        </div>

        <div role="group" aria-label="Vis" className="mt-4 flex gap-2">
          {KIND_OPTIONS.map((option) => (
            <ToggleChip
              key={option.value}
              label={option.label}
              pressed={kind === option.value}
              onClick={() => setKind(option.value)}
            />
          ))}
        </div>

        {/* Filters */}
        {isFilterSettingsOpen && (
          <section
            aria-label="Filtre"
            className="mt-4 rounded-2xl bg-surface p-card shadow-raised"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-6">
              <div className="flex-1">
                <h2 className="text-body-sm font-medium text-foreground mb-2">
                  Kategorier
                </h2>

                <CategoryWheelComponent
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onCategoryToggle={handleCategoryToggle}
                />
              </div>

              <div className="flex-1">
                <h2 className="text-body-sm font-medium text-foreground mb-2">
                  Tid (minutter)
                </h2>

                <TimeRangeSelectorComponent
                  timeRange={timeRange}
                  setTimeRange={setTimeRange}
                />
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        <div className="mt-5">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Indlæser opskrifter...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-danger-ink">
              Der opstod en fejl ved indlæsning af opskrifter.
            </div>
          ) : resultsCount === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-foreground font-medium">
                Ingen opskrifter matcher dine filtre.
              </p>

              <p className="text-body-sm text-muted-foreground">
                Prøv at justere søgning eller filtre for at se flere resultater.
              </p>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategories([]);
                  setTimeRange([0, 60]);
                }}
              >
                Nulstil filtre
              </Button>
            </div>
          ) : (
            <RecipeCardComponent recipes={filteredRecipes} />
          )}
        </div>
      </PageContainer>
    </div>
  );
}
