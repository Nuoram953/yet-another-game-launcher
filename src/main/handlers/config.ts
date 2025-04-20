import { ipcMain } from "electron";
import _ from "lodash";
import { ConfigRoute } from "../../common/constant";
import log from "electron-log/main";
import * as ConfigService from "../service/config";
import { ErrorMessage } from "../../common/error";

ipcMain.handle(ConfigRoute.GET, async (_event, key) => {
  try {
    return await ConfigService.get(key);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(ConfigRoute.GET_ALL, async (_event) => {
  try {
    return await ConfigService.getAll();
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(ConfigRoute.SET, async (_event, key, value) => {
  try {
    return await ConfigService.set(key, value);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

