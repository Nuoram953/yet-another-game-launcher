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

export const sanitizeGameName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9\s\(\)\[\]:.,!?'"<>\-]/g, "");
};
