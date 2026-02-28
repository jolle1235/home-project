export const shoppingStores = [
  "Netto",
  "Rema",
  "Føtex",
  "Lidl",
  "Meny",
  "Andre",
] as const;

export type ShoppingStore = (typeof shoppingStores)[number];
