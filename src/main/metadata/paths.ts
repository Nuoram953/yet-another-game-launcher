import { app } from "electron";
import fs from "fs";
import { MEDIA_TYPE } from "@common/constant";
import logger from "@main/logger";

const userPath = app.getPath("userData");

export const getImageDirectoryPath = (type: MEDIA_TYPE, gameId: string): string => {
  return `${userPath}/${gameId}/${type}`;
};

export const getOrCreateImageDirectory = (type: MEDIA_TYPE, gameId: string): string => {
  const folderPath = getImageDirectoryPath(type, gameId);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    logger.info(`Created directory ${folderPath}`);
  }
  return folderPath;
};
