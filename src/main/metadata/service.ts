import fs from "fs";
import _ from "lodash";
import { MEDIA_TYPE } from "@common/constant";
import { getImageDirectoryPath } from "./paths";
import { app } from "electron";
import logger from "@main/logger";

export const getNumberOfFiles = (path: string): number => {
  if (!fs.existsSync(path)) {
    return 0;
  }
  const items = fs.readdirSync(path);
  if (_.isNil(items)) {
    return 0;
  }
  return items.length;
};

export const getCountAchievementPictures = async (gameId: string): Promise<number> => {
  const path = getImageDirectoryPath(MEDIA_TYPE.ACHIEVEMENT, gameId);
  return getNumberOfFiles(path);
};

export const deleteMedia = (gameId: string, mediaType: MEDIA_TYPE, mediaId: string): void => {
  const mediaPath = `${app.getPath("userData")}/${gameId}/${mediaType}/${mediaId}`;

  if (!fs.existsSync(mediaPath)) {
    logger.warn(`Media file not found: ${mediaPath}`);
    return;
  }

  fs.unlinkSync(mediaPath);
};
