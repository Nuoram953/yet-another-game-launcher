import { Game, GameConfigGamescope, GameReview } from "@prisma/client";
import { RouteGame, RouteLibrary, RouteMedia } from "../common/constant";
import { FilterConfig, SortConfig } from "../common/types";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("media", {
  getAllMedia: (gameId: string) =>
    ipcRenderer.invoke(RouteMedia.GET_ALL_MEDIA, gameId),
  getBackgrounds: (gameId: string, count?: number) =>
    ipcRenderer.invoke(RouteMedia.GET_BACKGROUNDS, gameId, count),
  getRecentlyPlayedBackgrounds: (count: number) =>
    ipcRenderer.invoke(RouteMedia.GET_RECENTLY_PLAYED_BACKGROUNDS, count),
  getLogos: (gameId: string, count?: number) =>
    ipcRenderer.invoke(RouteMedia.GET_LOGOS, gameId, count),
  getTrailers: (gameId: string, count?: number) =>
    ipcRenderer.invoke(RouteMedia.GET_TRAILERS, gameId, count),
  getCovers: (gameId: string, count?: number) =>
    ipcRenderer.invoke(RouteMedia.GET_COVERS, gameId, count),
  getAchievements: (gameId: number, count?: number) =>
    ipcRenderer.invoke(RouteMedia.GET_ACHIEVEMENTS, gameId, count),
  getScreenshots: (gameId: number, count?: number) =>
    ipcRenderer.invoke(RouteMedia.GET_SCREENSHOTS, gameId, count),
});

contextBridge.exposeInMainWorld("library", {
  refresh: () => ipcRenderer.invoke(RouteLibrary.REFRESH),
  getGame: (id: string) => ipcRenderer.invoke(RouteLibrary.GET_GAME, id),
  getGames: (filters?: FilterConfig, sort?: SortConfig) =>
    ipcRenderer.invoke(RouteLibrary.GET_GAMES, filters, sort),
  getLastPlayed: (max: number) =>
    ipcRenderer.invoke(RouteLibrary.GET_LAST_PLAYED, max),
  getCountForAllStatus: () => ipcRenderer.invoke(RouteLibrary.GET_COUNT_STATUS),
  getStatus: () => ipcRenderer.invoke(RouteLibrary.GET_STATUS),
  getDownloadHistory: () =>
    ipcRenderer.invoke(RouteLibrary.GET_DOWNLOAD_HISTORY),
  getStorefronts: () => ipcRenderer.invoke(RouteLibrary.GET_STOREFRONTS),
  getFilters: () => ipcRenderer.invoke(RouteLibrary.GET_FILTERS),
});

contextBridge.exposeInMainWorld("game", {
  launch: (id: string) => ipcRenderer.invoke(RouteGame.LAUNCH, id),
  install: (id: string) => ipcRenderer.invoke(RouteGame.INSTALL, id),
  kill: (id: string) => ipcRenderer.invoke(RouteGame.KILL, id),
  uninstall: (id: string) => ipcRenderer.invoke(RouteGame.UNINSTALL, id),
  setReview: (data: Partial<GameReview>) =>
    ipcRenderer.invoke(RouteGame.SET_REVIEW, data),
  setStatus: (data: Partial<Game>) =>
    ipcRenderer.invoke(RouteGame.SET_STATUS, data),
  setGamescope: (data: GameConfigGamescope) =>
    ipcRenderer.invoke(RouteGame.SET_SETTING_GAMESCOPE, data),
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
  onAppBlur: (callback:()=>void) => ipcRenderer.on("app-blur", callback),
  onAppFocus: (callback:()=>void) => ipcRenderer.on("app-focus", callback),
});

contextBridge.exposeInMainWorld("store", {
  launch: (storeName: string) => ipcRenderer.invoke("store:launch", storeName),
});

contextBridge.exposeInMainWorld("notifications", {
  send: (notification:any) => ipcRenderer.send("send-notification", notification),
  onReceive: (callback:(notification:any)=>void) => {
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
