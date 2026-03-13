"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRecipeContext } from "../context/RecipeContext";
import Button from "../components/smallComponent/Button";

export default function WeeklyRecipePlanner() {
  const router = useRouter();
  const { weekPlan, removeRecipeFromWeekPlan } = useRecipeContext();

  const [weekDates, setWeekDates] = useState<(Date | null)[]>([]);

  function getMonday(d: Date) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monday = getMonday(today);
    const weekDayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;

    const grid: (Date | null)[] = [];

    for (let i = 0; i < 7; i++) {
      if (i < weekDayIdx) {
        grid.push(null);
      } else {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        grid.push(d >= today ? d : null);
      }
    }

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
    if (id) router.push(`/recipes/${id}`);
  }

  return (
    <div className="p-4">
      <h5 className="text-2xl font-semibold mb-4">Madplan</h5>

      <div className="flex flex-col gap-4">
        {weekDates
          .filter((date) => date !== null)
          .map((date) => {
            const dateKey = date!.toISOString().split("T")[0];

            const displayText = date!.toLocaleDateString("da-DK", {
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
                        key={`${entry.date}-${entry.recipeId}`}
                        className="flex flex-col items-center"
                      >
                        <div className="flex flex-row w-full justify-center items-center bg-gray-100 rounded-lg m-1 p-1">
                          <p className="truncate flex-1 w-10/12">
                            {entry.recipeName}
                          </p>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeRecipeFromWeekPlan(dateKey, entry.recipeId)
                            }
                            className="w-8 h-8 p-0"
                          >
                            ✕
                          </Button>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => handleRouter(entry.recipeId)}
                        >
                          Opskrift
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
