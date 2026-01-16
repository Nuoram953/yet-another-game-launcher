import { GameWithRelations } from "src/common/types";
import { MEDIA_TYPE } from "../../common/constant";
import * as SteamGridDbApi from "../externalApi/steamGridDb";
import * as YoutubeApi from "@main/externalApi/youtube/endpoints";
import { MediaResponse } from "@main/externalApi/steamGridDb/types";
import { Video } from "@main/externalApi/youtube/types";

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
