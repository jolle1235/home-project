//------------------ Categories and UnitTypes ------------------------//
export const CATEGORIES_API = "/api/admin/recipeCategories";
export const UNITS_API = "/api/admin/unitTypes";

// Adds or removes one name; throws when the server refuses, so callers can say so.
async function mutateConstant(
  path: string,
  method: "POST" | "DELETE",
  name: string,
) {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error(`${method} ${path} failed`);
}

export const addCategoryApi = (name: string) =>
  mutateConstant(CATEGORIES_API, "POST", name);
export const removeCategoryApi = (name: string) =>
  mutateConstant(CATEGORIES_API, "DELETE", name);
export const addUnitApi = (name: string) =>
  mutateConstant(UNITS_API, "POST", name);
export const removeUnitApi = (name: string) =>
  mutateConstant(UNITS_API, "DELETE", name);
