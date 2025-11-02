//------------------ Categories and UnitTypes ------------------------//
export async function addCategoryApi(newCategory: string) {
  await fetch("/api/admin/recipeCategories", {
    method: "POST",
    body: JSON.stringify({ name: newCategory }),
  });
}

export async function removeCategoryApi(name: string) {
  await fetch("/api/admin/recipeCategories", {
    method: "DELETE",
    body: JSON.stringify({ name }),
  });
}

export async function addUnitApi(newUnit: string) {
  if (!newUnit) return;
  await fetch("/api/admin/unitTypes", {
    method: "POST",
    body: JSON.stringify({ name: newUnit }),
  });
}

export async function removeUnitApi(name: string) {
  await fetch("/api/admin/unitTypes", {
    method: "DELETE",
    body: JSON.stringify({ name }),
  });
}
