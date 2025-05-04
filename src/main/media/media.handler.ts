import { ipcMain } from "electron";
import _ from "lodash";
import { MEDIA_TYPE, RouteMedia } from "../../common/constant";
import * as MediaService from "../media/media.service";
import { ErrorMessage } from "../../common/error";
import logger from "@main/logger";

ipcMain.handle(RouteMedia.GET_ALL_MEDIA, async (_event, gameId) => {
  try {
    return await MediaService.getAllMedia(gameId);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteMedia.GET_ALL_MEDIA,
      error: e,
    });
  }
});

ipcMain.handle(RouteMedia.GET_BACKGROUNDS, async (_event, gameId, count) => {
  try {
    return await MediaService.getMediaByType(MEDIA_TYPE.BACKGROUND, gameId, count);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteMedia.GET_BACKGROUNDS,
      error: e,
    });
  }
});

ipcMain.handle(RouteMedia.GET_LOGOS, async (_event, gameId, count) => {
  try {
    return MediaService.getMediaByType(MEDIA_TYPE.LOGO, gameId, count);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteMedia.GET_LOGOS,
      error: e,
    });
  }
});

ipcMain.handle(RouteMedia.GET_ICONS, async (_event, gameId, count) => {
  try {
    return MediaService.getMediaByType(MEDIA_TYPE.ICON, gameId, count);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteMedia.GET_ICONS,
      error: e,
    });
  }
});

ipcMain.handle(RouteMedia.GET_COVERS, async (_event, gameId, count) => {
  try {
    return await MediaService.getMediaByType(MEDIA_TYPE.COVER, gameId, count);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteMedia.GET_COVERS,
      error: e,
    });
  }
});

ipcMain.handle(RouteMedia.GET_TRAILERS, async (_event, gameId, count) => {
  try {
    return await MediaService.getMediaByType(MEDIA_TYPE.TRAILER, gameId, count);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteMedia.GET_TRAILERS,
      error: e,
    });
  }
});

ipcMain.handle(RouteMedia.GET_RECENTLY_PLAYED_BACKGROUNDS, async (_event, count) => {
  try {
    return await MediaService.getRecentlyPlayedBackgrounds(count);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteMedia.GET_RECENTLY_PLAYED_BACKGROUNDS,
      error: e,
    });
  }
});

ipcMain.handle(RouteMedia.GET_ACHIEVEMENTS, async (_event, gameId) => {
  try {
    return await MediaService.getMediaByType(MEDIA_TYPE.ACHIEVEMENT, gameId);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteMedia.GET_ACHIEVEMENTS,
      error: e,
    });
  }
});

ipcMain.handle(RouteMedia.GET_SCREENSHOTS, async (_event, gameId, count) => {
  try {
    return MediaService.getMediaByType(MEDIA_TYPE.SCREENSHOT, gameId, count);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteMedia.GET_SCREENSHOTS,
      error: e,
    });
  }
});

ipcMain.handle(RouteMedia.DELETE, async (_event, gameId, mediaType, mediaName) => {
  try {
    return MediaService.deleteMediaByGameIdAndMediaId(gameId, mediaType, mediaName);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteMedia.DELETE,
      error: e,
    });
  }
});

ipcMain.handle(RouteMedia.SEARCH, async (_event, gameId, mediaType, page) => {
  try {
    return MediaService.search(gameId, mediaType, page);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteMedia.SEARCH,
      error: e,
    });
  }
});

ipcMain.handle(RouteMedia.DOWNLOAD_BY_URL, async (_event, gameId, mediaType, url) => {
  try {
    await MediaService.downloadByUrl(gameId, mediaType, url);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteMedia.DOWNLOAD_BY_URL,
      error: e,
    });
  }
});

ipcMain.handle(RouteMedia.SET_DEFAULT, async (_event, gameId, mediaType, name) => {
  try {
    await MediaService.setDefault(gameId, mediaType, name);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteMedia.SET_DEFAULT,
      error: e,
    });
  }
});

ipcMain.handle(RouteMedia.REMOVE_DEFAULT, async (_event, gameId, mediaType) => {
  try {
    await MediaService.removeDefault(gameId, mediaType);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteMedia.REMOVE_DEFAULT,
      error: e,
    });
  }
});
