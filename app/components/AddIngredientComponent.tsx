"use client";
import React, { useState, useRef, useEffect } from "react";
import { Ingredient } from "../model/Ingredient";
import { RemoveButton } from "./smallComponent/removeBtn";
import { removeItem } from "../utils/apiHelperFunctions";
import { useConstants } from "../context/ConstantsContext";

interface Props {
  onAdd: (Ingredient: Ingredient) => void;
  itemName: string;
  InputCategory?: string;
  defaultUnit?: string;
  onItemDeleted?: () => void;
}

export function AddIngredientComponent({
  onAdd,
  itemName,
  InputCategory,
  defaultUnit,
  onItemDeleted,
}: Props) {
  const { units } = useConstants();
  const [quantity, setQuantity] = useState<number | "">("");
  const [unit, setUnit] = useState<string>(
    defaultUnit ?? (units[0].name || "")
  );
  const [category, setCategory] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Reset state when popover closes
  useEffect(() => {
    if (!isPopoverOpen) {
      setQuantity("");
      setUnit(defaultUnit ?? (units[0]?.name || ""));
      setCategory("");
    }
  }, [isPopoverOpen, defaultUnit, units]);

  // Close popover when clicking outside and disable scroll when popover is open
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };

    if (isPopoverOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("mousedown", handleClickOutside);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isPopoverOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit) {
      console.warn("Cannot add ingredient: unit is required");
      return; // guard against empty unit list
    }
    if (quantity === "" || quantity === null || quantity === undefined) {
      console.warn("Cannot add ingredient: quantity is required");
      return; // Quantity is required - don't add ingredient if quantity is missing
    }

    // Ensure defaultUnit is never empty - use unit if defaultUnit is not provided
    const finalDefaultUnit = defaultUnit || unit || units[0]?.name || "";
    if (!finalDefaultUnit) {
      console.error("Cannot add ingredient: no defaultUnit available");
      return;
    }

    // Ensure category is never empty
    const finalCategory = category || InputCategory || "unknown";

    const newIngredient: Ingredient = {
      _id: "unknown",
      item: {
        _id: "unknown",
        name: itemName,
        category: finalCategory,
        defaultUnit: finalDefaultUnit,
      },
      quantity: Number(quantity),
      unit: unit,
      marked: false,
    };

    console.log("Adding ingredient:", newIngredient);
    onAdd(newIngredient);
    setQuantity("");
    setUnit(units[0]?.name || "");
    setCategory("");
    setIsPopoverOpen(false);
  };

  async function handleRemoveItem(itemName: string) {
    if (!window.confirm("Are you sure you want to remove this item?")) return;

    setLoading(true);
    setError(null);

    try {
      await removeItem(itemName);
      // Trigger refresh callback if provided
      if (onItemDeleted) {
        onItemDeleted();
      }
    } catch (err) {
      setError("Failed to remove item");
    } finally {
      setLoading(false);
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPopoverOpen(!isPopoverOpen);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleButtonClick}
          className="flex-1 flex items-center justify-between px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150 text-left"
        >
          <span className="text-base sm:text-lg font-medium truncate">
            {itemName}
          </span>
        </button>
        {InputCategory && (
          <div onClick={(e) => e.stopPropagation()}>
            <RemoveButton onClickF={async () => handleRemoveItem(itemName)} />
          </div>
        )}
      </div>

      {isPopoverOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex w-full gap-1">
              <input
                type="number"
                value={quantity}
                placeholder="Mængde"
                onChange={(e) =>
                  setQuantity(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="w-9/12 rounded-md border border-gray-300 p-2 text-sm sm:text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(e);
                  }
                }}
                autoFocus
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="rounded-md border border-gray-300 py-2 px-2 text-sm sm:text-base"
              >
                {units.map((u) => (
                  <option key={u._id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-action hover:bg-actionHover font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Tilføj
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
