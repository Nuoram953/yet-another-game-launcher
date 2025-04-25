import _ from "lodash";
import queries from "../dal/dal";
import { config } from "../index";
import { updateAchievements } from "./game";
import { FilterConfig, SortConfig } from "../../common/types";
import Steam from "../api/storefront/steam";
import notificationManager from "../manager/notificationManager";
import { NotificationType } from "../../common/constant";
import { Epic } from "../storefront/epic/api";
import * as GameSerivce from "./game";
import { NODE_ENV, NODE_ENV_ENUM } from "../config";

export const getStorefronts = async () => {
  return await queries.Storefront.getAll();
};

export const refresh = async () => {
  notificationManager.show({
    id: NotificationType.REFRESH,
    title: "Updating libraries",
    message: "You can continue to use the app while it's updating",
    type: "progress",
    current: 10,
    total: 100,
    autoClose: true,
  });

  if (await config.get("store.steam.enable")) {
    const steam = new Steam();
    await steam.initialize();
    notificationManager.updateProgress(NotificationType.REFRESH, 25, "Steam");
  }

  if (await config.get("store.epic.enable")) {
    const epic = new Epic();
    await epic.initialize();
    notificationManager.updateProgress(NotificationType.REFRESH, 35, "Epic");
  }

  notificationManager.updateProgress(NotificationType.REFRESH, 100);
};

export const getCountForAllStatus = async () => {
  const countStatus = await queries.GameStatus.getCountForAllStatus();
  if (_.isNil(countStatus)) {
    throw new Error("invalid");
  }

  return countStatus;
};

export const getCountForAllStore = async () => {
  return await queries.Game.getCountByStore();
};

export const getStatus = async () => {
  return await queries.GameStatus.getAll();
};

export const getDownloadHistory = async () => {
  return await queries.DownloadHistory.getAll(10);
};

export const getGame = async (id: string) => {
  let game = await queries.Game.getGameById(id);
  if (_.isNil(game)) {
    throw new Error("Invalid game id ${id}");
  }

  //For existing games that don't have metadata downloaded
  if (!game.openedAt) {
    await GameSerivce.createOrUpdateGame(game, game.storefrontId!, true);

    await queries.Game.update(game.id, {
      openedAt: new Date(),
    });
  }

  await updateAchievements(game);

  await queries.Game.update(id, {
    openedAt: new Date(),
  });

  return await queries.Game.getGameById(id);
};

export const getGames = async (filters?: FilterConfig, sort?: SortConfig) => {
  return await queries.Game.getGames(null, filters, sort);
};

export const getLastPlayed = async (max: number) => {
  return await queries.Game.getGamesLastPlayed(max);
};

export const getFilters = async () => {
  const companies = await queries.Company.findAll();
  const tags = await queries.Tag.findAll();
  const status = await queries.GameStatus.findAll();

  return { companies, tags, status };
};
