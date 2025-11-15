import { MEDIA_TYPE } from "@common/constant";
import { Game } from "@prisma/client";
import * as MetadataService from "@main/metadata/index";
import * as ConfigService from "@main/config/config.service";

const YouTube = require("youtube-sr").default;
import { Video } from "./types";
import logger from "@main/logger";
import { SEARCH_MUSIC, SEARCH_TRAILER } from "./config";

const { create: createYoutubeDl } = require("youtube-dl-exec");

export const search = async (game: Game, type: MEDIA_TYPE, maxResults: number = 5) => {
  let search = "";
  switch (type) {
    case MEDIA_TYPE.MUSIC: {
      search = `${game.name} ${SEARCH_MUSIC}`;
      break;
    }
    case MEDIA_TYPE.TRAILER: {
      search = `${game.name} ${SEARCH_TRAILER}`;
      break;
    }
  }
  const searchResults: Video[] = await YouTube.search(search);

  const filteredResults = searchResults
    .filter((result: Video) => {
      return result.duration && result.duration <= 500000;
    })
    .slice(0, maxResults);

  return filteredResults;
};

export const download = async (game: Game, type: MEDIA_TYPE, id: string) => {
  const youtubedl = createYoutubeDl(await ConfigService.get("extension.youtube.ytDlpPath"));
  const videoDir = MetadataService.getOrCreateImageDirectory(type, game.id);
  const numberOfFiles = MetadataService.getNumberOfFiles(videoDir);
  const output = `${videoDir}/${type}_${numberOfFiles + 1}`;

  const config: any = {
    output,
    verbose: true,
    format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
    cookies: await ConfigService.get("extension.youtube.cookie"),
    addHeader: ["referer:youtube.com", "user-agent:firefox"],
  };

  if (type === MEDIA_TYPE.MUSIC) {
    config.output = `${videoDir}/%(title)s.%(ext)s`;
    config.extractAudio = true;
    config.audioFormat = "mp3";
    config.audioQuality = 0;
  }

  try {
    await youtubedl(`https://www.youtube.com/watch?v=${id}`, config);
  } catch (e) {
    console.log(e);
    logger.warn(e);
  }
};
