import _ from "lodash";
import { Storefront } from "../../../common/constant";
import { EXTERNAL_GAME_URL, GAME_URL, INVOLED_COMPANY_URL, axiosInstance } from "./config";
import { IExternalGame, IGame, IInvolvedCompany } from "./types";
import { getCategory } from "./util";
import { GameWithRelations } from "../../../common/types";
import { Game } from "@prisma/client";

export const getExternalGameId = async (externalId: string, store: Storefront) => {
  const res = await axiosInstance.post<IExternalGame[]>(
    EXTERNAL_GAME_URL,
    `fields *; where uid="${externalId}" & external_game_source=${getCategory(store)};`,
  );

  if (_.isEmpty(res.data)) {
    return null;
  }

  return res.data[0].game;
};

export const getInvolvedCompany = async (id: number) => {
  const res = await axiosInstance.post<IInvolvedCompany[]>(
    INVOLED_COMPANY_URL,
    `fields *, company.*;  where game=${id};`,
  );

  return res.data;
};

export const search = async (name: string) => {
  const res = await axiosInstance.post<IGame[]>(GAME_URL, `fields *; search "${name}"; where version_parent = null;`);

  if (_.isEmpty(res.data)) {
    return null;
  }

  return res.data[0].id;
};

export const getGame = async (game: GameWithRelations | Game) => {
  let id = await getExternalGameId(game.externalId!, game.storefrontId!);

  if (_.isNil(id)) {
    id = await search(game.name);
  }

  if (_.isNil(id)) {
    return null;
  }

  const res = await axiosInstance.post<IGame[]>(
    GAME_URL,
    `fields *, platforms.*, genres.*, themes.*, game_engines.*, game_modes.*, player_perspectives.*, screenshots.*;  where id=${id};`,
  );

  const companies = await getInvolvedCompany(id);
  const publishers = companies
    .filter((company) => company.publisher)
    .map((item) => ({
      name: item.company.name,
      description: item.company.description,
      country: item.company.country,
      startedAt: BigInt(item.company.start_date ?? 0),
      url: item.company.url,
    }));

  const developers = companies
    .filter((company) => company.developer)
    .map((item) => ({
      name: item.company.name,
      description: item.company.description,
      country: item.company.country,
      startedAt: BigInt(item.company.start_date ?? 0),
      url: item.company.url,
    }));

  const data = res.data[0];
  const themes = data.themes?.map((item: any) => item.name) || [];
  const genres = data.genres?.map((item: any) => item.name) || [];
  const gameModes = data.game_modes?.map((item: any) => item.name) || [];
  const engine = data.game_engines?.map((item: any) => item.name) || [];
  const playerPerspective = data.player_perspectives?.map((item: any) => item.name) || [];

  const partialGameData: Partial<Game> = {
    summary: data.storyline ?? data.summary,
    scoreCritic: data.aggregated_rating ?? null,
    scoreCommunity: data.rating ?? null,
    releasedAt: data.first_release_date ? new Date(data.first_release_date * 1000) : null,
  };

  return {
    publishers,
    developers,
    partialGameData,
    themes,
    genres,
    gameModes,
    engine,
    playerPerspective,
    screenshots: data.screenshots.map((item: { url: string }) => item.url),
  };
};
