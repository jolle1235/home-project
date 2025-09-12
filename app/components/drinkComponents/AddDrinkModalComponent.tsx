"use client";
import React, { useEffect, useRef, useState } from "react";

import { AddIngredientComponent } from "../AddIngredientComponent";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { drinkSchema } from "../../utils/validationSchema";
import ImageUploader from "../ImageUploader";
import { Drink } from "../../model/Drink";
import ActionBtn from "../smallComponent/actionBtn";
import { AddIngredientModal } from "../AddIngredientModal";
import { Ingredient } from "@/app/model/Ingredient";
import { IngredientsList } from "../ShowIngrediens";

interface Props {
  handleClose: () => void;
}

export function AddDrinkModalComponent({ handleClose }: Props) {
  // States for recipe fields
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    handleSubmit,
  } = useForm<Drink>({
    resolver: yupResolver(drinkSchema),
    mode: "onBlur",
  });

  const clearState = (
    setState: React.Dispatch<React.SetStateAction<any>>,
    initialState: any
  ) => {
    setState(initialState);
  };

  function handleOnIngredientRemove(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  const onSubmit = async (data: Drink) => {
    let uploadedImageUrl = "";

    // Upload image if file selected
    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Image upload failed.");
        const uploadData = await response.json();
        uploadedImageUrl = uploadData.imageUrl;
        setImageUrl(uploadedImageUrl);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload image.");
        return;
      }
    }

    const updatedFormData = {
      title: data.title,
      image: uploadedImageUrl,
      ingredients: ingredients,
      time: data.time,
      numberOfPeople: data.numberOfPeople,
      description: data.description ?? "",
      alternatives: data.alternatives ?? "",
      author: data.author ?? "",
    };

    try {
      console.log("Drink sent:", updatedFormData);
      const res = await fetch("/api/drink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      });
      if (res.ok) {
        handleClose();
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  return (
    <div className="fixed w-full inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
      <div className="bg-lightBackground rounded-lg">
        <div className="flex justify-between items-center px-6 py-2 bg-lightgreyBackground rounded-t-lg">
          <h2 className="text-2xl font-bold">Tilføj ny opskrift</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div id="coloumn_1" className="space-y-4">
              <div className="w-full ">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="navn"
                >
                  Navn
                </label>
                <input
                  id="navn"
                  type="text"
                  {...register("title")}
                  onKeyUp={() => trigger("title")}
                  className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Indtast navn..."
                />
                {errors.title && (
                  <p className="text-red-500 text-xs">{errors.title.message}</p>
                )}
              </div>

              <div className="w-full ">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="billede"
                >
                  Billede
                </label>
                <ImageUploader onFileSelected={setImageFile} />
              </div>

              <div className="w-full">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="tid"
                >
                  Tid (minutter)
                </label>
                <input
                  id="tid"
                  type="number"
                  {...register("time")}
                  onKeyUp={() => trigger("time")}
                  className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Indtast tid..."
                />
                {errors.time && (
                  <p className="text-red-500 text-xs">{errors.time.message}</p>
                )}
              </div>

              <div className="w-full ">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="personer"
                >
                  Antal personer
                </label>
                <input
                  id="personer"
                  type="number"
                  {...register("numberOfPeople")}
                  onKeyUp={() => trigger("numberOfPeople")}
                  className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Indtast antal personer..."
                />
                {errors.numberOfPeople && (
                  <p className="text-red-500 text-xs">
                    {errors.numberOfPeople.message}
                  </p>
                )}
              </div>
            </div>

            <div id="coloumn_2" className="space-y-4">
              <div className="w-full ">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="beskrivelse"
                >
                  Beskrivelse
                </label>
                <textarea
                  id="beskrivelse"
                  placeholder="Skriv en beskrivelse..."
                  {...register("description")}
                  onKeyUp={() => trigger("description")}
                  className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-xs">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Alternativer
                </label>
                <textarea
                  id="beskrivelse"
                  placeholder="Skriv eventuelle alternativer til ingredienser"
                  {...register("alternatives")}
                  onKeyUp={() => trigger("alternatives")}
                  className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                ></textarea>
                {errors.alternatives && (
                  <p className="text-red-500 text-xs">
                    {errors.alternatives.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="w-full">
            <ActionBtn
              onClickF={() => setIsModalOpen(true)}
              Itext="Tilføj ingredienser"
              color="bg-action"
              hover="bg-actionHover"
              extraCSS="w-full"
            />

            {isModalOpen && (
              <AddIngredientModal
                onClose={() => setIsModalOpen(false)}
                ingredients={ingredients}
                setIngredients={setIngredients}
              />
            )}
          </div>
          <div>
            <IngredientsList
              ingredients={ingredients}
              onRemove={(index: number) => handleOnIngredientRemove(index)}
            />
          </div>

          <div className="flex flex-1 justify-end space-x-4">
            <ActionBtn
              onClickF={handleClose}
              Itext="Annuller"
              color="bg-red-500"
              hover="bg-red-600"
              extraCSS="w-full"
            />
            <ActionBtn
              onClickF={handleSubmit(onSubmit)}
              Itext="Gem drink"
              color="bg-action"
              hover="bg-actionHover"
              extraCSS="w-full"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
