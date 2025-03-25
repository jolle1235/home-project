"use client"
import { useShoppingListContext } from "../context/ShoppinglistContext";
import { Item } from "../model/Item";

export function ShoppingListItemComponent({ item }: { item: Item }) {
  

  const {updateItemQuantity, toggleMarkedItem } = useShoppingListContext();

  return (
    <div
      id="shopping_list_item"
      className="flex flex-row w-full h-fit items-center px-3 p-2 border-b border-lightgreyBackground"
    >
      <input
        type="checkbox"
        checked={item.marked}
        className="w-8 h-8 mr-5"
        onChange={() => toggleMarkedItem(item._id)}
      />
      <div className="flex basis-1/4 flex-grow flex-col min-w-1/6">
        <p className="font-bold text-xl">
          {item.name || "Unnamed Item"}
        </p>
        <div className="flex flex-row w-fit">
          <input
            className="text-lightgreytxt p-1 mx-2 rounded-lg w-14 h-fit border border-lightgreyBackground"
            value={item.quantity}
            onChange={(e) => {
              updateItemQuantity(item._id ,Number(e.target.value));
            }}
          />
          <p className="text-lightgreytxt flex-grow">
            {item.unit}
          </p>
        </div>
      </div>
      <p className="pr-5 w-fit text-xl">Butik</p> 

    </div>
  );
}
