import {
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { showUndoToast } from "../components/undoToast";
import { removeWhere, restoreAt, type Removed } from "../utils/listUndo";

// A list the server stores as one document and replaces on every save (the shopping list,
// the week plan). Every change builds on the stored list, never on an empty placeholder;
// the screen updates at once; saves run one at a time in tap order, each carrying every
// earlier tap. When the last queued save fails the list is fetched again, which undoes it;
// when it succeeds and the server answers with the saved list (the shopping list, with
// categories filled in), that list is shown. A failed save followed by a queued one needs
// nothing: the queued save carries both.
type Options<T> = {
  queryKey: QueryKey;
  queryFn: () => Promise<T[]>;
  // Resolves to the saved list when the server returns it, otherwise to nothing.
  save: (list: T[]) => Promise<T[] | void>;
  errorMessage: string;
  initialData?: T[];
};

// What to show once a change is saved: a text, or a text with a "Fortryd" action.
type Notice = string | { message: string; undo: () => void };

// The toast texts travel with the mutation, not with the calling component, so they still
// show when that component has unmounted (e.g. the user left the page during a slow load).
type Change<T> = { list: T[]; success?: Notice };

const showNotice = (notice: Notice) =>
  typeof notice === "string"
    ? toast.success(notice)
    : showUndoToast(notice.message, notice.undo);

export function useServerList<T>({
  queryKey,
  queryFn,
  save,
  errorMessage,
  initialData,
}: Options<T>) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey, queryFn, initialData });

  // Inside a mutation's own callbacks it still counts as pending.
  const isLastSave = () =>
    queryClient.isMutating({ mutationKey: queryKey }) === 1;
  const showError = () => toast.error(errorMessage, { toastId: errorMessage });

  const mutation = useMutation({
    mutationKey: queryKey,
    scope: { id: JSON.stringify(queryKey) },
    mutationFn: (change: Change<T>) => save(change.list),
    onSuccess: (saved, change) => {
      if (change.success) showNotice(change.success);
      if (saved && isLastSave()) queryClient.setQueryData(queryKey, saved);
    },
    onError: () => {
      showError();
      if (isLastSave()) return queryClient.invalidateQueries({ queryKey });
    },
  });

  // The stored list: the cache when it is fresh, otherwise fetched (or the fetch already in
  // flight). After a failed save the cache is invalidated, so the next change waits for the
  // server's list instead of building on the rejected one. `notice` is called right after the
  // updater has run, so its text and undo can use what the updater found.
  const apply = async (updater: (list: T[]) => T[], notice?: () => Notice) => {
    let stored: T[];
    try {
      stored = await queryClient.query({ queryKey, queryFn, retry: false });
    } catch {
      showError();
      return;
    }
    await queryClient.cancelQueries({ queryKey });
    // No await from here on: taps that waited on the same load apply in call order, and each
    // reads the list the previous tap wrote.
    const list = updater(queryClient.getQueryData<T[]>(queryKey) ?? stored);
    queryClient.setQueryData(queryKey, list);
    mutation.mutate({ list, success: notice?.() });
  };

  // `success` is the toast shown once the change is saved.
  const update = (updater: (list: T[]) => T[], success?: string) =>
    apply(updater, success === undefined ? undefined : () => success);

  // Removes the rows that match and toasts `message(removed rows)` with "Fortryd", which
  // puts them back at their positions (`key` tells rows apart, so nothing is added twice).
  const removeWithUndo = (
    isRemoved: (item: T) => boolean,
    key: (item: T) => string,
    message: (removed: T[]) => string,
  ) => {
    let removed: Removed<T> = [];
    return apply(
      (list) => {
        const result = removeWhere(list, isRemoved);
        removed = result.removed;
        return result.kept;
      },
      () => ({
        message: message(removed.map(({ item }) => item)),
        undo: () => update((list) => restoreAt(list, removed, key)),
      }),
    );
  };

  // Pull-to-refresh waits while saves are queued: a refetch would hide their changes on screen.
  const refresh = async () => {
    if (!queryClient.isMutating({ mutationKey: queryKey }))
      await query.refetch();
  };

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    update,
    removeWithUndo,
    refresh,
  };
}
