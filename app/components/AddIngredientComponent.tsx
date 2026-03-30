"use client";
import React, { useState, useRef, useEffect } from "react";
import { Ingredient } from "../model/Ingredient";
import { removeItem } from "../utils/apiHelperFunctions";
import { useConstants } from "../context/ConstantsContext";
import Button from "./smallComponent/Button";
import { Loader2, Trash2 } from "lucide-react";
import { normalizeIngredient } from "../utils/shoppinglistHelper";

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
    defaultUnit ?? (units[0].name || ""),
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

    const handleWheel = (event: WheelEvent) => {
      // Prevent scroll propagation when scrolling inside the popover
      if (
        popoverRef.current &&
        popoverRef.current.contains(event.target as Node)
      ) {
        event.stopPropagation();
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      // Prevent scroll propagation when scrolling inside the popover on touch devices
      if (
        popoverRef.current &&
        popoverRef.current.contains(event.target as Node)
      ) {
        event.stopPropagation();
      }
    };

    if (isPopoverOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("wheel", handleWheel, {
        passive: false,
        capture: true,
      });
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
        capture: true,
      });
      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("wheel", handleWheel, true);
        document.removeEventListener("touchmove", handleTouchMove, true);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isPopoverOpen]);

  const handleSubmit = () => {
    if (!unit) {
      console.warn("Cannot add ingredient: unit is required");
      return; // guard against empty unit list
    }

    // Ensure defaultUnit is never empty - use unit if defaultUnit is not provided
    const finalDefaultUnit = defaultUnit || unit || units[0]?.name || "";
    if (!finalDefaultUnit) {
      console.error("Cannot add ingredient: no defaultUnit available");
      return;
    }

    // Ensure category is never empty
    const finalCategory = category || InputCategory || "unknown";

    const newIngredient = normalizeIngredient({
      itemName,
      quantity,
      unit,
      defaultUnit,
      category: category || InputCategory,
    });

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
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Fjern vare: ${itemName}`}
              disabled={loading}
              onClick={async (e) => {
                e?.stopPropagation();
                await handleRemoveItem(itemName);
              }}
              className="min-h-[44px] min-w-[44px] px-3 text-red-700 hover:bg-red-100"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        )}
      </div>

      {isPopoverOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 w-full mt-1 bg-background border border-gray-200 rounded-lg p-3 max-h-[80vh] overflow-y-auto"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-3">
            <div className="flex w-full gap-1">
              <input
                type="number"
                value={quantity}
                placeholder="Mængde"
                onChange={(e) =>
                  setQuantity(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-9/12 rounded-md border border-gray-300 p-2 text-sm sm:text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    setIsPopoverOpen(false);
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

            {/* Frequently used units */}
            <div className="flex flex-wrap gap-2">
              {units
                .filter((u) =>
                  ["stk", "g", "kg", "ml", "l"].includes(u.name.toLowerCase()),
                )
                .map((u) => (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => setUnit(u.name)}
                    className={`px-3 py-1 rounded-full text-xs sm:text-sm border transition-colors ${
                      unit === u.name
                        ? "bg-secondary text-foreground border-secondary"
                        : "bg-white text-foreground border-gray-300 hover:bg-soft"
                    }`}
                  >
                    {u.name}
                  </button>
                ))}
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              fullWidth
              onClick={handleSubmit}
            >
              Tilføj
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
