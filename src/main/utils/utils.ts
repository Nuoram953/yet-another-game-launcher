export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const normalizePath = (path: string) =>
  path.replace(/\\/g, "/").toLowerCase();

export async function getMinutesBetween(startTime: string | Date, endTime: string | Date): Promise<number> {
  // Convert strings to Date objects if necessary
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  
  // Calculate difference in milliseconds
  const diffMs = end.getTime() - start.getTime();
  
  // Convert to minutes and round to 2 decimal places
  return Number((diffMs / (1000 * 60)).toFixed(2));
}
