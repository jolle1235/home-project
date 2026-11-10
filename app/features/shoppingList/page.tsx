import { requireSession } from "@/app/lib/auth";
import ShoppingListPageClient from "./client/ShoppingListPageClient";

import { getShoppingList } from "./server/shoppinglist.server";

export default async function Page() {
  await requireSession();
  const shoppingList = await getShoppingList();

  return <ShoppingListPageClient initialShoppingList={shoppingList} />;
}
