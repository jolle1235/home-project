"use client"
import React, { useState } from "react";
import { Recipe } from "../model/Recipe";
import { useRecipeContext } from "../context/RecipeContext";
import { useRouter } from "next/router";
import Button from "@mui/material/Button";

export default function WeeklyRecipePlanner() {
    const router = useRouter();

    function handleRouter(id?: number){
        if(id){
            router.push(`/recipes/${id}`)
        }
    }

    const { weekPlan, addRecipe, getDatesForNext4Weeks } = useRecipeContext();

    const availableDates = getDatesForNext4Weeks()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Weekly Recipe Planner</h1>

      {/* Display the weekly plan as a grid of day cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {availableDates.map((date) => {
          const dateKey = date.toISOString().split("T")[0];
          const displayText = date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          });
          return (
            <div
              key={dateKey}
              className="border rounded p-4 cursor-pointer hover:bg-blue-50"
            >
              <h3 className="text-lg font-bold mb-2">{displayText}</h3>
              {weekPlan[dateKey].length === 0 ? (
                <p className="text-gray-500">No recipes planned.</p>
              ) : (
                <ul>
                  {weekPlan[dateKey].map((recipe, idx) => (
                    <Button
                    onClick={async () => handleRouter(recipe._id)}
                    ></Button>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
