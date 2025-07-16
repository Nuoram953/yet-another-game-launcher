import _ from "lodash";
import queries from "../dal/dal";
import { config } from "../index";
import { refreshGame, updateAchievements } from "../game/game.service";
import { FilterConfig, GameWithRelations, SidebarData, SortConfig } from "../../common/types";
import notificationManager from "../manager/notificationManager";
import { DataRoute, NotificationType, Storefront } from "../../common/constant";
import { Epic } from "../storefront/epic/api";
import * as SteamCommand from "../storefront/steam/commands";
import * as SteamService from "@main/storefront/steam/service";
import * as EpicCommand from "../storefront/epic/commands";
import * as GameService from "@main/game/game.service";
import * as YoutubeEndpoints from "@main/externalApi/youtube/endpoints";
import dataManager from "../manager/dataChannelManager";
import { createGameActiviy } from "../dal/gameActiviy";
import { getMinutesBetween } from "../utils/utils";
import { monitorDirectoryProcesses } from "../utils/tracking";
import logger, { LogTag } from "@main/logger";
import { FilterPreset } from "@prisma/client";

export const getStorefronts = async () => {
  return await queries.Storefront.findAll();
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
    notificationManager.updateProgress(NotificationType.REFRESH, 25, "Updating Steam library");
    await SteamService.refresh();
  }

  if (await config.get("store.epic.enable")) {
    notificationManager.updateProgress(NotificationType.REFRESH, 35, "Updating Epic library");
    const epic = new Epic();
    await epic.initialize();
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

export const clearDownloadHistory = async () => {
  return await queries.DownloadHistory.hideAll();
};

export const getGame = async (id: string) => {
  let game = await queries.Game.getGameById(id);
  if (_.isNil(game)) {
    throw new Error("Invalid game id ${id}");
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
  const presets = await queries.FilterPreset.findAll();
  const companies = await queries.Company.findAll();
  const tags = await queries.Tag.findAll();
  const status = await queries.GameStatus.findAll();
  const storefronts = await queries.Storefront.findAll();

  return { presets, companies, tags, status, storefronts };
};

export const setFilterPreset = async (data: Partial<FilterPreset>) => {
  await queries.FilterPreset.createOrUpdate(data);
};

export const deleteFilterPreset = async (name: string) => {
  await queries.FilterPreset.deleteByName(name);
};

export const preLaunch = async (game: GameWithRelations) => {
  logger.info(`preLaunch for game`, { id: game.id }, LogTag.TRACKING);
};

export const launch = async (id: string) => {
  const game = await queries.Game.getGameById(id);
  if (_.isNil(game)) {
    throw new Error("game not found");
  }
  await preLaunch(game);
  logger.info(`Launch game`, { id: game.id }, LogTag.TRACKING);

  switch (game.storefrontId) {
    case Storefront.STEAM: {
      await SteamCommand.run(game);
      break;
    }
    case Storefront.EPIC: {
      await EpicCommand.run(game);
      break;
    }
  }

  dataManager.send(DataRoute.RUNNING_GAME, {
    isRunning: true,
    id: game.id,
  });

  const { startTime, endTime } = await monitorDirectoryProcesses(game?.location!);
  await postLaunch(game, startTime, endTime);
};

export const postLaunch = async (game: GameWithRelations, startTime: Date, endTime: Date | null) => {
  logger.info(`postLaunch for game`, { id: game.id }, LogTag.TRACKING);
  if (startTime && endTime) {
    const minutes = await getMinutesBetween(startTime, endTime);
    if (minutes > 0) {
      await createGameActiviy(game.id, startTime, endTime);
      await queries.Game.updateTimePlayed(game.id, minutes + 5);
    } else {
      logger.info(`Game session for ${game.id} was ${minutes} minutes. Won't create a game activity`);
    }

    if (game.gameStatusId === 7) {
      await queries.Game.update(game.id, { gameStatusId: 6 });
    }

    await updateAchievements(game);
  }

  dataManager.send(DataRoute.RUNNING_GAME, {
    isRunning: false,
    id: game.id,
  });

  await refreshGame(game.id);
};

export const getSidebarData = async (): Promise<SidebarData> => {
  const storefronts = await queries.Storefront.findAll();
  if (_.isNil(storefronts)) {
    throw new Error("No storefronts found");
  }

  const status = await queries.GameStatus.getAll();
  if (_.isNil(status)) {
    throw new Error("No status found");
  }

  return {
    storefronts: await Promise.all(
      storefronts.map(async (storefront) => ({
        id: storefront.id,
        name: storefront.name,
        count: await queries.Game.getCountByStoreId(storefront.id),
        hasWeb: storefront.url,
        hasExecutable: storefront.hasLauncher,
      })),
    ),
    status: await Promise.all(
      status.map(async (s) => ({
        id: s.id,
        name: s.name,
        count: await queries.Game.getCountByStatusId(s.id),
      })),
    ),
  };
};
