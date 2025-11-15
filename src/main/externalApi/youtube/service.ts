import { Game } from "@prisma/client";
import * as YoutubeEndpoints from "./endpoints";
import logger from "@main/logger";
import { MEDIA_TYPE } from "@common/constant";
import * as MetadataService from "@main/metadata/index";

export const downloadVideoForGame = async (game: Game) => {
  const outputDir = MetadataService.getOrCreateImageDirectory(MEDIA_TYPE.TRAILER, game.id);

  if (MetadataService.getNumberOfFiles(outputDir) >= 1) {
    logger.info(`${game.id} has 1 trailer. Skipping`);
    return;
  }

  const searchResults = await YoutubeEndpoints.search(game, MEDIA_TYPE.TRAILER, "", 1);
  for (const result of searchResults) {
    await YoutubeEndpoints.download(game, MEDIA_TYPE.TRAILER, result.id);
  }
};

export const downloadMusicForGame = async (game: Game) => {
  const outputDir = MetadataService.getOrCreateImageDirectory(MEDIA_TYPE.MUSIC, game.id);

  if (MetadataService.getNumberOfFiles(outputDir) >= 1) {
    logger.info(`${game.id} has 1 ost. Skipping`);
    return;
  }

  const searchResults = await YoutubeEndpoints.search(game, MEDIA_TYPE.MUSIC, "", 1);
  for (const result of searchResults) {
    await YoutubeEndpoints.download(game, MEDIA_TYPE.MUSIC, result.id, true);
  }
};
