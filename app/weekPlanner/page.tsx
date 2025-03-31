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
        // On mobile: stack vertically; on md+ screens: display in a grid with 3 columns.
        <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
          {tempWeekPlan.map((recipe) => (
            <div
              key={recipe._id}
              className="flex flex-col w-full items-center justify-between border rounded-lg p-2"
            >
              <p className="truncate w-full">{recipe.recipeName}</p>
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
        {/* For mobile: single column; for md+: grid with 2 or 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableDates.map((date) => {
            const dateKey = date.toISOString().split("T")[0];
            const displayText = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              weekday: "short",
            });
            const entriesForDate = weekPlan.filter(
              (entry) => entry.date === dateKey
            );

            return (
              <div key={dateKey} className="border rounded p-4 flex flex-col">
                <h6 className="text-base font-semibold mb-2">{displayText}</h6>
                {entriesForDate.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recipes planned.</p>
                ) : (
                  <div className="space-y-2">
                    {entriesForDate.map((entry) => (
                      <div
                        key={entry.recipe._id}
                        className="bg-gray-100 rounded-lg p-2 flex flex-col md:flex-row items-center md:justify-between"
                      >
                        <p className="truncate flex-1 p-1 w-full">
                          {entry.recipe.recipeName}
                        </p>
                        <div className="flex space-x-2">
                          <ActionBtn
                            onClickF={() => handleRouter(entry.recipe._id)}
                            Itext="Se opskrift"
                            textSize="text-base"
                          />
                          <ActionBtn
                            onClickF={() =>
                              removeRecipeFromWeekPlan(
                                entriesForDate[0].date,
                                entry.recipe._id
                              )
                            }
                            Itext="Slet"
                            textSize="text-base"
                            color="bg-red-500"
                            hover="bg-red-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
