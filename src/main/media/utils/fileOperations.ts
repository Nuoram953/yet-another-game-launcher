import fs from "fs";
import _ from "lodash";
import path from "path";
import { app } from "electron";
import { MEDIA_TYPE } from "../../../common/constant";
import logger, { LogTag } from "../../logger";
import { getMediaDirectory } from "./paths";

export const getGameFolder = (gameId: string): string => {
  return path.join(app.getPath("userData"), gameId);
};

export const getGameMediaFiles = (gameId: string, type: MEDIA_TYPE): string[] => {
  const mediaDir = getMediaDirectory(gameId, type);
  try {
    return fs.readdirSync(mediaDir);
  } catch (error) {
    logger.warn(
      `Cannot read media directory`,
      {
        error,
        mediaDir,
      },
      LogTag.MEDIA,
    );
    return [];
  }
};

export const getNumberOfFiles = (dirPath: string): number => {
  if (!fs.existsSync(dirPath)) {
    return 0;
  }
  try {
    const items = fs.readdirSync(dirPath);
    return items?.length || 0;
  } catch (error) {
    logger.warn(
      `Cannot count files in directory`,
      {
        error,
        dirPath,
      },
      LogTag.MEDIA,
    );
    return 0;
  }
};

export const getCountAchievementPictures = async (gameId: string): Promise<number> => {
  const dirPath = getMediaDirectory(gameId, MEDIA_TYPE.ACHIEVEMENT);
  return getNumberOfFiles(dirPath);
};

export const deleteMediaFile = (gameId: string, mediaType: MEDIA_TYPE, mediaId: string): void => {
  const mediaPath = path.join(app.getPath("userData"), gameId, mediaType, mediaId);

  if (!fs.existsSync(mediaPath)) {
    logger.warn(`Media file not found`, { mediaPath }, LogTag.MEDIA);
    return;
  }

  try {
    fs.unlinkSync(mediaPath);
    logger.info(`Deleted media file`, { mediaPath }, LogTag.MEDIA);
  } catch (error) {
    logger.error(`Failed to delete media file`, { error, mediaPath }, LogTag.MEDIA);
    throw error;
  }
};

export const isDirectoryAccessible = (dirPath: string): boolean => {
  try {
    fs.accessSync(dirPath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
};

export const fileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};
