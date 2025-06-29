import { MEDIA_TYPE } from "@common/constant";
import { Game } from "@prisma/client";
import * as MetadataService from "@main/metadata/index";
import * as ConfigService from "@main/config/config.service";

const YouTube = require("youtube-sr").default;
import { Video } from "./types";
import logger from "@main/logger";

const { create: createYoutubeDl } = require("youtube-dl-exec");

export const search = async (game: Game, maxResults: number = 5) => {
  const searchResults: Video[] = await YouTube.search(`${game.name} game ${MEDIA_TYPE.TRAILER}`, {
    limit: maxResults,
  });

  const filteredResults = searchResults.filter((result: Video) => {
    return result.duration && result.duration <= 500000;
  });

  return filteredResults;
};

export const download = async (game: Game, id: string) => {
  const youtubedl = createYoutubeDl(await ConfigService.get("extension.youtube.ytDlpPath"));
  const trailerDir = MetadataService.getOrCreateImageDirectory(MEDIA_TYPE.TRAILER, game.id);
  const numberOfFiles = MetadataService.getNumberOfFiles(trailerDir);
  const output = `${trailerDir}/trailer_${numberOfFiles + 1}`;

  try {
    await youtubedl(`https://www.youtube.com/watch?v=${id}`, {
      output,
      verbose: true,
      format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      cookies: await ConfigService.get("extension.youtube.cookie"),
      addHeader: ["referer:youtube.com", "user-agent:firefox"],
    });
  } catch (e) {
    console.log(e);
    logger.warn(e);
  }
};
