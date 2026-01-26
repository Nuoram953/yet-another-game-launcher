import { app } from "electron";
import fs from "fs";
import path from "path";
import { MEDIA_TYPE } from "../../../common/constant";
import logger from "../../logger";

export const getMediaDirectory = (gameId: string, mediaType: MEDIA_TYPE): string => {
  return path.join(app.getPath("userData"), gameId, mediaType);
};

export const getImageDirectoryPath = (type: MEDIA_TYPE, gameId: string): string => {
  return getMediaDirectory(gameId, type);
};

export const getOrCreateMediaDirectory = (gameId: string, mediaType: MEDIA_TYPE): string => {
  const folderPath = getMediaDirectory(gameId, mediaType);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    logger.info(`Created directory ${folderPath}`);
  }
  return folderPath;
};

export const getOrCreateImageDirectory = (type: MEDIA_TYPE, gameId: string): string => {
  return getOrCreateMediaDirectory(gameId, type);
};

export const createFileUri = (dirPath: string, fileName: string): string => {
  const fullPath = path.join(dirPath, fileName);
  return `file://${fullPath}`;
};
