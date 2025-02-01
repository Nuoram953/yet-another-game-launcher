// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
//

import { IGame } from "src/common/types";

//
const { contextBridge, ipcRenderer } = require("electron");

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
  getGames: () => ipcRenderer.invoke("games"),
  getGame: (id: string) => ipcRenderer.invoke("game", id),
  getStatus: () => ipcRenderer.invoke("statusAndCount"),
  getRecentlyPlayed: (max: number) =>
    ipcRenderer.invoke("database:recentlyPlayed", max),
  setStatus: (id:string, status:number) => ipcRenderer.invoke("database:setStatus", id, status)
});

contextBridge.exposeInMainWorld("steam", {
  launch: (appid: number) => ipcRenderer.invoke("steam:launch", appid),
  install: (appid: number) => ipcRenderer.invoke("steam:install", appid),
});

contextBridge.exposeInMainWorld("ressource", {
  getAll: (appid: number) => ipcRenderer.invoke("ressource:getAll", appid),
  getSingleBackground: (appid: number) =>
    ipcRenderer.invoke("ressource:singleBackground", appid),
  getSingleLogo: (appid: number) =>
    ipcRenderer.invoke("ressource:singleLogo", appid),
  getRecentlyPlayedBackgrounds: (max: number) =>
    ipcRenderer.invoke("ressource:recentlyPlayedBackground", max),
  getSingleTrailer: (appid: number) =>
    ipcRenderer.invoke("ressource:singleTrailer", appid),
  getSingleCover: (appid: number) =>
    ipcRenderer.invoke("ressource:singleCover", appid),
  getAchievements: (appid: number) =>
    ipcRenderer.invoke("ressource:achievements", appid),
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
