export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const normalizePath = (path: string) =>
  path.replace(/\\/g, "/").toLowerCase();
