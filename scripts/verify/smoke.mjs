// Drives every feature in the verify-home-project feature map once, read-only,
// and fails on any missing content, console error or failing API call.
//
//   npm run verify:smoke -- [<id>]
//
// Expected content comes from the instance's own API, so the same run works on
// fixtures and on the local snapshot.
import { openDriver } from "./driver.mjs";
import { cliArgs, resolveId } from "./lib.mjs";

const id = resolveId(cliArgs().id);
const app = await openDriver({ id });
const { page } = app;
const results = [];

async function step(name, run) {
  try {
    const detail = await run();
    results.push({ name, ok: true, detail: detail ?? "" });
  } catch (error) {
    results.push({ name, ok: false, detail: error.message.split("\n")[0] });
    await app.shot(`smoke-failed-${name.replace(/\W+/g, "-")}`).catch(() => {});
  }
}

const visible = (locator) => locator.first().waitFor({ state: "visible" });

const recipes = await app.api("/api/recipe");
const food = recipes.find((recipe) => recipe.type !== "drink");
const drink = recipes.find((recipe) => recipe.type === "drink");
const shoppingList = await app.api("/api/shopping-list");
const categories = await app.api("/api/admin/recipeCategories");

await step("recipes-browse", async () => {
  await app.goto("/recipes");
  await visible(page.getByRole("heading", { name: "Opskrifter" }));
  if (food) await visible(page.locator("article h2", { hasText: food.recipeName }));
  await app.shot("smoke-recipes");
  return `${recipes.length} recipes`;
});

await step("recipes-browse:drinks", async () => {
  await app.goto("/recipes?type=drink");
  await visible(page.getByRole("heading", { name: "Drinks" }));
  if (drink) await visible(page.locator("article h2", { hasText: drink.recipeName }));
});

await step("recipe-detail", async () => {
  if (!food) return "skipped: no food recipe";
  await app.goto(`/recipes/${food._id}`);
  await visible(page.getByRole("heading", { name: "Ingredienser" }));
  await visible(page.getByRole("heading", { name: food.recipeName }));
  const boxes = await page.locator('input[type="checkbox"]').count();
  if (boxes !== food.ingredients.length) {
    throw new Error(`${boxes} checkboxes for ${food.ingredients.length} ingredients`);
  }
  await app.shot("smoke-recipe-detail");
  return `${boxes} ingredients`;
});

await step("recipe-editor", async () => {
  await app.goto("/add-recipe");
  await visible(page.getByLabel("Navn"));
  if (food) {
    await app.goto(`/add-recipe?id=${food._id}`);
    await page.waitForFunction(
      (name) => [...document.querySelectorAll("input")].some((input) => input.value === name),
      food.recipeName,
    );
  }
  await app.shot("smoke-recipe-editor");
});

await step("shopping-list", async () => {
  await app.goto("/shoppinglist");
  await visible(page.getByRole("heading", { name: "Indkøbsliste" }));
  if (shoppingList[0]) await visible(page.getByText(shoppingList[0].item.name));
  await app.shot("smoke-shopping-list");
  return `${shoppingList.length} items`;
});

await step("week-planner", async () => {
  await app.goto("/weekPlanner");
  await visible(page.getByRole("heading", { name: "Madplan" }));
  await visible(page.locator("div.border.rounded h6"));
  const days = await page.locator("div.border.rounded h6").count();
  if (days < 15) throw new Error(`${days} days in the grid`);
  await app.shot("smoke-week-planner");
  return `${days} days`;
});

await step("admin", async () => {
  await app.goto("/admin");
  await visible(page.getByRole("heading", { name: "Admin Panel" }));
  if (categories[0]) await visible(page.getByText(categories[0].name, { exact: true }));
  await app.shot("smoke-admin");
  return `${categories.length} categories`;
});

const { problems, evidence } = await app.close();
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
console.log(problems.length ? `\nProblems:\n${problems.join("\n")}` : "\nNo console errors or failing API calls.");
console.log(`Evidence: ${evidence}`);
process.exit(results.every((r) => r.ok) && problems.length === 0 ? 0 : 1);
