import ShoppingListPageClient from "./client/ShoppingListPageClient";

import { getShoppingList } from "./server/shoppinglist.server";

export default async function Page() {
  const shoppingList = await getShoppingList();

  return <ShoppingListPageClient initialShoppingList={shoppingList} />;
}
