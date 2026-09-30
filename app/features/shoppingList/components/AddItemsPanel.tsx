"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import Button from "../../../components/Button";
import { IngredientEditor } from "../../recipes/components/IngredientEditor";
import {
  EditorRow,
  emptyEditorRows,
  rowsToIngredients,
} from "../../recipes/utils/ingredientRows";
import { useShoppingList } from "../hooks/useShoppinglist";

// Inline "add items" box above the list. Its own component so typing here
// doesn't re-render the whole shopping list.
export function AddItemsPanel() {
  const { addIngredients, isSaving } = useShoppingList();
  // Items being typed in, before they are added to the list.
  const [rows, setRows] = useState<EditorRow[]>(emptyEditorRows);
  const newItems = rowsToIngredients(rows);

  const reset = () => setRows(emptyEditorRows());

  const handleAdd = () => {
    if (!newItems.length) return;
    addIngredients(newItems);
    reset();
  };

  return (
    <div className="mb-4 space-y-3 rounded-xl bg-surface p-3">
      <IngredientEditor
        title="Tilføj varer"
        rows={rows}
        onChange={setRows}
        allowSections={false}
      />
      {newItems.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={reset}>
            Ryd
          </Button>
          <Button size="sm" onClick={handleAdd} disabled={isSaving}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tilføj {newItems.length} til listen
          </Button>
        </div>
      )}
    </div>
  );
}
