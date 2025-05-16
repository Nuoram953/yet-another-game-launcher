import { GameWithRelations } from "../../../common/types";
import { MEDIA_TYPE } from "../../../common/constant";
import { searchGrid, searchHero, searchIcon, searchLogo } from "./endpoint";
import logger from "@main/logger";
import * as MetadataService from "@main/metadata/index";

export const downloadMedia = async (game: GameWithRelations, mediaType: MEDIA_TYPE, count: number, max: number) => {
  let res = null;
  switch (mediaType) {
    case MEDIA_TYPE.COVER:
      res = await searchGrid(game);
      break;
    case MEDIA_TYPE.BACKGROUND:
      res = await searchHero(game);
      break;
    case MEDIA_TYPE.LOGO:
      res = await searchLogo(game);
      break;
    case MEDIA_TYPE.ICON:
      res = await searchIcon(game);
      break;
    default:
      throw new Error("Invalid media type");
  }

  let path = MetadataService.getImageDirectoryPath(mediaType, game.id);
  let files = MetadataService.getNumberOfFiles(path);
  if (files >= max) {
    logger.debug(`${game.name} (${game.id}) has ${files} ${mediaType} and the max was ${max}. Skipping`);
    return;
  }

  const data = res.data.sort((a, b) => b.score - a.score).splice(0, count);

  for (const image of data) {
    await MetadataService.downloadImage(mediaType, game, image.url, image.mime.split("image/")[1]);
  }
};
