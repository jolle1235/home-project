"use client";
import { useCallback, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  // The dialog stays open, its buttons disabled, until this has finished.
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
}

export default function ConfirmationDialog({
  open,
  ...props
}: ConfirmationDialogProps) {
  // Mounted only while open, so every opening starts without a busy state.
  if (!open) return null;
  return <OpenDialog {...props} />;
}

// A native modal <dialog>: focus moves into it, Tab stays inside, Escape cancels.
function OpenDialog({
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Bekræft",
  cancelLabel = "Annuller",
  tone = "primary",
}: Omit<ConfirmationDialogProps, "open">) {
  const [isBusy, setIsBusy] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const messageId = useId();

  // Opens the dialog once it is in the DOM. A stable callback, so React attaches it once and
  // a re-render while the dialog is closing can't open it again.
  const openModal = useCallback((dialog: HTMLDialogElement | null) => {
    dialogRef.current = dialog;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  // Closing through the element lets the browser put focus back on the button that opened
  // the dialog; its close event then tells the parent.
  const close = () => dialogRef.current?.close();

  const handleConfirm = async () => {
    setIsBusy(true);
    try {
      await onConfirm();
    } finally {
      // Stays busy until the close event unmounts it: the dialog always closes after confirm.
      close();
    }
  };

  // Rendered into <body>: a parent's layout (e.g. space-y-* margins) must not move it.
  return createPortal(
    <dialog
      ref={openModal}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(e) => {
        e.preventDefault();
        if (!isBusy) close();
      }}
      // Chromium may close a modal on a repeated Escape without a cancel event.
      onClose={onClose}
      className="bg-white rounded-lg shadow-lg w-[calc(100%-1rem)] max-w-md p-4 backdrop:bg-black/40"
    >
      <h2
        id={titleId}
        className="text-xl font-bold mb-4 text-muted-foreground text-center"
      >
        {title}
      </h2>
      <p id={messageId} className="mb-6 text-center text-gray-700">
        {message}
      </p>
      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={close}
          disabled={isBusy}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={tone}
          size="sm"
          type="button"
          onClick={handleConfirm}
          isLoading={isBusy}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>,
    document.body,
  );
}
