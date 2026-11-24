import {
  type QueryKey,
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

// A list the server stores as one document and replaces on every save (the shopping list,
// the week plan). Every change builds on the stored list, never on an empty placeholder;
// the screen updates at once; saves run one at a time in tap order, each carrying every
// earlier tap; when the last save fails the list is fetched again, which undoes it (a
// failed save followed by a queued one needs nothing: the queued save carries both).
type Options<T> = {
  queryKey: QueryKey;
  queryFn: () => Promise<T[]>;
  save: (list: T[]) => Promise<void>;
  errorMessage: string;
  initialData?: T[];
};

// The toast texts travel with the mutation, not with the calling component, so they still
// show when that component has unmounted (e.g. the user left the page during a slow load).
type Change<T> = { list: T[]; success?: string };

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
    onSuccess: (_result, change) => {
      if (change.success) toast.success(change.success);
    },
    onError: () => {
      showError();
      if (isLastSave()) return queryClient.invalidateQueries({ queryKey });
    },
  });

  // The stored list: the cache when it is fresh, otherwise fetched (or the fetch already in
  // flight). After a failed save the cache is invalidated, so the next change waits for the
  // server's list instead of building on the rejected one.
  const update = async (updater: (list: T[]) => T[], success?: string) => {
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
    mutation.mutate({ list, success });
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
    refresh,
  };
}

// True while a save for the list is pending; only for components that show it (rows don't,
// so they don't re-render on every save).
export function useServerListSaving(queryKey: QueryKey) {
  return useIsMutating({ mutationKey: queryKey }) > 0;
}
