import { shoppinglistCategories } from "../constant/shoppinglistCategories";
import { Ingredient } from "../model/Ingredient";

export function normalizeIngredient({
  itemName,
  quantity,
  unit,
  defaultUnit,
  category,
}: {
  itemName: string;
  quantity?: number | "";
  unit?: string;
  defaultUnit?: string;
  category?: string;
}) {
  const finalQuantity =
    quantity === "" || quantity === undefined || quantity === null
      ? 1
      : Number(quantity);

  const finalUnit = unit || "stk";

  return {
    _id: "unknown",
    item: {
      _id: "unknown",
      name: itemName,
      category: category || "unknown",
      defaultUnit: defaultUnit || finalUnit,
    },
    quantity: finalQuantity,
    unit: finalUnit,
    marked: false,
  };
}

export function getCategoryIcon(category?: string) {
  if (!category) return null;

  return category in shoppinglistCategories
    ? shoppinglistCategories[category as keyof typeof shoppinglistCategories]
    : null;
}

// 🔹 Helpers
const compareStrings = (a?: string, b?: string) =>
  (a ?? "").localeCompare(b ?? "", "da", { sensitivity: "base" });

export function sortByCenter(list: Ingredient[]) {
  const compareStrings = (a?: string, b?: string) =>
    (a ?? "").localeCompare(b ?? "", "da", { sensitivity: "base" });

  return [...list].sort((a, b) => {
    const centerCompare = compareStrings(a.center, b.center);
    if (centerCompare !== 0) return centerCompare;

    const categoryCompare = compareStrings(a.item?.category, b.item?.category);
    if (categoryCompare !== 0) return categoryCompare;

    return compareStrings(a.item?.name, b.item?.name);
  });
}
