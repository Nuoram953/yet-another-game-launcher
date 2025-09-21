import { getMedia } from "@render/api/electron";

export const getScreenshots = async (id: string) => {
  return await getMedia().getScreenshots(id);
};
