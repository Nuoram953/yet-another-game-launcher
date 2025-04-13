export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const normalizePath = (path: string) =>
  path.replace(/\\/g, "/").toLowerCase();

export async function getMinutesBetween(
  startTime: string | Date,
  endTime: string | Date,
): Promise<number> {
  const start = typeof startTime === "string" ? new Date(startTime) : startTime;
  const end = typeof endTime === "string" ? new Date(endTime) : endTime;

  const diffMs = end.getTime() - start.getTime();

  return Number((diffMs / (1000 * 60)).toFixed(2));
}

export function unixToDate(unixTime:number) {
    const date = new Date(unixTime * 1000); // Convert to milliseconds
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
