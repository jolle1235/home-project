"use client";

import React from "react";

interface TimeRangeSelectorProps {
  timeRange: number[];
  setTimeRange: (range: number[]) => void;
}

export function TimeRangeSelectorComponent({
  timeRange,
  setTimeRange,
}: TimeRangeSelectorProps) {
  const timeOptions = [0, 10, 20, 30, 45, 60, 75, 90, 105, 120];

  return (
    <div className="flex flex-row items-center justify-around m-2">
      <label className="flex flex-col text-sm m-1">
        Min Time
        <select
          value={timeRange[0]}
          onChange={(e) => {
            const newMin = parseInt(e.target.value);
            setTimeRange([newMin, Math.max(newMin, timeRange[1])]);
          }}
          className="border border-gray-300 p-1 rounded-md w-24"
        >
          {timeOptions.map((val) => (
            <option key={val} value={val}>
              {val} min
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm m-1">
        Max Time
        <select
          value={timeRange[1]}
          onChange={(e) => {
            const newMax = parseInt(e.target.value);
            setTimeRange([Math.min(newMax, timeRange[0]), newMax]);
          }}
          className="border border-gray-300 p-1 rounded-md w-24"
        >
          {timeOptions.map((val) => (
            <option key={val} value={val}>
              {val === 120 ? "120+ min" : `${val} min`}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
