import fs from "fs";
import _ from "lodash";
import { Game } from "@prisma/client";
import { GameWithRelations } from "@common/types";
import { MEDIA_TYPE } from "../../../common/constant";
import * as SteamGridDbApi from "../../externalApi/steamGridDb";
import * as YoutubeApi from "../../externalApi/youtube/endpoints";
import { MediaResponse } from "../../externalApi/steamGridDb/types";
import { Video } from "../../externalApi/youtube/types";
import logger from "../../logger";
import axios from "../../../common/axiosConfig";

/**
 * Search for media content from external APIs
 */
export const searchMedia = async (
  game: GameWithRelations,
  mediaType: MEDIA_TYPE,
  search: string,
  page: number,
): Promise<string[] | Video[]> => {
  let res: MediaResponse | null = null;

  switch (mediaType) {
    case MEDIA_TYPE.COVER:
      res = await SteamGridDbApi.searchGrid(game, page);
      break;
    case MEDIA_TYPE.BACKGROUND:
      res = await SteamGridDbApi.searchHero(game, page);
      break;
    case MEDIA_TYPE.LOGO:
      res = await SteamGridDbApi.searchLogo(game, page);
      break;
    case MEDIA_TYPE.ICON:
      res = await SteamGridDbApi.searchIcon(game, page);
      break;
    case MEDIA_TYPE.TRAILER:
    case MEDIA_TYPE.MUSIC:
      return await YoutubeApi.search(game, mediaType, search);
    default:
      throw new Error("Invalid media type");
  }

  return res.data.map((item) => item.url);
};

/**
 * Download media content from external URLs
 */
export const downloadMedia = async (
  type: MEDIA_TYPE,
  game: Game,
  url: string,
  folderPath: string,
  fileCount: number,
  extension?: string,
  customName?: string,
  skipLimit: boolean = false,
): Promise<void> => {
  const extensionFromFile = url.match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/)?.[1];
  const fileName = !_.isNil(customName)
    ? `/${customName.replace(/\.[^/.]+$/, "")}.${extension}`
    : `/${type}_${fileCount + 1}.${extension ? extension : extensionFromFile}`;
  const destination = folderPath + fileName;

  if (fs.existsSync(destination)) {
    return;
  }

  if (!skipLimit && fileCount >= 15) {
    logger.debug(`${game.name} (${game.id}) has ${fileCount} ${type} and the max was ${15}. Skipping`);
    return;
  }

  const response = await axios.get<Buffer>(url, {
    responseType: "arraybuffer",
  });

  fs.writeFileSync(destination, response.data);
  logger.info(`Media saved to ${destination}`);
};
