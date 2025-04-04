"use client"
import { useEffect, useRef, useState } from "react";
import { AddIngredientComponent } from "../components/AddIngredientComponent";
import SearchBar from "../components/SearchBarComponent";
import { useShoppingListContext } from "../context/ShoppinglistContext";
import { searchItem, createItem } from "../utils/apiHelperFunctions";
import { Item } from "../model/Item";
import { ShoppingListItemComponent } from "../components/ShoppingListItemComponent";
import { Ingredient } from "../model/Ingredient";


export default function ShoppingListPage() {
  const {addIngredient, shoppingList, isSomethingMarked, clearMarked} = useShoppingListContext()

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[]>([]);


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

  function addToShoppinglist(newItem: Ingredient){
    addIngredient(newItem)
  }


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false); // Close dropdown if clicked outside
      }
    };

    // Attach the event listener to detect outside clicks
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col bg-lightBackground w-full h-full justify-between px-4 sm:px-6 md:px-10 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start w-full mt-4 sm:mt-7">
        <h1 className="text-2xl sm:text-3xl md:text-4xl text-darkText mb-4 sm:mb-6 md:mb-10 mr-0 sm:mr-4 md:mr-10">
          Indkøbsliste
        </h1>

        <div ref={searchBarRef} className="relative w-full sm:w-2/3 md:w-1/2">
                <SearchBar onChange={setSearchTerm} placeholder="Søg efter varer" />
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full sm:w-3/4 md:w-1/2 min-w-0 sm:min-w-96 bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                    {searchTerm.trim() && (
                      <div className="hover:bg-gray-100 cursor-pointer bg-gray-50 p-2">
                        <AddIngredientComponent
                          onAdd={async (returnItem: Ingredient) => {
                            const newItem: Ingredient = returnItem
                            await createItem(newItem);
                            addToShoppinglist(newItem)
                            setSearchTerm("");
                          }}
                          itemName={searchTerm}
                        />
                      </div>
                    )}
                    {items.map((item) => (
                      <div key={item._id} className="p-2 hover:bg-gray-100 cursor-pointer">
                        <AddIngredientComponent
                          onAdd={async (returnItem: Ingredient) => {
                            addToShoppinglist(returnItem);
                            setSearchTerm("");
                          }}
                          itemName={item.name}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
      </div>
      <div
        id="shopping_list"
        className="flex flex-col relative w-full border-t border-two text-darkText overflow-y-auto mt-4"
        style={{ height: "calc(100vh - 200px)" }}
      >
        <div className="overflow-y-auto flex-grow flex flex-col w-full">
          {shoppingList.length === 0 && (
            <p className="text-center py-4 text-gray-500">Der er ikke tilføjet nogle vare endnu</p>
          )}

          {shoppingList.map((ingredient) => (
            <ShoppingListItemComponent
              key={ingredient._id}
              ingredient={ingredient}
            />
          ))}
          
        </div>
        <div className="w-full h-16 sm:h-20 flex justify-end">
          {isSomethingMarked() === true && (
            <button
              className="bg-cancel text-darkText w-12 h-12 sm:w-14 sm:h-14 rounded-full flex justify-center items-center p-2 m-2"
              onClick={() => {
                clearMarked();
              }}
            >
              <img src="./icon/delete.png" alt="Delete" className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
