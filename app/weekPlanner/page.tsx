"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRecipeContext } from "../context/RecipeContext";
import CalendarDialog from "../components/CalenderDialog";
import ActionBtn from "../components/smallComponent/actionBtn";

export default function WeeklyRecipePlanner() {
  const router = useRouter();
  const {
    weekPlan,
    tempWeekPlan,
    addRecipeToWeekPlan,
    removeRecipeFromTempWeekPlan,
    getDatesForNext4Weeks,
  } = useRecipeContext();
  const availableDates = getDatesForNext4Weeks();

  // State to control the popup and store which recipe is being assigned dates.
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  function handleRouter(id?: number) {
    if (id) {
      router.push(`/recipes/${id}`);
    }
  }

  const openDialogForRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedRecipe(null);
  };

  // When the dialog is done, add the recipe for each selected date.
  const handleDialogDone = (selectedDates: string[]) => {
    if (selectedRecipe) {
      selectedDates.forEach((dateKey) => {
        addRecipeToWeekPlan(dateKey, selectedRecipe);
      });
      removeRecipeFromTempWeekPlan(selectedRecipe._id);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div>
        <h5 className="text-2xl font-semibold mb-4">
          Opskrift der mangler en dato
        </h5>
        {tempWeekPlan.length > 0 ? (
          <div className="space-y-4">
            {tempWeekPlan.map((recipe) => (
              <div key={recipe._id} className="max-w-md p-4 border rounded shadow">
                <div>
                  <h6 className="text-lg font-medium">{recipe.recipeName}</h6>
                  <ActionBtn
                    onClickF={() => openDialogForRecipe(recipe)}
                    Itext="Tiløj til madplan"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recipes added yet.</p>
        )}
      </div>

      {/* Display the weekly plan as a grid of day cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        {availableDates.map((date) => {
          const dateKey = date.toISOString().split("T")[0];
          const displayText = date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          });
          const entriesForDate = weekPlan.filter((entry) => entry.date === dateKey);
          return (
            <div key={dateKey} className="border rounded p-4">
              <h6 className="text-lg font-semibold mb-2">{displayText}</h6>
              {entriesForDate.length === 0 ? (
                <p className="text-gray-500 text-sm">No recipes planned.</p>
              ) : (
                <ul>
                  {entriesForDate.map((entry) => (
                    <div className="flex flex-row justify-center items-center " key={entry.recipe._id}>
                      <p className="w-1/2 borde p-1">{`${entry.recipe.recipeName}`}</p>

                      <ActionBtn
                        onClickF={() => handleRouter(entry.recipe._id)}
                        Itext="Se opskrift"
                        textSize="text-xs"
                      >
                      </ActionBtn>

                    </div>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar Popup for selecting dates */}
      <CalendarDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onDone={handleDialogDone}
        availableDates={availableDates}
      />
    </div>
  );
}
