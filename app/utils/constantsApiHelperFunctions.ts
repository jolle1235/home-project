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

export async function addUnitApi(newUnit: string): Promise<boolean> {
  if (!newUnit) return false;
  try {
    const response = await fetch("/api/admin/unitTypes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newUnit }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error adding unit:", error);
    return false;
  }
}

export async function removeUnitApi(name: string) {
  await fetch("/api/admin/unitTypes", {
    method: "DELETE",
    body: JSON.stringify({ name }),
  });
}
