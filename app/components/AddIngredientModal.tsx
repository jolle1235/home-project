"use client";
import { useState, useEffect, useRef } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { drinkSchema } from "../utils/validationSchema";
import { Drink } from "../model/Drink";
import { createItem } from "../utils/apiHelperFunctions";
import { searchItem } from "../utils/apiHelperFunctions";
import { Ingredient } from "../model/Ingredient";
import { SearchBarComponent } from "./SearchBarComponent";
import { AddIngredientComponent } from "./AddIngredientComponent";
import { Item } from "../model/Item";
import { IngredientsList } from "./ShowIngrediens";
import { useShoppingListContext } from "../context/ShoppinglistContext";
import Button from "./smallComponent/Button";

interface AddIngredientModalProps {
  onClose: () => void;
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  onRefreshItems?: () => void;
  /** When "shoppingList", ingredients are added to the shopping list instead of the local list. */
  mode?: "recipe" | "shoppingList";
  /** Shown at top in small grey text when mode is shoppingList. */
  description?: string;
}

export function AddIngredientModal({
  onClose,
  ingredients,
  setIngredients,
  onRefreshItems,
  mode = "recipe",
  description,
}: AddIngredientModalProps) {
  const {
    addIngredients: addIngredientsToShoppingList,
    saveList,
    shoppingList,
  } = useShoppingListContext();
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [showAddSectionInput, setShowAddSectionInput] = useState(false);
  const [newSectionName, setNewSectionName] = useState<string>("");
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isShoppingListMode = mode === "shoppingList";
  const [stagedIngredients, setStagedIngredients] = useState<Ingredient[]>(
    mode === "recipe" ? ingredients : []
  );

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

  function handleOnIngredientRemove(index: number) {
    setStagedIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddSection() {
    if (newSectionName.trim() && !sections.includes(newSectionName.trim())) {
      setSections([...sections, newSectionName.trim()]);
      setCurrentSection(newSectionName.trim());
      setNewSectionName("");
      setShowAddSectionInput(false);
    }
  }

  function handleRemoveSection(sectionName: string) {
    // Remove section and reassign ingredients to no section
    setStagedIngredients((prev) =>
      prev.map((ing) =>
        ing.section === sectionName ? { ...ing, section: undefined } : ing
      )
    );
    setSections(sections.filter((s) => s !== sectionName));
    if (currentSection === sectionName) {
      setCurrentSection(null);
    }
  }

  function handleAddIngredient(ingredient: Ingredient) {
    const ingredientWithSection: Ingredient = isShoppingListMode
      ? {
          ...ingredient,
          section: undefined,
        }
      : {
          ...ingredient,
          section: currentSection || undefined,
        };
    setStagedIngredients((prev) => [...prev, ingredientWithSection]);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      if (!searchTerm) {
        setIsDropdownOpen(false);
        return;
      }
      try {
        const data = await searchItem(searchTerm);
        setItems(data);
        setIsDropdownOpen(true);
      } catch (error) {
        console.error("Failed to fetch Items");
        setIsDropdownOpen(false);
      }
    };
    const debounceTimeout = setTimeout(fetchItems, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  useEffect(() => {
    setValue(
      "ingredients",
      stagedIngredients.map((ingredient: Ingredient) => ({
        _id: "unknown",
        item: ingredient.item,
        unit: ingredient.unit,
        marked: ingredient.marked,
        quantity: ingredient.quantity,
        section: ingredient.section,
      }))
    );
  }, [stagedIngredients, setValue]);

  // Initialize sections from existing ingredients when modal opens
  useEffect(() => {
    const existingSections = Array.from(
      new Set(stagedIngredients.map((ing) => ing.section).filter(Boolean))
    ) as string[];
    if (existingSections.length > 0) {
      setSections(existingSections);
    }
  }, [stagedIngredients]);

  // Disable scroll when modal is open and trigger mount animation
  useEffect(() => {
    document.body.style.overflow = "hidden";
    // Trigger animation after mount
    setTimeout(() => setIsMounted(true), 10);
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  // Refresh items after deletion
  const handleRefreshItems = async () => {
    if (searchTerm) {
      try {
        const data = await searchItem(searchTerm);
        setItems(data);
      } catch (error) {
        console.error("Failed to refresh Items");
      }
    }
    if (onRefreshItems) {
      onRefreshItems();
    }
  };

  const handleIngredientAddedFromPicker = (ingredient: Ingredient) => {
    handleAddIngredient(ingredient);

    setSearchTerm(""); // clears input
    setIsDropdownOpen(false);

    searchInputRef.current?.focus();
  };

  return (
    <div
      className={`fixed w-full inset-0 bg-background bg-opacity-50 flex items-end md:items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`flex justify-between flex-col bg-background rounded-t-lg md:rounded-lg w-full md:w-2/3 h-full md:h-auto md:max-h-[90vh] transform transition-all duration-300 ease-out ${
          isClosing
            ? "translate-y-full md:translate-y-0 md:scale-95 md:opacity-0"
            : isMounted
              ? "translate-y-0 md:scale-100 md:opacity-100"
              : "translate-y-full md:translate-y-0 md:scale-95 md:opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex justify-start items-center p-2 bg-background rounded-t-lg">
            <div>
              <h2 className="text-2xl font-bold">Tilføj ingredienser</h2>
              {isShoppingListMode && description && (
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          <div className="w-full bg-background p-2 space-y-2">
            {/* Section Management - only for recipe mode */}
            {!isShoppingListMode && (
              <div className="mb-2 space-y-2">
                {!showAddSectionInput ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowAddSectionInput(true);
                    }}
                    className="mx-2 px-5 py-1 rounded-lg text-sm bg-primary text-muted-foreground hover:bg-primaryHover transition-colors duration-150 cursor-pointer"
                  >
                    + Tilføj sektion
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSection();
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          setShowAddSectionInput(false);
                          setNewSectionName("");
                        }
                      }}
                      placeholder="Sektionsnavn (f.eks. 'Sauce')"
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddSection();
                      }}
                      className="px-3 py-1 rounded-lg text-sm bg-primary text-muted-foreground hover:bg-primaryHover transition-colors duration-150 cursor-pointer"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowAddSectionInput(false);
                        setNewSectionName("");
                      }}
                      className="px-3 py-1 rounded-lg text-sm bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors duration-150 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {sections.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentSection(null);
                      }}
                      className={`px-3 py-1 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                        currentSection === null
                          ? "bg-primary text-muted-foreground font-bold"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Ingen sektion
                    </button>
                  )}
                  {sections.map((section) => (
                    <div key={section} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSection(section);
                        }}
                        className={`w-fit min-w-20 flex justify-between px-3 py-1 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                          currentSection === section
                            ? "bg-primary text-muted-foreground font-bold"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {section}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveSection(section);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm px-1 transition-colors"
                          title="Fjern sektion"
                        >
                          ✕
                        </button>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 relative">
              <div ref={searchBarRef} className="relative">
                <SearchBarComponent
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search ingredient..."
                  inputRef={searchInputRef}
                />
                {isDropdownOpen && (
                  <div className="w-full mt-1 h-fit space-y-2">
                    {searchTerm.trim() && (
                      <div className="">
                        <AddIngredientComponent
                          onAdd={async (returnItem) => {
                            const newItem: Ingredient = returnItem;
                            await createItem(newItem);
                            handleIngredientAddedFromPicker(returnItem);
                          }}
                          itemName={searchTerm}
                        />
                      </div>
                    )}
                    {items.map((item) => (
                      <div key={item.name}>
                        <AddIngredientComponent
                          onAdd={async (newItem) => {
                            handleIngredientAddedFromPicker(newItem);
                          }}
                          itemName={item.name}
                          InputCategory={item.category}
                          defaultUnit={item.defaultUnit}
                          onItemDeleted={handleRefreshItems}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <IngredientsList
              ingredients={stagedIngredients}
              onRemove={(index) => handleOnIngredientRemove(index)}
            />
            {isShoppingListMode && (
              <p className="text-sm text-gray-500 py-2">
                Varer tilføjes til indkøbslisten, når du trykker
                &quot;Done&quot;.
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Button
            onClick={async () => {
              if (isShoppingListMode) {
                const ingredientsForList = stagedIngredients.map(
                  (ingredient) => ({
                    ...ingredient,
                    _id: crypto.randomUUID(),
                    marked: ingredient.marked ?? false,
                  })
                );
                if (ingredientsForList.length > 0) {
                  addIngredientsToShoppingList(ingredientsForList);
                }
                await saveList([...shoppingList, ...ingredientsForList]);
              } else {
                setIngredients(stagedIngredients);
              }
              handleClose();
            }}
            variant="primary"
            size="lg"
            fullWidth
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
