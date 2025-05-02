import { ipcMain } from "electron";
import _ from "lodash";
import { MEDIA_TYPE, RouteMedia } from "../../common/constant";
import log from "electron-log/main";
import * as MediaService from "../service/media";
import { ErrorMessage } from "../../common/error";

ipcMain.handle(RouteMedia.GET_ALL_MEDIA, async (_event, gameId) => {
  try {
    const backgrounds = await MediaService.getMediaByType(
      MEDIA_TYPE.BACKGROUND,
      gameId,
    );
    const icons = await MediaService.getMediaByType(MEDIA_TYPE.ICON, gameId);
    const logos = await MediaService.getMediaByType(MEDIA_TYPE.LOGO, gameId);
    const covers = await MediaService.getMediaByType(MEDIA_TYPE.COVER, gameId);
    const trailers = await MediaService.getMediaByType(
      MEDIA_TYPE.TRAILER,
      gameId,
    );
    const screenshots = await MediaService.getMediaByType(MEDIA_TYPE.SCREENSHOT, gameId);

    return {
      backgrounds,
      icons,
      logos,
      covers,
      trailers,
      screenshots,
    };
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteMedia.GET_BACKGROUNDS, async (_event, gameId, count) => {
  try {
    return await MediaService.getMediaByType(
      MEDIA_TYPE.BACKGROUND,
      gameId,
      count,
    );
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteMedia.GET_LOGOS, async (_event, gameId, count) => {
  try {
    return MediaService.getMediaByType(MEDIA_TYPE.LOGO, gameId, count);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteMedia.GET_ICONS, async (_event, gameId, count) => {
  try {
    return MediaService.getMediaByType(MEDIA_TYPE.ICON, gameId, count);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteMedia.GET_COVERS, async (_event, gameId, count) => {
  try {
    return await MediaService.getMediaByType(MEDIA_TYPE.COVER, gameId, count);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteMedia.GET_TRAILERS, async (_event, gameId, count) => {
  try {
    return await MediaService.getMediaByType(MEDIA_TYPE.TRAILER, gameId, count);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(
  RouteMedia.GET_RECENTLY_PLAYED_BACKGROUNDS,
  async (_event, count) => {
    try {
      return await MediaService.getRecentlyPlayedBackgrounds(count);
    } catch (e) {
      log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
      log.debug(e);
      return [];
    }
  },
);

ipcMain.handle(RouteMedia.GET_ACHIEVEMENTS, async (_event, gameId) => {
  try {
    return await MediaService.getMediaByType(MEDIA_TYPE.ACHIEVEMENT, gameId);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteMedia.GET_SCREENSHOTS, async (_event, gameId, count) => {
  try {
    return MediaService.getMediaByType(MEDIA_TYPE.SCREENSHOT, gameId, count);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteMedia.DELETE, async (_event, gameId, mediaType, mediaName) => {
  try {
    return MediaService.deleteMediaByGameIdAndMediaId(gameId, mediaType, mediaName);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteMedia.SEARCH, async (_event, gameId, mediaType, page) => {
  try {
    return MediaService.search(gameId, mediaType, page);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteMedia.DOWNLOAD_BY_URL, async (_event, gameId, mediaType, url) => {
  try {
    await MediaService.downloadByUrl(gameId, mediaType, url);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteMedia.SET_DEFAULT, async (_event, gameId, mediaType, name) => {
  try {
    await MediaService.setDefault(gameId, mediaType, name);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});
