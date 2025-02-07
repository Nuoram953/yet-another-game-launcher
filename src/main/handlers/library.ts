import { ipcMain } from "electron";
import  log  from "electron-log/main";
import { RouteLibrary } from "../../common/constant";
import { ErrorMessage } from "../../common/error";
import * as LibraryService from "../service/library"

ipcMain.handle(RouteLibrary.GET_COUNT_STATUS, async (_event) => {
  try {
    return LibraryService.getCountForAllStatus();
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteLibrary.GET_COUNT_STORE, async (_event) => {
  try {
    return LibraryService.getCountForAllStatus();
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});
