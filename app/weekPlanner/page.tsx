"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRecipeContext } from "../context/RecipeContext";
import CalendarDialog from "../components/CalenderDialog";
import ActionBtn from "../components/smallComponent/actionBtn";
import { RemoveButton } from "../components/smallComponent/removeBtn";

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
  const [weekDates, setWeekDates] = useState<(Date | null)[]>([]);

  // Helper to get Monday of the current week
  function getMonday(d: Date) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Sunday (0) should go back 6 days
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // Build a 3-week (21 days) grid, starting from today, always Mon–Sun columns
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monday = getMonday(today);
    const weekDayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1; // 0=Mon, 6=Sun
    const grid: (Date | null)[] = [];
    // First week: fill empty for days before today, then fill from today to Sunday
    for (let i = 0; i < 7; i++) {
      if (i < weekDayIdx) {
        grid.push(null);
      } else {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        if (d >= today) {
          grid.push(d);
        } else {
          grid.push(null);
        }
      }
    }
    // Next 2 weeks: fill all days
    let start = new Date(today);
    start.setDate(today.getDate() + (7 - weekDayIdx));
    for (let w = 0; w < 2; w++) {
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + w * 7 + i);
        grid.push(d);
      }
    }
    setWeekDates(grid);
  }, []);

  function handleRouter(id?: string) {
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
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {Array.from({ length: 3 }).map((_, rowIdx) => (
            <React.Fragment key={rowIdx}>
              {weekDates
                .slice(rowIdx * 7, rowIdx * 7 + 7)
                .map((date, colIdx) => {
                  if (!date) {
                    return (
                      <div
                        key={`empty-${rowIdx}-${colIdx}`}
                        className="border rounded p-4 min-h-[120px] bg-gray-50 opacity-50"
                      />
                    );
                  }
                  const dateKey = date.toISOString().split("T")[0];
                  const displayText = date.toLocaleDateString("da-DK", {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  });
                  const entriesForDate = weekPlan.filter(
                    (entry) => entry.date === dateKey
                  );
                  return (
                    <div
                      key={dateKey}
                      className="border rounded p-4 flex flex-col min-h-[120px]"
                    >
                      <h6 className="text-base font-semibold mb-2 text-center">
                        {displayText}
                      </h6>
                      {entriesForDate.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center">
                          Ingen opskrifter planlagt.
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {entriesForDate.map((entry) => (
                            <div
                              key={entry.recipe._id}
                              className="flex flex-col items-center "
                            >
                              <div className="flex flex-row w-full justify-center items-center bg-gray-100 rounded-lg m-1 p-1">
                                <p className="truncate flex-1 w-10/12">
                                  {entry.recipe.recipeName}
                                </p>
                                <button
                                  onClick={() => {
                                    removeRecipeFromWeekPlan(
                                      entriesForDate[0].date,
                                      entry.recipe._id
                                    );
                                  }}
                                  className="text-gray-500 hover:text-gray-700 transition-all duration-150 cursor-pointer transform hover:scale-110 active:scale-95 active:opacity-80 p-1 rounded"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="flex flex-row justify-evenly w-full gap-1">
                                <button
                                  className="text-base p-1 bg-action hover:bg-actionHover rounded-lg w-10/12 transition-all duration-150 cursor-pointer transform hover:scale-105 active:scale-95 active:opacity-80"
                                  onClick={() => {
                                    handleRouter(entry.recipe._id);
                                  }}
                                >
                                  Opskrift
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <CalendarDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onDone={handleDialogDone}
        availableDates={availableDates}
      />
    </div>
  );
}
