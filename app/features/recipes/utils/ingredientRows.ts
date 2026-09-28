import { Ingredient } from "../../../model/Ingredient";
import { unifyUnit } from "../../../utils/unitHelper";
import {
  ParsedLine,
  parseIngredientLine,
  parseQuantity,
  roundQuantity,
} from "./parseIngredientLine";

// The ingredient editor works on a flat list of rows, where a section row
// starts a group. On save it becomes Ingredient[] with `section` set, so
// the stored data model stays the same.

export interface IngredientRow {
  key: string;
  kind: "ingredient";
  quantity: string;
  unit: string;
  name: string;
  notes: string;
  // Catalogue link; "unknown" for free text.
  itemId: string;
  category: string;
  defaultUnit: string;
  // The stored ingredient this row came from, so untouched fields
  // (marked, price, ...) survive an edit.
  base?: Ingredient;
}

export interface SectionRow {
  key: string;
  kind: "section";
  name: string;
}

export type EditorRow = IngredientRow | SectionRow;

let keyCounter = 0;
function newRowKey(): string {
  keyCounter += 1;
  return `row-${Date.now().toString(36)}-${keyCounter}`;
}

function formatQuantity(quantity: number | null | undefined): string {
  if (quantity == null || Number.isNaN(quantity)) return "";
  return String(roundQuantity(quantity)).replace(".", ",");
}

export function emptyIngredientRow(): IngredientRow {
  return {
    key: newRowKey(),
    kind: "ingredient",
    quantity: "",
    unit: "stk",
    name: "",
    notes: "",
    itemId: "unknown",
    category: "unknown",
    defaultUnit: "",
  };
}

export function sectionRow(name = ""): SectionRow {
  return { key: newRowKey(), kind: "section", name };
}

// A blank editor: just the empty "add" row.
export function emptyEditorRows(): EditorRow[] {
  return [emptyIngredientRow()];
}

export function isEmptyRow(row: EditorRow): boolean {
  return row.kind === "ingredient" && !row.name.trim() && !row.quantity.trim();
}

// Keeps exactly one empty ingredient row at the end, for typing the next one.
export function withTrailingEmptyRow(rows: EditorRow[]): EditorRow[] {
  let end = rows.length;
  while (end > 0 && isEmptyRow(rows[end - 1])) end--;
  const trimmed = rows.slice(0, end);
  const last = rows[end];
  return [...trimmed, last ?? emptyIngredientRow()];
}

function parsedLineToRow(line: ParsedLine): EditorRow {
  if (line.kind === "section") return sectionRow(line.name);
  return {
    ...emptyIngredientRow(),
    quantity: formatQuantity(line.quantity),
    unit: line.unit,
    name: line.name,
    notes: line.notes,
  };
}

// Parses pasted or imported ingredient lines into editor rows.
export function linesToRows(lines: string[], units: string[]): EditorRow[] {
  return lines
    .map((line) => parseIngredientLine(line, units))
    .filter((line) => line !== null)
    .map(parsedLineToRow);
}

export function ingredientsToRows(ingredients: Ingredient[]): EditorRow[] {
  const rows: EditorRow[] = [];
  let section: string | undefined;
  for (const ingredient of ingredients) {
    const next = ingredient.section || undefined;
    if (next && next !== section) rows.push(sectionRow(next));
    section = next;
    rows.push({
      key: newRowKey(),
      kind: "ingredient",
      quantity: formatQuantity(ingredient.quantity),
      unit: ingredient.unit || "stk",
      name: ingredient.item?.name ?? "",
      notes: ingredient.notes ?? "",
      itemId: ingredient.item?._id || "unknown",
      category: ingredient.item?.category || "unknown",
      defaultUnit: ingredient.item?.defaultUnit || "",
      base: ingredient,
    });
  }
  return withTrailingEmptyRow(rows);
}

// Empty rows are dropped. A blank quantity becomes 1, as elsewhere in the app.
export function rowsToIngredients(rows: EditorRow[]): Ingredient[] {
  const result: Ingredient[] = [];
  let section: string | undefined;
  for (const row of rows) {
    if (row.kind === "section") {
      section = row.name.trim() || undefined;
      continue;
    }
    const name = row.name.trim();
    if (!name) continue;
    const unit = unifyUnit(row.unit);
    const notes = row.notes.trim();
    const base: Partial<Ingredient> = { ...row.base };
    delete base.section;
    delete base.notes;
    result.push({
      _id: "unknown",
      marked: false,
      ...base,
      item: {
        _id: row.itemId || "unknown",
        name,
        category: row.category || "unknown",
        defaultUnit: unifyUnit(row.defaultUnit || unit),
      },
      unit,
      quantity: parseQuantity(row.quantity) ?? 1,
      ...(section ? { section } : {}),
      ...(notes ? { notes } : {}),
    });
  }
  return result;
}
