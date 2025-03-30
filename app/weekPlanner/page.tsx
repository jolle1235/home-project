"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRecipeContext } from "../context/RecipeContext";
import CalendarDialog from "../components/CalenderDialog";
import ActionBtn from "../components/smallComponent/actionBtn";
import { RemoveButton } from "../components/smallComponent/removeBtn";
import Image from "next/image";

export default function WeeklyRecipePlanner() {
  const router = useRouter();
  const {
    weekPlan,
    tempWeekPlan,
    addRecipeToWeekPlan,
    removeRecipeFromTempWeekPlan,
    removeRecipeFromWeekPlan,
    getDatesForNext4Weeks,
  } = useRecipeContext();
  const availableDates = getDatesForNext4Weeks();

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

  const handleDialogDone = (selectedDates: string[]) => {
    if (selectedRecipe) {
      selectedDates.forEach((dateKey) => {
        addRecipeToWeekPlan(dateKey, selectedRecipe);
      });
      removeRecipeFromTempWeekPlan(selectedRecipe._id);
    }
  };

  return (
    <div className="p-4">
      <h5 className="text-2xl font-semibold mb-4">
        Opskrift der mangler en dato
      </h5>

      {tempWeekPlan.length > 0 ? (
        <div className="space-y-2">
          {tempWeekPlan.map((recipe) => (
            <div
              key={recipe._id}
              className="flex items-center justify-between border-b p-2"
            >
              <p className="truncate">{recipe.recipeName}</p>
              <ActionBtn
                onClickF={() => openDialogForRecipe(recipe)}
                Itext="Tilføj til madplan"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No recipes added yet.</p>
      )}

      {/* Weekly plan displayed in a list format */}
      <div className="mt-8">
        {availableDates.map((date) => {
          const dateKey = date.toISOString().split("T")[0];
          const displayText = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            weekday: "short",
          });
          console.log("date:", dateKey)
          console.log("date:", dateKey);
            if (weekPlan.length > 0) {
              console.log("weekplan date:", weekPlan[0].date);
            }

          const entriesForDate = weekPlan.filter(
            (entry) => entry.date === dateKey
          );

          return (
            <div key={dateKey} className="gap-4 my-1 border p-2 rounded flex flex-row items-center">
              <h6 className="text-base w-3/12 min-w-32 font-semibold">{displayText}</h6>
              {entriesForDate.length === 0 ? (
                <p className="text-gray-500 text-sm">No recipes planned.</p>
              ) : (
                <div className="flex flex-row items-center w-full">
                  {entriesForDate.map((entry) => (
                    <div
                      className="flex items-center justify-between w-full"
                      key={entry.recipe._id}
                    >
                      <p className="truncate flex items-center shrink-0 flex-1">{entry.recipe.recipeName}</p>
                      <Image
                        src={entry.recipe.image}
                        alt={entry.recipe.recipeName} // Provide an alt text for accessibility
                        width={40} // Increase size for better visibility
                        height={40}
                        className="rounded-md object-cover" // Optional: improve styling
                      />
                      <ActionBtn
                        onClickF={() => handleRouter(entry.recipe._id)}
                        Itext="Se opskrift"
                        textSize="text-base"
                      />
                      <div className="flex items-center">
                        <RemoveButton onRemove={() => removeRecipeFromWeekPlan(entriesForDate[0].date, entry.recipe._id)}></RemoveButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar Popup */}
      <CalendarDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onDone={handleDialogDone}
        availableDates={availableDates}
      />
    </div>
  );
}
