export function normalizeTime(value: string): string {
  const parts = value.trim().split(":");
  const hours = parts[0]?.padStart(2, "0") ?? "00";
  const minutes = parts[1]?.padStart(2, "0") ?? "00";
  return `${hours}:${minutes}`;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function weekdayFromDateString(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return DAY_NAMES[date.getDay()];
}
