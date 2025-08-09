import { getMedia } from "@render/api/electron";

export const getGameAchievements = async (id: string) => {
  return await getMedia().getAchievements(id);
};
