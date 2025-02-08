import { ipcMain } from "electron";
import log from "electron-log/main";
import { RouteLibrary } from "../../common/constant";
import { ErrorMessage } from "../../common/error";
import * as LibraryService from "../service/library";

ipcMain.handle(RouteLibrary.GET_GAME, async (_event, id) => {
  try {
    return await LibraryService.getGame(id);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
  }
});

ipcMain.handle(RouteLibrary.GET_GAMES, async (_event, filters, sort) => {
  try {
    return await LibraryService.getGames(filters, sort);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteLibrary.GET_LAST_PLAYED, async (_event, max) => {
  try {
    return await LibraryService.getLastPlayed(max);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteLibrary.GET_COUNT_STATUS, async (_event) => {
  try {
    return await LibraryService.getCountForAllStatus();
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteLibrary.GET_COUNT_STORE, async (_event) => {
  try {
    return await LibraryService.getCountForAllStatus();
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteLibrary.GET_STATUS, async (_event) => {
  try {
    return await LibraryService.getStatus();
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});
