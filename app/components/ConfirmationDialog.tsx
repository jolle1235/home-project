"use client";
import React from "react";

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

  return (
    open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-2 p-4">
          <div className="text-xl font-bold mb-4 text-darkText text-center">
            {title}
          </div>
          <div className="mb-6 text-center text-gray-700">
            {message}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="bg-cancel hover:bg-cancelHover text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              type="button"
            >
              Annuller
            </button>
            <button
              onClick={handleConfirm}
              className="bg-action hover:bg-actionHover text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              type="button"
            >
              Bekræft
            </button>
          </div>
        </div>
      </div>
    )
  );
}

