"use client";
import React, { useState } from "react";
import Button from "./smallComponent/Button";

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="mb-5 text-center">
          <h2 className="text-xl font-semibold text-foreground">Vælg datoer</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Vælg en eller flere dage
          </p>
        </div>

        {/* Date List */}
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
          {dateList.map((date) => {
            const dateKey = date.toISOString().split("T")[0];
            const isSelected = selectedDates.has(dateKey);

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => toggleDate(date)}
                className={`
                  w-full
                  min-h-[48px]
                  rounded-xl
                  border
                  text-center
                  transition-all duration-200
                  font-medium
                  ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-background text-foreground border-secondary hover:bg-soft"
                  }
                `}
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

        {/* Footer Actions */}
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Annuller
          </Button>

          <Button
            variant="primary"
            fullWidth
            onClick={handleDone}
            disabled={selectedDates.size === 0}
          >
            Færdig
          </Button>
        </div>
      </div>
    </div>
  );
}
