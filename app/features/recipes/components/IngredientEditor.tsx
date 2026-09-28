"use client";

import { ClipboardEvent, KeyboardEvent, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ClipboardPaste,
  Heading,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import Button from "../../../components/Button";
import { IconButton } from "../../../components/IconButton";
import { Item } from "../../../model/Item";
import { searchItem } from "../../../utils/apiHelperFunctions";
import { KNOWN_UNITS, unifyUnit } from "../../../utils/unitHelper";
import {
  EditorRow,
  IngredientRow,
  isEmptyRow,
  linesToRows,
  sectionRow,
  SectionRow,
  withTrailingEmptyRow,
} from "../utils/ingredientRows";

interface IngredientEditorProps {
  rows: EditorRow[];
  onChange: (rows: EditorRow[]) => void;
  // Unit names from the admin unit list, offered next to the built-in ones.
  units: string[];
  error?: string;
}

const fieldClass = "min-h-[44px] px-2 py-2";

function splitLines(text: string): string[] {
  return text.split(/\r?\n/).filter((line) => line.trim());
}

export function IngredientEditor({
  rows,
  onChange,
  units,
  error,
}: IngredientEditorProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const unitOptions = useMemo(
    () =>
      Array.from(
        new Set<string>([
          ...KNOWN_UNITS,
          ...units.map((u) => u.trim().toLowerCase()).filter(Boolean),
        ]),
      ),
    [units],
  );

  const ingredientCount = rows.filter(
    (row) => row.kind === "ingredient" && row.name.trim(),
  ).length;

  // Rows always end with exactly one empty "add" row (every write goes
  // through commit); these are the rows before it.
  const filledRows = rows.slice(0, -1);

  const commit = (next: EditorRow[]) => onChange(withTrailingEmptyRow(next));

  const updateRow = (key: string, patch: Partial<EditorRow>) =>
    commit(
      rows.map((row) =>
        row.key === key ? ({ ...row, ...patch } as EditorRow) : row,
      ),
    );

  const removeRow = (key: string) => {
    commit(rows.filter((row) => row.key !== key));
    setExpandedKey(null);
  };

  const moveRow = (index: number, direction: -1 | 1) => {
    const next = [...filledRows];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  };

  // Pasting several lines into a row replaces that row (if empty) or
  // inserts after it.
  const insertLinesAt = (key: string, lines: string[]) => {
    const parsed = linesToRows(lines, units);
    if (!parsed.length) return;
    const index = rows.findIndex((row) => row.key === key);
    const replace = index !== -1 && isEmptyRow(rows[index]);
    const next = [...rows];
    next.splice(replace ? index : index + 1, replace ? 1 : 0, ...parsed);
    commit(next);
  };

  const appendPasted = () => {
    const parsed = linesToRows(splitLines(pasteText), units);
    if (parsed.length) commit([...filledRows, ...parsed]);
    setPasteText("");
    setIsPasteOpen(false);
  };

  const addSection = () => {
    const row = sectionRow();
    commit([...filledRows, row]);
    setFocusKey(row.key);
  };

  const focusNextName = (key: string) => {
    requestAnimationFrame(() => {
      const inputs = Array.from(
        listRef.current?.querySelectorAll<HTMLInputElement>(
          "input[data-row-name]",
        ) ?? [],
      );
      const index = inputs.findIndex((el) => el.dataset.rowName === key);
      inputs[index + 1]?.focus();
    });
  };


  return (
    <section className="space-y-3" aria-labelledby="ingredienser-heading">
      <div className="flex items-center justify-between gap-2">
        <h3
          id="ingredienser-heading"
          className="text-gray-700 text-sm font-bold"
        >
          Ingredienser{ingredientCount ? ` (${ingredientCount})` : ""}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPasteOpen((open) => !open)}
          aria-expanded={isPasteOpen}
        >
          <ClipboardPaste className="h-4 w-4" aria-hidden="true" />
          Indsæt som tekst
        </Button>
      </div>

      {isPasteOpen && (
        <div className="rounded-xl bg-surface p-3 space-y-2">
          <label htmlFor="ingredient-paste" className="block text-sm">
            Én ingrediens pr. linje. En linje der slutter med kolon (fx
            &quot;Til saucen:&quot;) bliver en sektion.
          </label>
          <textarea
            id="ingredient-paste"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={6}
            className="w-full"
            placeholder={"200 g hvedemel\n2 dl mælk\n1 tsk salt"}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setPasteText("");
                setIsPasteOpen(false);
              }}
            >
              Annuller
            </Button>
            <Button size="sm" onClick={appendPasted} disabled={!pasteText.trim()}>
              Tilføj
            </Button>
          </div>
        </div>
      )}

      <div ref={listRef} className="space-y-2">
        {rows.map((row, index) => {
          const isAddRow = index === rows.length - 1;
          const moveProps = {
            canMoveUp: !isAddRow && index > 0,
            canMoveDown: index < filledRows.length - 1,
            onMoveUp: () => moveRow(index, -1),
            onMoveDown: () => moveRow(index, 1),
            onRemove: () => removeRow(row.key),
          };
          return row.kind === "section" ? (
            <SectionRowEditor
              key={row.key}
              row={row}
              autoFocus={row.key === focusKey}
              onChange={(name) => updateRow(row.key, { name })}
              onEnter={() => focusNextName(row.key)}
              {...moveProps}
            />
          ) : (
            <IngredientRowEditor
              key={row.key}
              row={row}
              isAddRow={isAddRow}
              unitOptions={unitOptions}
              expanded={expandedKey === row.key}
              onToggleExpanded={() =>
                setExpandedKey((current) =>
                  current === row.key ? null : row.key,
                )
              }
              onChange={(patch) => updateRow(row.key, patch)}
              onEnter={() => focusNextName(row.key)}
              onPasteLines={(lines) => insertLinesAt(row.key, lines)}
              {...moveProps}
            />
          );
        })}
      </div>

      <Button variant="secondary" size="sm" onClick={addSection}>
        <Heading className="h-4 w-4" aria-hidden="true" />
        Tilføj sektion
      </Button>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </section>
  );
}

interface MoveProps {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

function RowActions({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
}: MoveProps) {
  return (
    <>
      <IconButton
        icon={ArrowUp}
        variant="ghost"
        size="sm"
        ariaLabel="Flyt op"
        onClick={onMoveUp}
        disabled={!canMoveUp}
        className="min-h-[44px] min-w-[44px]"
      />
      <IconButton
        icon={ArrowDown}
        variant="ghost"
        size="sm"
        ariaLabel="Flyt ned"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        className="min-h-[44px] min-w-[44px]"
      />
      <IconButton
        icon={Trash2}
        variant="ghost"
        size="sm"
        ariaLabel="Slet"
        onClick={onRemove}
        className="min-h-[44px] min-w-[44px] text-red-700 hover:bg-red-100"
      />
    </>
  );
}

function preventSubmitOnEnter(
  e: KeyboardEvent<HTMLInputElement>,
  onEnter: () => void,
) {
  if (e.key === "Enter") {
    e.preventDefault();
    onEnter();
  }
}

function SectionRowEditor({
  row,
  autoFocus,
  onChange,
  onEnter,
  ...moveProps
}: MoveProps & {
  row: SectionRow;
  autoFocus: boolean;
  onChange: (name: string) => void;
  onEnter: () => void;
}) {
  return (
    <div className="flex items-center gap-1 pt-2">
      <input
        type="text"
        value={row.name}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => preventSubmitOnEnter(e, onEnter)}
        autoFocus={autoFocus}
        placeholder="Sektionsnavn, fx Til saucen"
        aria-label="Sektionsnavn"
        className={`${fieldClass} flex-1 min-w-0 font-semibold`}
      />
      <RowActions {...moveProps} />
    </div>
  );
}

function IngredientRowEditor({
  row,
  isAddRow,
  unitOptions,
  expanded,
  onToggleExpanded,
  onChange,
  onEnter,
  onPasteLines,
  ...moveProps
}: MoveProps & {
  row: IngredientRow;
  isAddRow: boolean;
  unitOptions: string[];
  expanded: boolean;
  onToggleExpanded: () => void;
  onChange: (patch: Partial<IngredientRow>) => void;
  onEnter: () => void;
  onPasteLines: (lines: string[]) => void;
}) {
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const latestTerm = useRef("");

  const options = unitOptions.includes(row.unit)
    ? unitOptions
    : [row.unit, ...unitOptions];
  const isLinked = row.itemId !== "unknown" && Boolean(row.itemId);

  const search = (term: string) => {
    latestTerm.current = term;
    clearTimeout(searchTimer.current);
    if (term.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      const items = await searchItem(term.trim());
      if (latestTerm.current !== term) return;
      setSuggestions(items.slice(0, 6));
      setHighlighted(-1);
      setIsOpen(items.length > 0);
    }, 250);
  };

  const linkItem = (item: Item, { setUnit }: { setUnit: boolean }) => {
    const defaultUnit =
      item.defaultUnit && item.defaultUnit !== "unknown" ? item.defaultUnit : "";
    onChange({
      name: item.name,
      itemId: item._id,
      category: item.category,
      defaultUnit,
      ...(setUnit && defaultUnit && row.unit === "stk"
        ? { unit: unifyUnit(defaultUnit) }
        : {}),
    });
  };

  const pick = (item: Item) => {
    linkItem(item, { setUnit: true });
    setIsOpen(false);
  };

  const handleNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isOpen && e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (isOpen && e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && highlighted >= 0) {
        pick(suggestions[highlighted]);
      } else {
        setIsOpen(false);
        onEnter();
      }
    }
  };

  // Link to the catalogue item when the typed name matches one exactly.
  const handleNameBlur = () => {
    setIsOpen(false);
    if (isLinked || latestTerm.current !== row.name) return;
    const exact = suggestions.find(
      (item) => item.name.toLowerCase() === row.name.trim().toLowerCase(),
    );
    if (exact) linkItem(exact, { setUnit: false });
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (/\r?\n/.test(text.trim())) {
      e.preventDefault();
      onPasteLines(splitLines(text));
    }
  };

  const listboxId = `${row.key}-suggestions`;

  return (
    <div
      className={`rounded-xl border ${
        isAddRow ? "border-dashed border-muted" : "border-secondary/40"
      } bg-background`}
    >
      <div className="flex items-center gap-1.5 p-1.5">
        <input
          type="text"
          inputMode="decimal"
          value={row.quantity}
          onChange={(e) => onChange({ quantity: e.target.value })}
          onKeyDown={(e) => preventSubmitOnEnter(e, onEnter)}
          placeholder="Antal"
          aria-label="Antal"
          className={`${fieldClass} w-16 shrink-0 text-right`}
        />
        <select
          value={row.unit}
          onChange={(e) => onChange({ unit: e.target.value })}
          aria-label="Enhed"
          className={`${fieldClass} w-[4.75rem] shrink-0 rounded-lg border border-muted bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
        >
          {options.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            value={row.name}
            data-row-name={row.key}
            onChange={(e) => {
              onChange({
                name: e.target.value,
                itemId: "unknown",
                category: "unknown",
                defaultUnit: "",
              });
              search(e.target.value);
            }}
            onKeyDown={handleNameKeyDown}
            onBlur={handleNameBlur}
            onPaste={handlePaste}
            placeholder={isAddRow ? "Tilføj ingrediens…" : "Ingrediens"}
            aria-label="Ingrediens"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            autoComplete="off"
            className={`${fieldClass} w-full`}
          />
          {isOpen && suggestions.length > 0 && (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-lg border border-muted bg-background shadow-lg"
            >
              {suggestions.map((item, i) => (
                <li
                  key={item._id}
                  role="option"
                  aria-selected={i === highlighted}
                  // mousedown so the input doesn't blur (and close) first
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(item);
                  }}
                  className={`cursor-pointer px-3 py-3 text-sm ${
                    i === highlighted ? "bg-soft" : "hover:bg-soft"
                  }`}
                >
                  {item.name}
                  {item.category && item.category !== "unknown" && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {item.category}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {!isAddRow && (
          <IconButton
            icon={MoreHorizontal}
            variant="ghost"
            size="sm"
            ariaLabel="Flere valg"
            aria-expanded={expanded}
            onClick={onToggleExpanded}
            className="min-h-[44px] min-w-[44px] shrink-0"
          />
        )}
      </div>

      {!expanded && row.notes && (
        <p className="px-3 pb-2 -mt-0.5 text-xs text-muted-foreground">
          {row.notes}
        </p>
      )}

      {expanded && (
        <div className="flex items-center gap-1 px-1.5 pb-1.5">
          <input
            type="text"
            value={row.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            onKeyDown={(e) => preventSubmitOnEnter(e, onToggleExpanded)}
            placeholder="Note, fx hakket"
            aria-label="Note"
            className={`${fieldClass} flex-1 min-w-0 text-sm`}
          />
          <RowActions {...moveProps} />
        </div>
      )}
    </div>
  );
}
