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
    return {
      backgrounds,
      icons,
      logos,
      covers,
      trailers,
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
