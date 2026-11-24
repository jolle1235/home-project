"use client";
import { useId, useState } from "react";
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
  const titleId = useId();
  const messageId = useId();

  const handleConfirm = async () => {
    setIsBusy(true);
    try {
      await onConfirm();
    } finally {
      setIsBusy(false);
      onClose();
    }
  };

  return (
    <dialog
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(e) => {
        e.preventDefault();
        if (!isBusy) onClose();
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
          onClick={onClose}
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
    </dialog>
  );
}
