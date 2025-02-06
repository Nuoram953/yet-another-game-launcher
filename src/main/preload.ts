// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
//

import { RouteLibrary, RouteMedia } from "../common/constant";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("media", {
  getAllMedia: (gameId: string) =>
    ipcRenderer.invoke(RouteMedia.GET_ALL_MEDIA, gameId),
  getBackgrounds: (gameId: string, count?: number) =>
    ipcRenderer.invoke(RouteMedia.GET_BACKGROUNDS, gameId, count),
  getRecentlyPlayedBackgrounds: (count: number) =>
    ipcRenderer.invoke(RouteMedia.GET_RECENTLY_PLAYED_BACKGROUNDS, count),
  getLogos: (gameId: string, count?:number) =>
    ipcRenderer.invoke(RouteMedia.GET_LOGOS, gameId, count),
  getTrailers: (gameId: string, count?:number) =>
    ipcRenderer.invoke(RouteMedia.GET_TRAILERS, gameId, count),
  getCovers: (gameId: string, count?:number) =>
    ipcRenderer.invoke(RouteMedia.GET_COVERS, gameId, count),
  getAchievements: (gameId: number, count?:number) =>
    ipcRenderer.invoke(RouteMedia.GET_ACHIEVEMENTS, gameId, count),
});

contextBridge.exposeInMainWorld("library", {
  getCountForAllStatus: () =>
    ipcRenderer.invoke(RouteLibrary.GET_COUNT_STATUS),
});

contextBridge.exposeInMainWorld("appControl", {
  onAppBlur: (callback) => ipcRenderer.on("app-blur", callback),
  onAppFocus: (callback) => ipcRenderer.on("app-focus", callback),
});

contextBridge.exposeInMainWorld("api", {
  runCommand: (command: any) => ipcRenderer.invoke("run-command", command),
  updateLibraries: (forceReload: boolean) =>
    ipcRenderer.invoke("update-libraries", forceReload),
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

contextBridge.exposeInMainWorld("database", {
  getGames: (filters?: object, sort?: object) =>
    ipcRenderer.invoke("games", filters, sort),
  getGame: (id: string) => ipcRenderer.invoke("game", id),
  getRecentlyPlayed: (max: number) =>
    ipcRenderer.invoke("database:recentlyPlayed", max),
  setStatus: (id: string, status: number) =>
    ipcRenderer.invoke("database:setStatus", id, status),
});

contextBridge.exposeInMainWorld("steam", {
  launch: (appid: number) => ipcRenderer.invoke("steam:launch", appid),
  install: (appid: number) => ipcRenderer.invoke("steam:install", appid),
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
