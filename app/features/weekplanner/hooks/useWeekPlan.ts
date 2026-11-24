import { useServerList } from "../../../hooks/useServerList";
import { Recipe } from "../../recipes/types/Recipe";
import { WeekPlan } from "../types/weekPlan";
import { fetchWeekPlan, saveWeekPlan } from "../api/weekPlan.client";
import { WEEK_PLAN_QUERY_KEY } from "../constants";

// The recipe on each date it isn't planned for yet.
function withRecipe(
  plan: WeekPlan[],
  dates: string[],
  recipe: Recipe,
): WeekPlan[] {
  const isPlanned = (date: string) =>
    plan.some((entry) => entry.date === date && entry.recipeId === recipe._id);
  const added = dates
    .filter((date) => !isPlanned(date))
    .map((date) => ({
      date,
      recipeId: recipe._id,
      recipeName: recipe.recipeName,
    }));
  return [...plan, ...added];
}

// The household's week plan; changes go through useServerList (see there).
export function useWeekPlan() {
  const {
    data: weekPlan,
    update,
    removeWithUndo,
    refresh,
  } = useServerList<WeekPlan>({
    queryKey: WEEK_PLAN_QUERY_KEY,
    queryFn: fetchWeekPlan,
    save: saveWeekPlan,
    errorMessage: "Kunne ikke gemme madplanen – prøv igen",
  });

  const addRecipe = (dates: string[], recipe: Recipe) =>
    update(
      (plan) => withRecipe(plan, dates, recipe),
      `Opskrift tilføjet til ${dates.length} ${dates.length === 1 ? "dato" : "datoer"}`,
    );

  // `dayName` is the weekday as the page names it ("mandag").
  const removeRecipe = (date: string, recipeId: string, dayName: string) =>
    removeWithUndo(
      (entry) => entry.date === date && entry.recipeId === recipeId,
      (entry) => `${entry.date} ${entry.recipeId}`,
      ([entry]) => `«${entry?.recipeName ?? "Opskriften"}» fjernet fra ${dayName}`,
    );

  return { weekPlan, addRecipe, removeRecipe, refresh };
}
