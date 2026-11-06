export const shoppingStores = [
  "Netto",
  "Rema",
  "Føtex",
  "Lidl",
  "Meny",
  "Andre",
] as const;

type ShoppingStore = (typeof shoppingStores)[number];
