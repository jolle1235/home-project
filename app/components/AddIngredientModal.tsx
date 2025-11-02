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
}

export function AddIngredientModal({
  onClose,
  ingredients,
  setIngredients,
}: AddIngredientModalProps) {
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [showAddSectionInput, setShowAddSectionInput] = useState(false);
  const [newSectionName, setNewSectionName] = useState<string>("");

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

  return (
    <div className="fixed w-full inset-0 bg-darkBackground bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="flex justify-between flex-col bg-lightBackground rounded-lg w-2/3 h-full ">
        <div>
          <div className="flex justify-between items-center px-6 py-2 bg-lightgreyBackground rounded-t-lg">
            <h2 className="text-2xl font-bold">Tilføj ingredienser</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-all duration-150 cursor-pointer transform hover:scale-110 active:scale-95 active:opacity-80 p-1 rounded"
            >
              ✕
            </button>
          </div>
          <div className="w-full bg-lightBackground p-2">
            {/* Section Management */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-700">
                  Sektion:
                </span>
                <button
                  onClick={() => setCurrentSection(null)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                    currentSection === null
                      ? "bg-action text-darkText font-bold"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Ingen sektion
                </button>
                {sections.map((section) => (
                  <div key={section} className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentSection(section)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                        currentSection === section
                          ? "bg-action text-darkText font-bold"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {section}
                    </button>
                    <button
                      onClick={() => handleRemoveSection(section)}
                      className="text-red-500 hover:text-red-700 text-sm px-1 transition-colors"
                      title="Fjern sektion"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {!showAddSectionInput ? (
                  <button
                    onClick={() => setShowAddSectionInput(true)}
                    className="px-3 py-1 rounded-lg text-sm bg-action text-darkText hover:bg-actionHover transition-colors duration-150 cursor-pointer"
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
                          handleAddSection();
                        } else if (e.key === "Escape") {
                          setShowAddSectionInput(false);
                          setNewSectionName("");
                        }
                      }}
                      placeholder="Sektionsnavn (f.eks. 'Sauce')"
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action"
                      autoFocus
                    />
                    <button
                      onClick={handleAddSection}
                      className="px-3 py-1 rounded-lg text-sm bg-action text-darkText hover:bg-actionHover transition-colors duration-150 cursor-pointer"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setShowAddSectionInput(false);
                        setNewSectionName("");
                      }}
                      className="px-3 py-1 rounded-lg text-sm bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors duration-150 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 relative">
              <div ref={searchBarRef} className="relative">
                <SearchBar
                  onChange={setSearchTerm}
                  placeholder="Søg efter ingredienser..."
                />
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto">
                    {searchTerm.trim() && (
                      <div className="hover:bg-gray-100 cursor-pointer bg-gray-50 p-2">
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
                      <div
                        key={item.name}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <AddIngredientComponent
                          onAdd={async (newItem) => {
                            handleAddIngredient(newItem);
                            setSearchTerm("");
                            setIsDropdownOpen(false);
                          }}
                          itemName={item.name}
                          InputCategory={item.category}
                          defaultUnit={item.defaultUnit}
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
            onClickF={onClose}
            Itext="Done"
            color="bg-action"
            extraCSS="w-full"
          />
        </div>
      </div>
    </div>
  );
}
