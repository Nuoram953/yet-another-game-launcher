import { MEDIA_TYPE } from "../../../common/constant";
import * as MediaIntegration from "../../integrations/media/mediaIntegration.service";
import * as MediaValidation from "../utils/mediaValidation";
import * as PathUtils from "../utils/paths";
import * as FileUtils from "../utils/fileOperations";
import * as YoutubeApi from "../../externalApi/youtube/endpoints";
import logger, { LogTag } from "../../logger";

export class DownloadMediaCommand {
  static async execute(gameId: string, mediaType: MEDIA_TYPE, url: string): Promise<void> {
    try {
      const game = await MediaValidation.validateGameExists(gameId);
      MediaValidation.validateUrl(url);

      logger.info(
        `Downloading media for game`,
        {
          mediaType,
          gameId,
          url,
        },
        LogTag.MEDIA,
      );

      if (mediaType === MEDIA_TYPE.TRAILER || mediaType === MEDIA_TYPE.MUSIC) {
        await YoutubeApi.download(game, mediaType, url, true);
      } else {
        const folderPath = PathUtils.getOrCreateMediaDirectory(gameId, mediaType);
        const fileCount = FileUtils.getNumberOfFiles(folderPath);

        await MediaIntegration.downloadMedia(mediaType, game, url, folderPath, fileCount, undefined, undefined, false);
      }

      logger.info(
        `Successfully downloaded media for game`,
        {
          mediaType,
          gameId,
        },
        LogTag.MEDIA,
      );
    } catch (error) {
      logger.error(
        `Error downloading media for game ${gameId}, type ${mediaType}:`,
        {
          error,
          gameId,
          mediaType,
        },
        LogTag.MEDIA,
      );
      throw error;
    }
  }
}
