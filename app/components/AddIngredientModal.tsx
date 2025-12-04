"use client";
import { useState, useEffect, useRef } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { drinkSchema } from "../utils/validationSchema";
import { Drink } from "../model/Drink";
import { createItem } from "../utils/apiHelperFunctions";
import { searchItem } from "../utils/apiHelperFunctions";
import { Ingredient } from "../model/Ingredient";
import SearchBar from "./SearchBarComponent";
import { AddIngredientComponent } from "./AddIngredientComponent";
import { Item } from "../model/Item";
import ActionBtn from "./smallComponent/actionBtn";
import { IngredientsList } from "./ShowIngrediens";

interface AddIngredientModalProps {
  onClose: () => void;
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  onRefreshItems?: () => void;
}

export function AddIngredientModal({
  onClose,
  ingredients,
  setIngredients,
  onRefreshItems,
}: AddIngredientModalProps) {
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [showAddSectionInput, setShowAddSectionInput] = useState(false);
  const [newSectionName, setNewSectionName] = useState<string>("");
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
    setIngredients(ingredients.filter((_, i) => i !== index));
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
    setIngredients(
      ingredients.map((ing) =>
        ing.section === sectionName ? { ...ing, section: undefined } : ing
      )
    );
    setSections(sections.filter((s) => s !== sectionName));
    if (currentSection === sectionName) {
      setCurrentSection(null);
    }
  }

  function handleAddIngredient(ingredient: Ingredient) {
    const ingredientWithSection: Ingredient = {
      ...ingredient,
      section: currentSection || undefined,
    };
    setIngredients([...ingredients, ingredientWithSection]);
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
      ingredients.map((ingredient: Ingredient) => ({
        _id: "unknown",
        item: ingredient.item,
        unit: ingredient.unit,
        marked: ingredient.marked,
        quantity: ingredient.quantity,
        section: ingredient.section,
      }))
    );
  }, [ingredients, setValue]);

  // Initialize sections from existing ingredients when modal opens
  useEffect(() => {
    const existingSections = Array.from(
      new Set(ingredients.map((ing) => ing.section).filter(Boolean))
    ) as string[];
    if (existingSections.length > 0) {
      setSections(existingSections);
    }
  }, []);

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

  return (
    <div
      className={`fixed w-full inset-0 bg-darkBackground bg-opacity-50 flex items-end md:items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`flex justify-between flex-col bg-lightBackground rounded-t-lg md:rounded-lg w-full md:w-2/3 h-full md:h-auto md:max-h-[90vh] transform transition-all duration-300 ease-out ${
          isClosing
            ? "translate-y-full md:translate-y-0 md:scale-95 md:opacity-0"
            : isMounted
              ? "translate-y-0 md:scale-100 md:opacity-100"
              : "translate-y-full md:translate-y-0 md:scale-95 md:opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex justify-between items-center px-6 py-2 bg-lightgreyBackground rounded-t-lg">
            <h2 className="text-2xl font-bold">Tilføj ingredienser</h2>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-all duration-150 cursor-pointer transform hover:scale-110 active:scale-95 active:opacity-90 rounded"
            >
              ✕
            </button>
          </div>
          <div className="w-full bg-lightBackground p-2">
            {/* Section Management */}
            <div className="mb-2 space-y-2">
              {!showAddSectionInput ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAddSectionInput(true);
                  }}
                  className="mx-2 px-5 py-1 rounded-lg text-sm bg-action text-darkText hover:bg-actionHover transition-colors duration-150 cursor-pointer"
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
                    className="px-3 py-1 rounded-lg text-sm bg-action text-darkText hover:bg-actionHover transition-colors duration-150 cursor-pointer"
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
                        ? "bg-action text-darkText font-bold"
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
                          ? "bg-action text-darkText font-bold"
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

            <div className="space-y-4 relative">
              <div ref={searchBarRef} className="relative">
                <SearchBar
                  onChange={setSearchTerm}
                  placeholder="Søg efter ingredienser..."
                />
                {isDropdownOpen && (
                  <div className="w-full mt-1 h-fit space-y-2">
                    {searchTerm.trim() && (
                      <div className="">
                        <AddIngredientComponent
                          onAdd={async (returnItem) => {
                            const newItem: Ingredient = returnItem;
                            await createItem(newItem);
                            handleAddIngredient(returnItem);
                            setSearchTerm("");
                            setIsDropdownOpen(false);
                          }}
                          itemName={searchTerm}
                        />
                      </div>
                    )}
                    {items.map((item) => (
                      <div key={item.name}>
                        <AddIngredientComponent
                          onAdd={async (newItem) => {
                            handleAddIngredient(newItem);
                            setSearchTerm("");
                            setIsDropdownOpen(false);
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
              ingredients={ingredients}
              onRemove={(index) => handleOnIngredientRemove(index)}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <ActionBtn
            onClickF={handleClose}
            Itext="Done"
            color="bg-action"
            extraCSS="w-full"
          />
        </div>
      </div>
    </div>
  );
}
