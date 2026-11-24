import { toast } from "react-toastify";

// A success toast with a "Fortryd" button, shown a little longer than other toasts so
// there is time to tap it.
export function showUndoToast(message: string, undo: () => void) {
  toast.success(
    ({ closeToast }) => (
      <div className="flex w-full items-center justify-between gap-3">
        <span>{message}</span>
        <button
          type="button"
          className="font-semibold text-primary underline"
          onClick={() => {
            closeToast();
            undo();
          }}
        >
          Fortryd
        </button>
      </div>
    ),
    { autoClose: 5000 },
  );
}
