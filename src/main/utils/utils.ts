export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const normalizePath = (path: string) => path.replace(/\\/g, "/").toLowerCase();

export async function getMinutesBetween(startTime: string | Date, endTime: string | Date): Promise<number> {
  const start = typeof startTime === "string" ? new Date(startTime) : startTime;
  const end = typeof endTime === "string" ? new Date(endTime) : endTime;

  const diffMs = end.getTime() - start.getTime();

  return Number((diffMs / (1000 * 60)).toFixed(2));
}

export const sanitizeGameName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9\s\(\)\[\]:.,!?'"<>\-&]/g, "");
};

export const getKeyPercentage = (item: object, targetKey: string): number => {
  const keys = Object.keys(item);
  const totalKeys = keys.length;
  const keyIndex = keys.indexOf(targetKey);

  if (keyIndex === -1) return 0;

  const value = Math.round(((keyIndex + 1) / totalKeys) * 100);

  return value === 100 ? 99 : value; //the 100% is handle by the notification manager
};
