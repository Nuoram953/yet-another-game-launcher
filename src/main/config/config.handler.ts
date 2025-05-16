import { ipcMain } from "electron";
import _ from "lodash";
import { ConfigRoute } from "../../common/constant";
import log from "electron-log/main";
import * as ConfigService from "../config/config.service";
import { ErrorMessage } from "../../common/error";

ipcMain.handle(ConfigRoute.GET, async (_event, key) => {
  try {
    return await ConfigService.get(key);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: ConfigRoute.GET,
      error: e,
    });
  }
});

ipcMain.handle(ConfigRoute.GET_ALL, async (_event) => {
  try {
    return await ConfigService.getAll();
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: ConfigRoute.GET_ALL,
      error: e,
    });
  }
});

ipcMain.handle(ConfigRoute.SET, async (_event, key, value) => {
  try {
    return await ConfigService.set(key, value);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: ConfigRoute.SET,
      error: e,
    });
  }
});
