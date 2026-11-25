"use client";
import { useState } from "react";
import { useConstants } from "../../../context/ConstantsContext";
import Button from "../../../components/Button";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import { Trash2 } from "lucide-react";

// What the delete dialog asks about: set when a trash button is tapped.
type PendingDelete = {
  name: string;
  consequence: string;
  remove: (name: string) => Promise<void>;
};

const CATEGORY_CONSEQUENCE =
  "Opskrifter med kategorien beholder den, men den kan ikke vælges længere. Det kan ikke fortrydes.";
const UNIT_CONSEQUENCE =
  "Ingredienser med enheden beholder den, men den kan ikke vælges længere. Det kan ikke fortrydes.";

// Recipe categories and unit types.
export default function AdminPageClient() {
  const {
    categories,
    units,
    addCategory,
    removeCategory,
    addUnit,
    removeUnit,
  } = useConstants();

  const [newCategory, setNewCategory] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );

  return (
    <>
      {/* Opskriftskategorier */}
      <div className="mb-10">
        <h2 className="text-section-title">Opskriftskategorier</h2>
        <div className="flex mt-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border rounded p-2 mr-2"
            placeholder="Tilføj ny kategori"
            aria-label="Ny kategori"
          />
          <Button
            onClick={() => {
              addCategory(newCategory);
              setNewCategory("");
            }}
            variant="primary"
            size="lg"
            fullWidth
          >
            Tilføj
          </Button>
        </div>
        <div className="w-1/2 my-2 p-1 bg-background rounded-lg">
          {categories.map((c) => (
            <div
              key={c._id}
              className="ml-2 w-full flex justify-between items-center"
            >
              <label>{c.name}</label>
              <Button
                variant="danger-ghost"
                size="sm"
                aria-label={`Fjern kategori: ${c.name}`}
                onClick={() =>
                  setPendingDelete({
                    name: c.name,
                    consequence: CATEGORY_CONSEQUENCE,
                    remove: removeCategory,
                  })
                }
                className="w-11"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Enhedstyper */}
      <div>
        <h2 className="text-section-title">Enhedstyper</h2>
        <div className="flex mt-2">
          <input
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            className="border rounded p-2 mr-2"
            placeholder="Tilføj ny enhed"
            aria-label="Ny enhed"
          />
          <Button
            onClick={() => {
              addUnit(newUnit);
              setNewUnit("");
            }}
            variant="primary"
            size="lg"
            fullWidth
          >
            Tilføj
          </Button>
        </div>
        <ul className="w-1/2 my-2 py-1 px-2 bg-background rounded-lg">
          {units.map((u) => (
            <li
              key={u._id}
              className="ml-2 w-full flex justify-between items-center"
            >
              <label>{u.name}</label>
              <Button
                variant="danger-ghost"
                size="sm"
                aria-label={`Fjern enhed: ${u.name}`}
                onClick={() =>
                  setPendingDelete({
                    name: u.name,
                    consequence: UNIT_CONSEQUENCE,
                    remove: removeUnit,
                  })
                }
                className="w-11"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {pendingDelete && (
        <ConfirmationDialog
          open
          onClose={() => setPendingDelete(null)}
          onConfirm={() => pendingDelete.remove(pendingDelete.name)}
          title={`Slet «${pendingDelete.name}»?`}
          message={pendingDelete.consequence}
          confirmLabel="Slet"
          cancelLabel="Behold den"
          tone="danger"
        />
      )}
    </>
  );
}
