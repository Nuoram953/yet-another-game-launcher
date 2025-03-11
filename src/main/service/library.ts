import _ from "lodash";
import queries from "../dal/dal";
import { config, igdb, metadataManager } from "../index";
import { updateAchievements } from "./game";
import { FilterConfig, SortConfig } from "../../common/types";
import Steam from "../api/storefront/steam";
import notificationManager from "../manager/notificationManager";
import { NotificationType } from "../../common/constant";
import { Epic } from "../storefront/epic/api";

export const getStorefronts = async () => {
  return await queries.Storefront.getAll()
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

  if (config.get("store.steam.enable")) {
    const steam = new Steam();
    await steam.initialize();
    notificationManager.updateProgress(NotificationType.REFRESH, 25);
  }

  if (config.get("store.epic.enable")) {
    const epic = new Epic();
    await epic.initialize();
    notificationManager.updateProgress(NotificationType.REFRESH, 35);
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

  // const {developers, publishers, partialGameData} = await igdb.getGame(game.externalId!, game.storefrontId!)
  // await queries.Game.update(game.id, partialGameData)
  // for(const developer of developers){
  //   await queries.GameDeveloper.findOrCreate(game.id, developer)
  // }
  // console.log(developers)
  await metadataManager.downloadMissing(game);
  await updateAchievements(game);

  return await queries.Game.getGameById(id);
};

export const getGames = async (filters?: FilterConfig, sort?: SortConfig) => {
  return await queries.Game.getGames(null, filters, sort);
};

export const getLastPlayed = async (max: number) => {
  return await queries.Game.getGamesLastPlayed(max);
};
