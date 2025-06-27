"use client";
import React, { useState } from "react";

interface CalendarDialogProps {
  open: boolean;
  onClose: () => void;
  onDone: (selectedDates: string[]) => void;
  availableDates: Date[];
}

export default function CalendarDialog({
  open,
  onClose,
  onDone,
  availableDates,
}: CalendarDialogProps) {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  const toggleDate = (date: Date) => {
    const dateKey = date.toISOString().split("T")[0];
    const newSet = new Set(selectedDates);
    if (newSet.has(dateKey)) {
      newSet.delete(dateKey);
    } else {
      newSet.add(dateKey);
    }
    setSelectedDates(newSet);
  };

  const handleDone = () => {
    onDone(Array.from(selectedDates));
    setSelectedDates(new Set());
    onClose();
  };

  // Build a 3-week (21 days) list, starting from today (no empty/null days)
  function buildDateList(): Date[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days: Date[] = [];
    for (let i = 0; i < 21; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  }

  const dateList = buildDateList();

  return (
    open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-2 p-4">
          <div className="text-xl font-bold mb-4 text-darkText text-center">
            Vælg datoer
          </div>
          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
            {dateList.map((date) => {
              const dateKey = date.toISOString().split("T")[0];
              const isSelected = selectedDates.has(dateKey);
              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => toggleDate(date)}
                  className={`w-full rounded-lg px-4 py-3 text-base text-darkText text-center border transition-colors duration-150
                    ${isSelected ? "bg-action text-white" : "bg-white hover:bg-actionHover"}
                  `}
                  style={{ minHeight: 48 }}
                >
                  {date.toLocaleDateString("da-DK", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="bg-cancel hover:bg-cancelHover text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              type="button"
            >
              Annuller
            </button>
            <button
              onClick={handleDone}
              className="bg-action hover:bg-actionHover text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              type="button"
            >
              Færdig
            </button>
          </div>
        </div>
      </div>
    )
  );
}
