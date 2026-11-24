import { WeekPlan } from "../types/weekPlan";
import { WEEK_PLAN_API } from "../constants";

export async function fetchWeekPlan(): Promise<WeekPlan[]> {
  const response = await fetch(WEEK_PLAN_API);
  if (!response.ok) throw new Error("Failed to fetch week plan");
  return response.json();
}

export async function saveWeekPlan(weekPlan: WeekPlan[]): Promise<void> {
  const response = await fetch(WEEK_PLAN_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weekPlan }),
  });
  if (!response.ok) throw new Error("Failed to save week plan");
}
