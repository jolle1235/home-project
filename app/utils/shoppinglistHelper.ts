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
