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
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch">
      <label className="flex flex-col text-xs sm:text-sm text-secondary-hover gap-1 flex-1">
        Minimum
        <select
          value={timeRange[0]}
          onChange={(e) => {
            const newMin = parseInt(e.target.value, 10);
            setTimeRange([newMin, Math.max(newMin, timeRange[1])]);
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-hover"
        >
          {timeOptions.map((val) => (
            <option key={val} value={val}>
              {val} min
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-xs sm:text-sm text-secondary-hover gap-1 flex-1">
        Maksimum
        <select
          value={timeRange[1]}
          onChange={(e) => {
            const newMax = parseInt(e.target.value, 10);
            setTimeRange([Math.min(newMax, timeRange[0]), newMax]);
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-hover"
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
