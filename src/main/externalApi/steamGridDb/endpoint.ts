import { GameWithRelations } from "src/common/types";
import { HEROES_URL, ICONS_URL, LOGOS_URL, axiosInstance } from "./config";
import { SEARCH_URL, GRIDS_URL, GET_GAME_BY_EXTERNAL_ID } from "./config";
import { GetExternalGameIdResponse, MediaResponse, SearchResponse } from "./types";
import _ from "lodash";
import { getPlatform } from "./util";

const getGameId = async (game: GameWithRelations) => {
  let gameId = null;
  if (game.externalId) {
    const response = await axiosInstance.get<GetExternalGameIdResponse>(
      GET_GAME_BY_EXTERNAL_ID + `${await getPlatform(game.storefrontId!)}/${game.externalId}`,
    );
    gameId = response.data.data.id;
  }

  if (_.isNil(gameId)) {
    const response = await axiosInstance.get<SearchResponse>(SEARCH_URL + game.name);
    gameId = response.data.data[0].id;
  }

  return gameId;
};

export const searchGrid = async (game: GameWithRelations, page?: number, limit?: number) => {
  let gameId = await getGameId(game);
  if (!gameId) {
    throw new Error("Game ID not found");
  }

  const res = await axiosInstance.get<MediaResponse>(GRIDS_URL + gameId, {
    params: {
      gameId: gameId,
      styles: "alternate,material",
      dimensions: "600x900",
      mimes: "image/jpeg,image/png",
      type: "static",
      limit: limit,
      page: page,
    },
  });

  return res.data;
};

export const searchHero = async (game: GameWithRelations, page?: number, limit?: number) => {
  let gameId = await getGameId(game);
  if (!gameId) {
    throw new Error("Game ID not found");
  }

  const res = await axiosInstance.get<MediaResponse>(HEROES_URL + gameId, {
    params: {
      gameId: gameId,
      styles: "alternate,material",
      dimensions: "3840x1240,1920x620",
      mimes: "image/jpeg,image/png,image/webp",
      type: "static",
      limit: limit,
      page: page,
    },
  });

  return res.data;
};

export const searchIcon = async (game: GameWithRelations, page?: number, limit?: number) => {
  let gameId = await getGameId(game);
  if (!gameId) {
    throw new Error("Game ID not found");
  }

  const res = await axiosInstance.get<MediaResponse>(ICONS_URL + gameId, {
    params: {
      gameId: gameId,
      styles: "official,custom",
      mimes: "image/png",
      type: "static",
      limit: limit,
      page: page,
    },
  });

  return res.data;
};

export const searchLogo = async (game: GameWithRelations, page?: number, limit?: number) => {
  let gameId = await getGameId(game);
  if (!gameId) {
    throw new Error("Game ID not found");
  }

  const res = await axiosInstance.get<MediaResponse>(LOGOS_URL + gameId, {
    params: {
      gameId: gameId,
      styles: "official,white,black",
      mimes: "image/png,image/webp",
      type: "static",
      limit: limit,
      page: page,
    },
  });

  return res.data;
};
