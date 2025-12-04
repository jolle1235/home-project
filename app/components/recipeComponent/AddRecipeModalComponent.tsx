"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ActionBtn from "../smallComponent/actionBtn";
import { WebLinkInput } from "../WebLinkInput";
import { Recipe } from "../../model/Recipe";

interface Props {
  handleClose: () => void;
  onRecipeSaved?: () => void;
}

export function AddRecipeModalComponent({ handleClose, onRecipeSaved }: Props) {
  const router = useRouter();

  const handleScraped = (data: Recipe) => {
    // Save scraped data to sessionStorage and navigate to recipe page
    sessionStorage.setItem("addRecipe_data", JSON.stringify(data));
    router.push("/add-recipe");
    handleClose();
  };

  const handleManual = () => {
    // Navigate directly to recipe page
    router.push("/add-recipe");
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tilføj ny opskrift</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-all duration-150 cursor-pointer transform hover:scale-110 active:scale-95 active:opacity-80 p-1 rounded"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <label className="block text-gray-700 font-bold my-1 text-2xl">
              Automatisk
            </label>
            <WebLinkInput onScraped={handleScraped} />
          </div>

          <div className="w-full flex justify-center items-center">
            <ActionBtn
              onClickF={handleManual}
              Itext="Opret Manuelt"
              extraCSS="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
