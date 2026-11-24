export type Removed<T> = { index: number; item: T }[];

// Splits a list into the rows that stay and the rows that go, each with its position, so
// `restoreAt` can put them back where they were.
export function removeWhere<T>(
  list: T[],
  isRemoved: (item: T) => boolean,
): { kept: T[]; removed: Removed<T> } {
  const kept: T[] = [];
  const removed: Removed<T> = [];
  list.forEach((item, index) => {
    if (isRemoved(item)) removed.push({ index, item });
    else kept.push(item);
  });
  return { kept, removed };
}

// Re-inserts removed rows at their original positions (clamped to the list's current
// length), skipping rows whose key is already in the list again.
export function restoreAt<T>(
  list: T[],
  removed: Removed<T>,
  key: (item: T) => string,
): T[] {
  const present = new Set(list.map(key));
  const restored = [...list];
  for (const { index, item } of removed) {
    if (present.has(key(item))) continue;
    restored.splice(Math.min(index, restored.length), 0, item);
  }
  return restored;
}
