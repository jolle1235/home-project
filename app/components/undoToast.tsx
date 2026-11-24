import { toast } from "react-toastify";

// A success toast with a "Fortryd" button, shown a little longer than other toasts so
// there is time to tap it. No close button: toastify's ✕ would cover "Fortryd"; the toast
// still closes on "Fortryd", after 5 s or by swipe.
export function showUndoToast(message: string, undo: () => void) {
  toast.success(
    ({ closeToast }) => (
      <div className="flex w-full items-center justify-between gap-3">
        <span>{message}</span>
        <button
          type="button"
          className="hit-area font-semibold text-primary-ink underline"
          onClick={() => {
            closeToast();
            undo();
          }}
        >
          Fortryd
        </button>
      </div>
    ),
    { autoClose: 5000, closeButton: false },
  );
}
