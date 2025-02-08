// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
//

import { Game, GameReview } from "@prisma/client";
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
});

contextBridge.exposeInMainWorld("game", {
  launch: (id: string) => ipcRenderer.invoke(RouteGame.LAUNCH, id),
  install: (id: string) => ipcRenderer.invoke(RouteGame.INSTALL, id),
  setReview: (data: Partial<GameReview>) =>
    ipcRenderer.invoke(RouteGame.SET_REVIEW, data),
  setStatus: (data: Partial<Game>) =>
    ipcRenderer.invoke(RouteGame.SET_STATUS, data),
});

contextBridge.exposeInMainWorld("appControl", {
  onAppBlur: (callback) => ipcRenderer.on("app-blur", callback),
  onAppFocus: (callback) => ipcRenderer.on("app-focus", callback),
});

contextBridge.exposeInMainWorld("api", {
  runCommand: (command: any) => ipcRenderer.invoke("run-command", command),
  getSteamGames: () => ipcRenderer.invoke("get-steam-games"),
  onReceiveFromMain: (channel, callback) => {
    const validChannels = [
      "add-new-game",
      "is-game-running",
      "request:games",
      "request:game",
    ]; // Define valid channels
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, data) => {
        callback(data); // Pass data to the provided callback
      });
    }
  },

  // Cleanup to avoid memory leaks
  removeListener: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

contextBridge.exposeInMainWorld("store", {
  launch: (storeName: string) => ipcRenderer.invoke("store:launch", storeName),
});

contextBridge.exposeInMainWorld("notifications", {
  send: (notification) => ipcRenderer.send("send-notification", notification),
  onReceive: (callback) => {
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
