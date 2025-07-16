import { ipcMain } from "electron";
import log from "electron-log/main";
import { RouteLibrary } from "../../common/constant";
import { ErrorMessage } from "../../common/error";
import * as LibraryService from "./library.service";
import logger from "@main/logger";

ipcMain.handle(RouteLibrary.REFRESH, async (_event) => {
  try {
    await LibraryService.refresh();
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteLibrary.REFRESH,
      error: e,
    });
  }
});

ipcMain.handle(RouteLibrary.GET_STOREFRONTS, async (_event) => {
  try {
    return await LibraryService.getStorefronts();
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteLibrary.GET_STOREFRONTS,
      error: e,
    });
  }
});

ipcMain.handle(RouteLibrary.GET_DOWNLOAD_HISTORY, async (_event) => {
  try {
    return await LibraryService.getDownloadHistory();
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteLibrary.GET_DOWNLOAD_HISTORY,
      error: e,
    });
  }
});

ipcMain.handle(RouteLibrary.CLEAR_DOWNLOAD_HISTORY, async (_event) => {
  try {
    return await LibraryService.clearDownloadHistory();
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteLibrary.CLEAR_DOWNLOAD_HISTORY,
      error: e,
    });
  }
});

ipcMain.handle(RouteLibrary.GET_GAME, async (_event, id) => {
  try {
    return await LibraryService.getGame(id);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteLibrary.GET_GAME,
      error: e,
    });
  }
});

ipcMain.handle(RouteLibrary.GET_GAMES, async (_event, filters, sort) => {
  try {
    return await LibraryService.getGames(filters, sort);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteLibrary.GET_GAMES,
      error: e,
    });
  }
});

ipcMain.handle(RouteLibrary.GET_LAST_PLAYED, async (_event, max) => {
  try {
    return await LibraryService.getLastPlayed(max);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteLibrary.GET_LAST_PLAYED,
      error: e,
    });
  }
});

ipcMain.handle(RouteLibrary.GET_COUNT_STATUS, async (_event) => {
  try {
    return await LibraryService.getCountForAllStatus();
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteLibrary.GET_COUNT_STATUS,
      error: e,
    });
  }
});

ipcMain.handle(RouteLibrary.GET_COUNT_STORE, async (_event) => {
  try {
    return await LibraryService.getCountForAllStatus();
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteLibrary.GET_COUNT_STORE,
      error: e,
    });
  }
});

ipcMain.handle(RouteLibrary.GET_STATUS, async (_event) => {
  try {
    return await LibraryService.getStatus();
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteLibrary.GET_STATUS,
      error: e,
    });
  }
});

ipcMain.handle(RouteLibrary.GET_FILTERS, async (_event) => {
  try {
    return await LibraryService.getFilters();
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteLibrary.GET_FILTERS,
      error: e,
    });
  }
});

ipcMain.handle(RouteLibrary.SET_FILTER_PRESET, async (_event, data) => {
  try {
    return await LibraryService.setFilterPreset(data);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteLibrary.SET_FILTER_PRESET,
      error: e,
    });
  }
});

ipcMain.handle(RouteLibrary.DELETE_FILTER_PRESET, async (_event, name) => {
  try {
    return await LibraryService.deleteFilterPreset(name);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteLibrary.SET_FILTER_PRESET,
      error: e,
    });
  }
});

ipcMain.handle(RouteLibrary.GET_SIDEBAR, async (_event) => {
  try {
    return await LibraryService.getSidebarData();
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteLibrary.GET_SIDEBAR,
      error: e,
    });
  }
});
