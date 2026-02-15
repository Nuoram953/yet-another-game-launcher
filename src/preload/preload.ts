import {
  FilterPreset,
  Game,
  GameConfigGamescope,
  GameLaunchApp,
  GameLaunchEmulation,
  GameReview,
  GameReviewThoughts,
} from "@prisma/client";
import {
  ConfigRoute,
  RouteDialog,
  RouteGame,
  RouteLibrary,
  RouteMedia,
  RouteRanking,
  RouteStore,
  RouteThirdParty,
  RouteWishlist,
} from "../common/constant";
import { FilterConfig, LaunchType, SortConfig } from "../common/types";
import { AppConfig } from "../common/interface";
import { PathsToProperties } from "@main/manager/configManager";
import { MediaApi, RankingAPI, GameAPI } from "@common/ipc";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dialog", {
  open: () => ipcRenderer.invoke(RouteDialog.OPEN),
});

contextBridge.exposeInMainWorld("config", {
  get: (key: PathsToProperties<AppConfig>) => ipcRenderer.invoke(ConfigRoute.GET, key),
  getAll: () => ipcRenderer.invoke(ConfigRoute.GET_ALL),
  set: (key: PathsToProperties<AppConfig>, value: any) => ipcRenderer.invoke(ConfigRoute.SET, key, value),
});

contextBridge.exposeInMainWorld("library", {
  launch: (data) => ipcRenderer.invoke(RouteLibrary.LAUNCH_GAME, data),
  refresh: () => ipcRenderer.invoke(RouteLibrary.REFRESH),
  refreshGame: (data) => ipcRenderer.invoke(RouteLibrary.REFRESH_GAME, data),
  getSidebar: () => ipcRenderer.invoke(RouteLibrary.GET_SIDEBAR),
  getGame: (id: string, refreshAchievements: boolean = true) =>
    ipcRenderer.invoke(RouteLibrary.GET_GAME, id, refreshAchievements),
  getGames: (filters?: FilterConfig, sort?: SortConfig) => ipcRenderer.invoke(RouteLibrary.GET_GAMES, filters, sort),
  getLastPlayed: (max: number) => ipcRenderer.invoke(RouteLibrary.GET_LAST_PLAYED, max),
  getCountForAllStatus: () => ipcRenderer.invoke(RouteLibrary.GET_COUNT_STATUS),
  getStatus: () => ipcRenderer.invoke(RouteLibrary.GET_STATUS),
  getDownloadHistory: () => ipcRenderer.invoke(RouteLibrary.GET_DOWNLOAD_HISTORY),
  clearDownloadHistory: () => ipcRenderer.invoke(RouteLibrary.CLEAR_DOWNLOAD_HISTORY),
  getStorefronts: () => ipcRenderer.invoke(RouteLibrary.GET_STOREFRONTS),
  getFilters: () => ipcRenderer.invoke(RouteLibrary.GET_FILTERS),
  setFilterPreset: (data: Partial<FilterPreset>) => ipcRenderer.invoke(RouteLibrary.SET_FILTER_PRESET, data),
  deleteFilterPreset: (name: string) => ipcRenderer.invoke(RouteLibrary.DELETE_FILTER_PRESET, name),
  search: (query: string) => ipcRenderer.invoke(RouteLibrary.SEARCH, query),
  addGame: (data: Partial<Game>) => ipcRenderer.invoke(RouteLibrary.ADD_GAME, data),
  getEmulators: () => ipcRenderer.invoke(RouteLibrary.GET_EMULATORS),
});

contextBridge.exposeInMainWorld("game", {
  launch: (id: string, launchType: LaunchType, launchId: number) =>
    ipcRenderer.invoke(RouteGame.LAUNCH, id, launchType, launchId),
  install: (id: string) => ipcRenderer.invoke(RouteGame.INSTALL, id),
  kill: (id: string, launchId: number, type: LaunchType) => ipcRenderer.invoke(RouteGame.KILL, id, launchId, type),
  uninstall: (id: string) => ipcRenderer.invoke(RouteGame.UNINSTALL, id),

  setReview: (data: Partial<GameReview>) => ipcRenderer.invoke(RouteGame.SET_REVIEW, data),
  getReview: (id: string) => ipcRenderer.invoke(RouteGame.GET_REVIEW, id),
  createReviewThought: (gameId: string) => ipcRenderer.invoke(RouteGame.CREATE_REVIEW_THOUGHT, gameId),
  updateReviewThought: (data: Partial<GameReviewThoughts>) => ipcRenderer.invoke(RouteGame.UPDATE_REVIEW_THOUGHT, data),
  deleteReviewThought: (id: string) => ipcRenderer.invoke(RouteGame.DELETE_REVIEW_THOUGHT, id),

  setStatus: (data: Partial<Game>) => ipcRenderer.invoke(RouteGame.SET_STATUS, data),
  setFavorite: (id: string, isFavorite: boolean) => ipcRenderer.invoke(RouteGame.SET_FAVORITE, id, isFavorite),
  setGamescope: (data: GameConfigGamescope) => ipcRenderer.invoke(RouteGame.SET_SETTING_GAMESCOPE, data),
  refreshProgressTracker: (id: string) => ipcRenderer.invoke(RouteGame.REFRESH_PROGRESS_TRACKER, id),
  refreshInfo: (id: string) => ipcRenderer.invoke(RouteGame.REFRESH_INFO, id),
  resetReview: (id: string) => ipcRenderer.invoke(RouteGame.RESET_REVIEW, id),
  addLaunchApp: (data: Partial<GameLaunchApp>) => ipcRenderer.invoke(RouteGame.ADD_LAUNCH_APP, data),
  addLaunchEmulator: (data: Partial<GameLaunchEmulation>) => ipcRenderer.invoke(RouteGame.ADD_LAUNCH_EMULATOR, data),
  deleteLaunch: (type: LaunchType, id: number) => ipcRenderer.invoke(RouteGame.DELETE_LAUNCH, type, id),
});

contextBridge.exposeInMainWorld("wishlist", {
  search: (query: string) => ipcRenderer.invoke(RouteWishlist.SEARCH, query),
  add: (externalId: number) => ipcRenderer.invoke(RouteWishlist.ADD, externalId),
  get: () => ipcRenderer.invoke(RouteWishlist.GET),
  remove: (externalId: number) => ipcRenderer.invoke(RouteWishlist.REMOVE, externalId),
});

contextBridge.exposeInMainWorld("data", {
  on: (channel: string, callback: (data: any) => void) => {
    const subscription = (_event: any, payload: any) => callback(payload);
    ipcRenderer.on(channel, subscription);
    return subscription;
  },

  off: (channel: string, callback: (data: any) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },

  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },

  subscribe: (channel: string, interval?: number) => {
    return ipcRenderer.invoke("start-realtime-updates", { channel, interval });
  },

  unsubscribe: (channel: string) => {
    return ipcRenderer.invoke("stop-realtime-updates", { channel });
  },
});

contextBridge.exposeInMainWorld("appControl", {
  onAppBlur: (callback: () => void) => ipcRenderer.on("app-blur", callback),
  onAppFocus: (callback: () => void) => ipcRenderer.on("app-focus", callback),
});

contextBridge.exposeInMainWorld("store", {
  launch: (storeName: string) => ipcRenderer.invoke(RouteStore.LAUNCH, storeName),
});

contextBridge.exposeInMainWorld("notifications", {
  send: (notification: any) => ipcRenderer.send("send-notification", notification),
  onReceive: (callback: (notification: any) => void) => {
    ipcRenderer.on("notification", (_event, notification) => {
      callback(notification);
    });
  },
  removeListener: () => {
    ipcRenderer.removeAllListeners("notification");
  },
});

contextBridge.exposeInMainWorld("electron", {
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, ...args) => callback(...args));
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

//****************************************************************************************************

const ranking: RankingAPI = {
  getRanking: (id) => ipcRenderer.invoke(RouteRanking.GET_RANKING, id),
  getRankings: () => ipcRenderer.invoke(RouteRanking.GET_RANKINGS),
  createRanking: (data) => ipcRenderer.invoke(RouteRanking.CREATE, data),
  deleteRanking: (id) => ipcRenderer.invoke(RouteRanking.DELETE, id),
  addGameRanking: (data) => ipcRenderer.invoke(RouteRanking.ADD_GAME_FROM_RANKING, data),
  removeGameRanking: (data) => ipcRenderer.invoke(RouteRanking.REMOVE_GAME_FROM_RANKING, data),
  updateGameOrder: (data) => ipcRenderer.invoke(RouteRanking.UPDATE_GAME_ORDER, data),
};
contextBridge.exposeInMainWorld("ranking", ranking);

const media: MediaApi = {
  getMediaByType: (data) => ipcRenderer.invoke(RouteMedia.GET_MEDIA_BY_TYPE, data),
  getAllMedia: () => ipcRenderer.invoke(RouteMedia.GET_ALL_MEDIA),
  deleteMedia: (data) => ipcRenderer.invoke(RouteMedia.DELETE, data),
  searchMedia: (data) => ipcRenderer.invoke(RouteMedia.SEARCH, data),
  downloadByUrl: (data) => ipcRenderer.invoke(RouteMedia.DOWNLOAD_BY_URL, data),
  setDefault: (data) => ipcRenderer.invoke(RouteMedia.SET_DEFAULT, data),
  removeDefault: (data) => ipcRenderer.invoke(RouteMedia.REMOVE_DEFAULT, data),
};
contextBridge.exposeInMainWorld("media", media);

const gameApi: GameAPI = {
  launch: (data) => ipcRenderer.invoke(RouteGame.LAUNCH, data.id, data.launchType, data.launchId),
  setGameStatus: (data) => ipcRenderer.invoke(RouteGame.SET_STATUS, data),
  setGameFavorite: (data) => ipcRenderer.invoke(RouteGame.SET_FAVORITE, data.id, data.isFavorite),
  installGame: (data) => ipcRenderer.invoke(RouteGame.INSTALL, data.id),
  uninstallGame: (data) => ipcRenderer.invoke(RouteGame.UNINSTALL, data.id),
  killGame: (id, launchId, type) => ipcRenderer.invoke(RouteGame.KILL, id, launchId, type),
  createReviewThought: (data) => ipcRenderer.invoke(RouteGame.CREATE_REVIEW_THOUGHT, data),
  updateReviewThought: (data) => ipcRenderer.invoke(RouteGame.UPDATE_REVIEW_THOUGHT, data),
  deleteReviewThought: (data) => ipcRenderer.invoke(RouteGame.DELETE_REVIEW_THOUGHT, data),
};
contextBridge.exposeInMainWorld("gameApi", gameApi);
