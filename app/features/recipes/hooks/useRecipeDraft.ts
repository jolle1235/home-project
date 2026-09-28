import { useCallback, useEffect, useRef, useState } from "react";
import { RecipeDraft, draftHasContent } from "../utils/recipeDraft";

// Autosaves the add/edit form to localStorage, offers a saved draft back
// on the next visit, and warns before leaving the page with unsaved changes.

const SAVE_DELAY_MS = 500;

function readDraft(storageKey: string): RecipeDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const draft = JSON.parse(raw) as RecipeDraft;
    return Array.isArray(draft.rows) && draftHasContent(draft) ? draft : null;
  } catch {
    return null;
  }
}

function removeDraft(storageKey: string) {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // storage unavailable (private mode); nothing to clean up
  }
}

export function useRecipeDraft(recipeId: string | null) {
  const storageKey = `recipeDraft:${recipeId ?? "new"}`;
  const [savedDraft, setSavedDraft] = useState(() => readDraft(storageKey));
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dirty = useRef(false);

  const scheduleSave = useCallback(
    (getDraft: () => RecipeDraft) => {
      dirty.current = true;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const draft = getDraft();
        try {
          if (draftHasContent(draft)) {
            window.localStorage.setItem(storageKey, JSON.stringify(draft));
          } else {
            window.localStorage.removeItem(storageKey);
          }
        } catch {
          // storage full or unavailable; the beforeunload warning still applies
        }
      }, SAVE_DELAY_MS);
    },
    [storageKey],
  );

  // Call after a successful save or an explicit cancel.
  const clearDraft = useCallback(() => {
    clearTimeout(timer.current);
    dirty.current = false;
    removeDraft(storageKey);
    setSavedDraft(null);
  }, [storageKey]);

  const dismissSavedDraft = useCallback(() => setSavedDraft(null), []);

  const isDirty = useCallback(() => dirty.current, []);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty.current) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      clearTimeout(timer.current);
    };
  }, []);

  return { savedDraft, dismissSavedDraft, scheduleSave, clearDraft, isDirty };
}
