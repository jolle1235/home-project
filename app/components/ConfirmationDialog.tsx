"use client";
import React from "react";
import Button from "./smallComponent/Button";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-2 p-4">
        <div className="text-xl font-bold mb-4 text-muted-foreground text-center">
          {title}
        </div>
        <div className="mb-6 text-center text-gray-700">{message}</div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Annuller
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="button"
            onClick={handleConfirm}
          >
            Bekræft
          </Button>
        </div>
      </div>
    </div>
  );
}
