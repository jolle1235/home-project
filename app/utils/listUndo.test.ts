import { describe, expect, it } from "vitest";
import { removeWhere, restoreAt } from "./listUndo";

type Row = { id: string; marked?: boolean };
const key = (row: Row) => row.id;
const ids = (rows: Row[]) => rows.map(key);

const a: Row = { id: "a", marked: true };
const b: Row = { id: "b" };
const c: Row = { id: "c", marked: true };
const d: Row = { id: "d" };

describe("removeWhere", () => {
  it("splits the list into kept rows and removed rows with their positions", () => {
    const { kept, removed } = removeWhere([a, b, c, d], (row) => !!row.marked);
    expect(ids(kept)).toEqual(["b", "d"]);
    expect(removed).toEqual([
      { index: 0, item: a },
      { index: 2, item: c },
    ]);
  });

  it("removes nothing when nothing matches", () => {
    const { kept, removed } = removeWhere([b, d], (row) => !!row.marked);
    expect(ids(kept)).toEqual(["b", "d"]);
    expect(removed).toEqual([]);
  });
});

describe("restoreAt", () => {
  it("puts removed rows back at their original positions", () => {
    const { kept, removed } = removeWhere([a, b, c, d], (row) => !!row.marked);
    expect(ids(restoreAt(kept, removed, key))).toEqual(["a", "b", "c", "d"]);
  });

  it("clamps positions past the end of a list that has shrunk since", () => {
    const { removed } = removeWhere([a, b, c, d], (row) => row.id === "d");
    expect(ids(restoreAt([a], removed, key))).toEqual(["a", "d"]);
    expect(ids(restoreAt([], removed, key))).toEqual(["d"]);
  });

  it("skips rows whose key is already in the list", () => {
    const { kept, removed } = removeWhere([a, b, c], (row) => !!row.marked);
    const readded = [...kept, a];
    expect(ids(restoreAt(readded, removed, key))).toEqual(["b", "a", "c"]);
  });

  it("returns the list unchanged when nothing was removed", () => {
    const list = [b, d];
    expect(restoreAt(list, [], key)).toEqual(list);
  });

  it("does not change the list it is given", () => {
    const { kept, removed } = removeWhere([a, b], (row) => row.id === "a");
    restoreAt(kept, removed, key);
    expect(ids(kept)).toEqual(["b"]);
  });
});
