import { FilterPreset, Game, GameConfigGamescope, GameReview } from "@prisma/client";
import {
  ConfigRoute,
  RouteDialog,
  RouteGame,
  RouteLibrary,
  RouteMedia,
  RouteRanking,
  RouteStore,
} from "../common/constant";
import { FilterConfig, SortConfig } from "../common/types";
import { AppConfig } from "../common/interface";
import { PathsToProperties } from "@main/manager/configManager";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dialog", {
  open: () => ipcRenderer.invoke(RouteDialog.OPEN),
});

contextBridge.exposeInMainWorld("config", {
  get: (key: PathsToProperties<AppConfig>) => ipcRenderer.invoke(ConfigRoute.GET, key),
  getAll: () => ipcRenderer.invoke(ConfigRoute.GET_ALL),
  set: (key: PathsToProperties<AppConfig>, value: any) => ipcRenderer.invoke(ConfigRoute.SET, key, value),
});

contextBridge.exposeInMainWorld("media", {
  getAllMedia: (gameId: string) => ipcRenderer.invoke(RouteMedia.GET_ALL_MEDIA, gameId),
  getBackgrounds: (gameId: string, count?: number) => ipcRenderer.invoke(RouteMedia.GET_BACKGROUNDS, gameId, count),
  getRecentlyPlayedBackgrounds: (count: number) =>
    ipcRenderer.invoke(RouteMedia.GET_RECENTLY_PLAYED_BACKGROUNDS, count),
  getLogos: (gameId: string, count?: number) => ipcRenderer.invoke(RouteMedia.GET_LOGOS, gameId, count),
  getTrailers: (gameId: string, count?: number) => ipcRenderer.invoke(RouteMedia.GET_TRAILERS, gameId, count),
  getCovers: (gameId: string, count?: number) => ipcRenderer.invoke(RouteMedia.GET_COVERS, gameId, count),
  getAchievements: (gameId: number, count?: number) => ipcRenderer.invoke(RouteMedia.GET_ACHIEVEMENTS, gameId, count),
  getScreenshots: (gameId: number, count?: number) => ipcRenderer.invoke(RouteMedia.GET_SCREENSHOTS, gameId, count),
  getIcons: (gameId: number, count?: number) => ipcRenderer.invoke(RouteMedia.GET_ICONS, gameId, count),
  delete: (gameId: string, mediaType: string, mediaId: string) =>
    ipcRenderer.invoke(RouteMedia.DELETE, gameId, mediaType, mediaId),
  search: (gameId: string, mediaType: string, page: number) =>
    ipcRenderer.invoke(RouteMedia.SEARCH, gameId, mediaType, page),
  downloadByUrl: (gameId: string, mediaType: string, url: string) =>
    ipcRenderer.invoke(RouteMedia.DOWNLOAD_BY_URL, gameId, mediaType, url),
  setDefault: (gameId: string, mediaType: string, name: string) =>
    ipcRenderer.invoke(RouteMedia.SET_DEFAULT, gameId, mediaType, name),
  removeDefault: (gameId: string, mediaType: string) =>
    ipcRenderer.invoke(RouteMedia.REMOVE_DEFAULT, gameId, mediaType),
});

contextBridge.exposeInMainWorld("library", {
  refresh: () => ipcRenderer.invoke(RouteLibrary.REFRESH),
  getGame: (id: string) => ipcRenderer.invoke(RouteLibrary.GET_GAME, id),
  getGames: (filters?: FilterConfig, sort?: SortConfig) => ipcRenderer.invoke(RouteLibrary.GET_GAMES, filters, sort),
  getLastPlayed: (max: number) => ipcRenderer.invoke(RouteLibrary.GET_LAST_PLAYED, max),
  getCountForAllStatus: () => ipcRenderer.invoke(RouteLibrary.GET_COUNT_STATUS),
  getStatus: () => ipcRenderer.invoke(RouteLibrary.GET_STATUS),
  getDownloadHistory: () => ipcRenderer.invoke(RouteLibrary.GET_DOWNLOAD_HISTORY),
  getStorefronts: () => ipcRenderer.invoke(RouteLibrary.GET_STOREFRONTS),
  getFilters: () => ipcRenderer.invoke(RouteLibrary.GET_FILTERS),
  setFilterPreset: (data: Partial<FilterPreset>) => ipcRenderer.invoke(RouteLibrary.SET_FILTER_PRESET, data),
  deleteFilterPreset: (name: string) => ipcRenderer.invoke(RouteLibrary.DELETE_FILTER_PRESET, name),
});

contextBridge.exposeInMainWorld("ranking", {
  getRanking: (id: number) => ipcRenderer.invoke(RouteRanking.GET_RANKING, id),
  getAll: () => ipcRenderer.invoke(RouteRanking.GET_RANKINGS),
  create: (name: string, maxItems: number) => ipcRenderer.invoke(RouteRanking.CREATE, name, maxItems),
  delete: (id: number) => ipcRenderer.invoke(RouteRanking.DELETE, id),
  edit: (data: Partial<Game>) => ipcRenderer.invoke(RouteRanking.EDIT, data),
  removeGameFromRanking: (rankingId: number, gameId: string) =>
    ipcRenderer.invoke(RouteRanking.REMOVE_GAME_FROM_RANKING, rankingId, gameId),
});

contextBridge.exposeInMainWorld("game", {
  launch: (id: string) => ipcRenderer.invoke(RouteGame.LAUNCH, id),
  install: (id: string) => ipcRenderer.invoke(RouteGame.INSTALL, id),
  kill: (id: string) => ipcRenderer.invoke(RouteGame.KILL, id),
  uninstall: (id: string) => ipcRenderer.invoke(RouteGame.UNINSTALL, id),
  setReview: (data: Partial<GameReview>) => ipcRenderer.invoke(RouteGame.SET_REVIEW, data),
  setStatus: (data: Partial<Game>) => ipcRenderer.invoke(RouteGame.SET_STATUS, data),
  setFavorite: (data: Partial<Game>) => ipcRenderer.invoke(RouteGame.SET_FAVORITE, data),
  setGamescope: (data: GameConfigGamescope) => ipcRenderer.invoke(RouteGame.SET_SETTING_GAMESCOPE, data),
  refreshProgressTracker: (id: string) => ipcRenderer.invoke(RouteGame.REFRESH_PROGRESS_TRACKER, id),
  refreshInfo: (id: string) => ipcRenderer.invoke(RouteGame.REFRESH_INFO, id),
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
