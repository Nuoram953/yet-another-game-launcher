import { MEDIA_TYPE } from "../../../common/constant";
import * as MediaValidation from "../utils/mediaValidation";
import * as FileUtils from "../utils/fileOperations";
import queries from "../../dal/dal";
import logger, { LogTag } from "../../logger";

export class CleanupMediaCommand {
  static async execute(gameId: string, mediaType: MEDIA_TYPE, mediaId: string): Promise<void> {
    try {
      await MediaValidation.validateGameExists(gameId);

      logger.info(
        `Deleting media file for game`,
        {
          mediaType,
          mediaId,
          gameId,
        },
        LogTag.MEDIA,
      );

      FileUtils.deleteMediaFile(gameId, mediaType, mediaId);

      try {
        const defaultMedia = await queries.MediaDefault.findByGameIdAndMediaType(gameId, mediaType);
        if (defaultMedia && defaultMedia.mediaName === mediaId) {
          await queries.MediaDefault.deleteByGameIdAndMediaType(gameId, mediaType);
          logger.info(
            `Removed default media reference`,
            {
              mediaType,
              gameId,
            },
            LogTag.MEDIA,
          );
        }
      } catch (defaultError) {
        logger.warn(`Could not check/remove default media reference`, defaultError, LogTag.MEDIA);
      }

      logger.info(
        `Successfully deleted media file`,
        {
          mediaType,
          mediaId,
          gameId,
        },
        LogTag.MEDIA,
      );
    } catch (error) {
      logger.error(
        `Error deleting media file`,
        {
          error,
          mediaId,
          mediaType,
          gameId,
        },
        LogTag.MEDIA,
      );
      throw error;
    }
  }

  static async cleanupAllMedia(gameId: string, mediaType?: MEDIA_TYPE): Promise<void> {
    try {
      await MediaValidation.validateGameExists(gameId);

      logger.info(
        `Cleaning up media`,
        {
          mediaType,
          gameId,
        },
        LogTag.MEDIA,
      );

      if (mediaType) {
        const mediaFiles = FileUtils.getGameMediaFiles(gameId, mediaType);
        for (const file of mediaFiles) {
          await this.execute(gameId, mediaType, file);
        }
      } else {
        const mediaTypes = Object.values(MEDIA_TYPE);
        for (const type of mediaTypes) {
          const mediaFiles = FileUtils.getGameMediaFiles(gameId, type);
          for (const file of mediaFiles) {
            await this.execute(gameId, type, file);
          }
        }
      }

      logger.info(`Successfully cleaned up media`, { gameId }, LogTag.MEDIA);
    } catch (error) {
      logger.error(
        `Error cleaning up media for game ${gameId}:`,
        {
          error,
          gameId,
        },
        LogTag.MEDIA,
      );
      throw error;
    }
  }
}
