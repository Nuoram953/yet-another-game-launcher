import _ from "lodash";
import { MEDIA_TYPE } from "../../../common/constant";
import queries from "../../dal/dal";
import { ErrorMessage } from "../../../common/error";

export const validateGameExists = async (gameId: string) => {
  const game = await queries.Game.getGameById(gameId);
  if (_.isNil(game)) {
    throw new Error(ErrorMessage.INVALID_GAME);
  }
  return game;
};

export const validateMediaType = (mediaType: string): MEDIA_TYPE => {
  const validTypes = Object.values(MEDIA_TYPE);
  if (!validTypes.includes(mediaType as MEDIA_TYPE)) {
    throw new Error(`Invalid media type: ${mediaType}`);
  }
  return mediaType as MEDIA_TYPE;
};

export const validateCount = (count?: number): number | undefined => {
  if (count !== undefined && (count <= 0 || !Number.isInteger(count))) {
    throw new Error("Count must be a positive integer");
  }
  return count;
};

export const validatePage = (page: number): number => {
  if (page < 1 || !Number.isInteger(page)) {
    throw new Error("Page must be a positive integer starting from 1");
  }
  return page;
};

export const validateUrl = (url: string): string => {
  try {
    new URL(url);
    return url;
  } catch {
    throw new Error(`Invalid URL format: ${url}`);
  }
};
