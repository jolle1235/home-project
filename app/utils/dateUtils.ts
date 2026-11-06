/**
 * Calendar-day key ("YYYY-MM-DD") for a date in the user's local time zone.
 * Don't use `toISOString()` for this: it converts to UTC first, so in Denmark
 * any local time before 01:00/02:00 lands on the previous day.
 */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
