import { MEDIA_TYPE } from "../../../common/constant";
import { GameWithRelations } from "../../../common/types";
import * as MediaIntegration from "../../integrations/media/mediaIntegration.service";
import * as MediaValidation from "../utils/mediaValidation";
import logger, { LogTag } from "../../logger";

export class SearchMediaCommand {
  static async execute(gameId: string, mediaType: MEDIA_TYPE, search: string, page: number) {
    try {
      const game = await MediaValidation.validateGameExists(gameId);
      MediaValidation.validatePage(page);

      logger.info(
        `Searching for media for game`,
        {
          mediaType,
          gameId,
          page,
        },
        LogTag.MEDIA,
      );

      const results = await MediaIntegration.searchMedia(game as GameWithRelations, mediaType, search, page);

      logger.info(
        `Found results for search`,
        {
          count: results.length,
          mediaType,
        },
        LogTag.MEDIA,
      );

      return results;
    } catch (error) {
      logger.error(
        `Error searching media for game`,
        {
          error,
          mediaType,
          gameId,
        },
        LogTag.MEDIA,
      );
      throw error;
    }
  }
}
