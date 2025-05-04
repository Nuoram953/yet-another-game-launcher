import { GameWithRelations } from "src/common/types";
import { MEDIA_TYPE } from "../../common/constant";
import * as SteamGridDbApi from "../externalApi/steamGridDb";
import { MediaResponse } from "@main/externalApi/steamGridDb/types";

export const searchMedia = async (game: GameWithRelations, mediaType: MEDIA_TYPE, page: number): Promise<string[]> => {
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
    default:
      throw new Error("Invalid media type");
  }

  return res.data.map((item) => item.url);
};
