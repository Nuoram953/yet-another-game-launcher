import _ from "lodash";
import queries from "../dal/dal";
import { config } from "../index";
import * as InternetGameDatabase from "@main/externalApi/internetGameDatabase/service";
import { FilterConfig, GameWithRelations, LaunchType, SidebarData, SortConfig } from "../../common/types";
import notificationManager from "../manager/notificationManager";
import { NotificationType } from "../../common/constant";
import { Epic } from "../storefront/epic/api";
import * as SteamService from "@main/storefront/steam/service";
import { FilterPreset, Game } from "@prisma/client";
import { RefreshLibraryCommand } from "./command/refresh";

export const refresh = async () => {
  await new RefreshLibraryCommand().runAll();
};

export const getStorefronts = async () => {
  return await queries.Storefront.findAll();
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

export const getGame = async (id: string, refreshAchievements: boolean = true) => {
  let game = await queries.Game.getGameById(id);
  if (_.isNil(game)) {
    throw new Error("Invalid game id ${id}");
  }

  // await GameService.updateInfo(game.id)

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

export const getSidebarData = async (): Promise<SidebarData> => {
  const storefronts = await queries.Storefront.findAll();
  if (_.isNil(storefronts)) {
    throw new Error("No storefronts found");
  }

  const status = await queries.GameStatus.getAll();
  if (_.isNil(status)) {
    throw new Error("No status found");
  }

  const platforms = await queries.Platform.findAll();
  if (_.isNil(platforms)) {
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
    platforms: await Promise.all(
      platforms.map(async (s) => ({
        id: s.id,
        name: s.name,
        count: await queries.GamePlatform.getCountByPlatformId(s.id),
      })),
    ),
  };
};

export const search = async (query: string) => {
  return await InternetGameDatabase.searchByName(query);
};

export const addGame = async (data: Partial<Game>) => {
  return await queries.Game.create(data);
};

export const getEmulators = async () => {
  return await queries.Emulator.findAll();
};
