import type {
  ConfigAPI,
  NotificationsAPI,
  StoreAPI,
  AppControlAPI,
  MediaAPI,
  RankingAPI,
  LibraryAPI,
  GameAPI,
  DataAPI,
} from "@preload/electron-api-types";

export const getConfig = (): ConfigAPI => window.config;
export const getNotifications = (): NotificationsAPI => window.notifications;
export const getStore = (): StoreAPI => window.store;
export const getAppControl = (): AppControlAPI => window.appControl;
export const getMedia = (): MediaAPI => window.media;
export const getRanking = (): RankingAPI => window.ranking;
export const getLibrary = (): LibraryAPI => window.library;
export const getGame = (): GameAPI => window.game;
export const getData = (): DataAPI => window.data;

export const verifyAPIsAvailable = (): boolean => {
  const apis = [
    { name: "config", api: window.config },
    { name: "notifications", api: window.notifications },
    { name: "store", api: window.store },
    { name: "appControl", api: window.appControl },
    { name: "media", api: window.media },
    { name: "ranking", api: window.ranking },
    { name: "library", api: window.library },
    { name: "game", api: window.game },
    { name: "data", api: window.data },
  ];

  const missingApis = apis.filter(({ api }) => !api).map(({ name }) => name);

  if (missingApis.length > 0) {
    console.error(`Missing Electron APIs: ${missingApis.join(", ")}`);
    return false;
  }

  return true;
};
